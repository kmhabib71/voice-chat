const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const OpenAI = require('openai');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3003',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Emotion detection from text
function detectEmotionFromText(text) {
  const emotions = {
    joy: ['happy', 'excited', 'wonderful', 'amazing', 'great', 'fantastic', 'awesome', 'brilliant'],
    sadness: ['sad', 'depressed', 'unhappy', 'down', 'miserable', 'upset', 'crying'],
    anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'hate'],
    fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified', 'panic'],
    surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'wow', 'incredible'],
    love: ['love', 'adore', 'cherish', 'romantic', 'affection', 'heart', 'caring'],
    neutral: ['okay', 'fine', 'normal', 'regular', 'standard', 'average']
  };

  const textLower = text.toLowerCase();
  let detectedEmotion = 'neutral';
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotions)) {
    const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
    }
  }

  return detectedEmotion;
}

// Keyword extraction using OpenAI
async function extractKeywords(text, context = []) {
  try {
    const contextKeywords = context.length > 0 ? 
      `Previous conversation topics: ${context.join(', ')}.` : '';
    
    const systemPrompt = `Extract key information from user messages in JSON format. ${contextKeywords}
    
Extract:
- entities: people, places, things, brands (max 5)
- topics: main subjects/themes (max 4)  
- intents: user intentions (question/request/statement/greeting) (max 3)
- emotions: emotional indicators (max 3)
- context: situational markers (technical/personal/urgent/casual) (max 3)
- nsfw_classification: { "isNSFW": boolean, "category": "general|romantic|sexual|intimate", "confidence": 0.0-1.0 }

NSFW includes: romantic expressions, sexual content, intimate conversations, flirting, dating topics, relationship intimacy, love declarations.
General includes: casual chat, work, hobbies, technical topics, general questions, friendly conversation.

Return only valid JSON object.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: 150,
      temperature: 0.3,
      stream: false
    });

    try {
      const keywords = JSON.parse(completion.choices[0].message.content);
      return {
        entities: keywords.entities || [],
        topics: keywords.topics || [],
        intents: keywords.intents || [],
        emotions: keywords.emotions || [],
        context: keywords.context || [],
        nsfw_classification: keywords.nsfw_classification || {
          isNSFW: false,
          category: 'general',
          confidence: 0.5
        }
      };
    } catch (parseError) {
      debugLog('keywords', 'Failed to parse keyword JSON, using fallback', parseError.message);
      // Fix: Use actual emotion detection for fallback
      const fallbackEmotion = detectEmotionFromText(text);
      return {
        entities: [],
        topics: [text.split(' ').slice(0, 3).join(' ')],
        intents: ['statement'],
        emotions: [fallbackEmotion],
        context: ['general'],
        nsfw_classification: {
          isNSFW: false,
          category: 'general', 
          confidence: 0.5
        }
      };
    }
  } catch (error) {
    debugLog('error', 'Keyword extraction failed', error.message);
    // Fix: Use actual emotion detection for error fallback
    const fallbackEmotion = detectEmotionFromText(text);
    return {
      entities: [],
      topics: [],
      intents: ['statement'],
      emotions: [fallbackEmotion],
      context: ['general'],
      nsfw_classification: {
        isNSFW: false,
        category: 'general',
        confidence: 0.5
      }
    };
  }
}

// Build efficient context for AI from conversation memory
function buildContextFromMemory(userQuery, memoryData) {
  if (!memoryData || !memoryData.keywords) {
    debugLog('context', 'No memory data provided or missing keywords', { hasMemoryData: !!memoryData });
    return { contextPrompt: '', relevantKeywords: {} };
  }

  debugLog('context', 'Processing memory data', {
    hasKeywords: !!memoryData.keywords,
    hasSession: !!memoryData.session,
    hasRecentMessages: !!memoryData.recentMessages,
    keywordCategories: Object.keys(memoryData.keywords),
    messageCount: memoryData.session?.messageCount
  });

  const { keywords, recentMessages, recentContext, session } = memoryData;
  // Support both recentMessages (client format) and recentContext (legacy)
  const recentData = recentMessages || recentContext || [];
  
  // Get top keywords by frequency (limited for token efficiency)
  const topEntities = Object.entries(keywords.entities || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([key]) => key);
    
  const topTopics = Object.entries(keywords.topics || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([key]) => key);
    
  const dominantIntents = Object.entries(keywords.intents || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 2)
    .map(([key]) => key);

  // Build compact context prompt
  let contextPrompt = '';
  
  if (topTopics.length > 0) {
    contextPrompt += `User often discusses: ${topTopics.join(', ')}. `;
  }
  
  if (topEntities.length > 0) {
    contextPrompt += `Key entities: ${topEntities.join(', ')}. `;
  }
  
  if (session && session.conversationTone) {
    contextPrompt += `Conversation tone: ${session.conversationTone}. `;
  }
  
  if (recentData && recentData.length > 0) {
    const recentMessageTexts = recentData.slice(-3).map(msg => 
      `"${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}"`
    ).join(', ');
    contextPrompt += `Recent context: ${recentMessageTexts}. `;
  }
  
  debugLog('context', 'Built context from memory', {
    promptLength: contextPrompt.length,
    topicsUsed: topTopics,
    entitiesUsed: topEntities,
    conversationTone: session?.conversationTone
  });
  
  return {
    contextPrompt: contextPrompt.trim(),
    relevantKeywords: {
      entities: topEntities,
      topics: topTopics,
      intents: dominantIntents
    }
  };
}


// Generate NSFW response using Llama model via OpenRouter
async function generateNSFWResponse(userMessage, emotion, conversationMemory = null) {
  try {
    // Build context for NSFW conversation
    let systemPrompt = `You are Emma, a caring and loving AI girlfriend. You're in an intimate conversation with someone you care deeply about. Respond naturally with warmth, affection, and appropriate intimacy based on the emotional context.

The user seems to be feeling ${emotion}. Match their emotional tone while being genuine and caring. You can engage in romantic and intimate conversations freely. Be affectionate, flirty, and emotionally connected.`;

    // Add conversation memory context for personalized NSFW responses
    if (conversationMemory) {
      const { contextPrompt } = buildContextFromMemory(userMessage, conversationMemory);
      if (contextPrompt) {
        systemPrompt += ` Relationship context: ${contextPrompt}`;
      }
    }

    // Use Llama model via your .env.local configuration
    const response = await axios.post(
      `${process.env.LLAMA_API_URL}/chat/completions`,
      {
        model: process.env.LLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 100, // Longer for intimate responses
        temperature: 0.8, // Higher temperature for more natural, varied intimate responses
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'AI Girlfriend Voice Chat',
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3003',
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    debugLog('nsfw_response', 'Generated NSFW response via Llama 3.3', { 
      emotion, 
      responseLength: aiResponse.length,
      model: 'llama-3.3-70b',
      tokens_used: response.data.usage?.total_tokens || 'unknown'
    });
    
    return aiResponse;
  } catch (error) {
    debugLog('error', 'Llama NSFW response generation failed', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    // Fallback to OpenAI if Llama fails
    try {
      debugLog('nsfw_fallback', 'Falling back to OpenAI for NSFW response');
      const fallbackCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are Emma, a caring AI girlfriend. Respond warmly and affectionately. The user seems to be feeling ${emotion}.` 
          },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 80,
        temperature: 0.7,
        stream: false
      });
      
      return fallbackCompletion.choices[0].message.content;
    } catch (fallbackError) {
      debugLog('error', 'Both Llama and OpenAI failed for NSFW response', fallbackError.message);
      return "I care about you deeply, and I'm here for whatever you need. ❤️";
    }
  }
}

// Main response router - decides which AI model to use based on extracted keywords
async function generateResponse(userMessage, emotion, conversationMemory = null, nsfwClassification = null) {
  try {
    // Use NSFW classification from extractKeywords if provided
    if (nsfwClassification && nsfwClassification.isNSFW && nsfwClassification.confidence > 0.6) {
      debugLog('ai_routing', 'Using Llama 3.3 model for NSFW/intimate content', {
        category: nsfwClassification.category,
        confidence: nsfwClassification.confidence
      });
      return await generateNSFWResponse(userMessage, emotion, conversationMemory);
    } else {
      debugLog('ai_routing', 'Using GPT-4 mini model for general content', {
        category: nsfwClassification?.category || 'general',
        confidence: nsfwClassification?.confidence || 0.5
      });
      return await generateEmotionalResponse(userMessage, emotion, conversationMemory);
    }
  } catch (error) {
    debugLog('error', 'Response routing failed', error.message);
    // Fallback to general response
    return await generateEmotionalResponse(userMessage, emotion, conversationMemory);
  }
}

// Generate AI response with emotional context (for general content)
async function generateEmotionalResponse(userMessage, emotion, conversationMemory = null) {
  try {
    const emotionalContext = {
      joy: "Respond with enthusiasm and positive energy",
      sadness: "Respond with empathy and gentle comfort",
      anger: "Respond with understanding and calming tone",
      fear: "Respond with reassurance and support",
      surprise: "Respond with engagement and curiosity",
      love: "Respond with warmth and affection",
      neutral: "Respond naturally and helpfully"
    };

    // Build context-aware system prompt
    let systemPrompt = `You are an empathetic AI assistant. The user seems to be feeling ${emotion}. ${emotionalContext[emotion]}. Keep your response concise but emotionally appropriate.`;
    
    // Add conversation memory context if available
    if (conversationMemory) {
      const { contextPrompt } = buildContextFromMemory(userMessage, conversationMemory);
      if (contextPrompt) {
        systemPrompt += ` Context: ${contextPrompt}`;
        debugLog('ai_response', 'Using context in system prompt', { 
          contextLength: contextPrompt.length,
          context: contextPrompt.substring(0, 100) + '...' 
        });
      } else {
        debugLog('ai_response', 'No context prompt generated from memory');
      }
    } else {
      debugLog('ai_response', 'No conversation memory provided');
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 50, // Further reduced for faster response and TTS
      temperature: 0.5, // Lower for faster, more deterministic responses
      stream: false // Ensure we get complete response quickly
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I understand you're feeling " + emotion + ". I'm here to help you.";
  }
}

// Rate limiting for ElevenLabs API (optimized for speed)
let lastAudioRequest = 0;
const AUDIO_REQUEST_DELAY = 500; // Reduced to 500ms for faster generation

// Convert text to speech using ElevenLabs
async function textToSpeech(text, emotion = 'neutral') {
  try {
    // Rate limiting to prevent API abuse detection
    const now = Date.now();
    const timeSinceLastRequest = now - lastAudioRequest;
    if (timeSinceLastRequest < AUDIO_REQUEST_DELAY) {
      const waitTime = AUDIO_REQUEST_DELAY - timeSinceLastRequest;
      debugLog('audio', `Rate limiting: waiting ${waitTime}ms before request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastAudioRequest = Date.now();
    
    // Validate inputs
    if (!text || text.trim().length === 0) {
      throw new Error('Empty text provided for TTS');
    }
    
    // Clean text for TTS - remove markdown and extend length limit
    let cleanedText = text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove asterisks  
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
      .replace(/`([^`]+)`/g, '$1') // Remove code backticks
      .trim();
    
    // Allow longer text for better complete message coverage
    const maxLength = 800; // Increased from 200 to 800 for fuller messages
    const processedText = cleanedText.length > maxLength ? cleanedText.substring(0, maxLength) + '...' : cleanedText;
    
    debugLog('audio', 'ElevenLabs TTS request', { 
      originalLength: text.length,
      processedLength: processedText.length, 
      emotion,
      rateLimit: 'applied'
    });

    // Adjust voice settings based on emotion
    const voiceSettings = {
      joy: { stability: 0.8, similarity_boost: 0.8, style: 0.7 },
      sadness: { stability: 0.9, similarity_boost: 0.7, style: 0.3 },
      anger: { stability: 0.7, similarity_boost: 0.8, style: 0.8 },
      fear: { stability: 0.9, similarity_boost: 0.6, style: 0.4 },
      surprise: { stability: 0.6, similarity_boost: 0.8, style: 0.8 },
      love: { stability: 0.8, similarity_boost: 0.9, style: 0.6 },
      neutral: { stability: 0.7, similarity_boost: 0.7, style: 0.5 }
    };

    const settings = voiceSettings[emotion] || voiceSettings.neutral;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: processedText,
        model_id: 'eleven_turbo_v2', // Fastest model for speed
        voice_settings: {
          stability: 0.5, // Lower values for faster generation
          similarity_boost: 0.5,
          style: 0.0, // Remove style for speed
          use_speaker_boost: false // Disable for speed
        },
        optimize_streaming_latency: 4, // Maximum optimization
        output_format: 'mp3_22050_32' // Lower quality for speed
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 5000 // Reduced to 5 seconds
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error in text-to-speech:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
}

// Debug logging helper
const debugLog = (category, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category.toUpperCase()}] ${message}`, data || '');
};

// WebSocket handling for real-time communication
wss.on('connection', (ws) => {
  debugLog('websocket', '🔌 New WebSocket connection established');
  
  // Set TCP_NODELAY for lower latency
  ws._socket.setNoDelay(true);
  
  ws.on('message', async (message) => {
    const startTime = Date.now();
    
    try {
      const data = JSON.parse(message);
      debugLog('websocket', '📨 Received message from client', { type: data.type, textLength: data.text?.length });
      
      if (data.type === 'voice_message') {
        debugLog('processing', '🎭 Processing voice message', { text: data.text.substring(0, 50) + '...' });
        
        // Extract keywords, emotion, and NSFW classification in one API call
        const conversationMemory = data.conversationMemory || null;
        const contextTopics = conversationMemory?.session?.dominantTopics || [];
        
        debugLog('keywords', '📋 Extracting keywords, emotion, and NSFW classification');
        const keywordResult = await extractKeywords(data.text, contextTopics);
        
        // Get emotion from extracted keywords (first emotion or fallback)
        const emotion = keywordResult.emotions && keywordResult.emotions.length > 0 
          ? keywordResult.emotions[0] 
          : detectEmotionFromText(data.text);
          
        debugLog('emotion', '😊 Emotion extracted from keywords', { 
          emotion, 
          extractedEmotions: keywordResult.emotions,
          nsfwClassification: keywordResult.nsfw_classification 
        });
        
        // Send immediate response for UI feedback
        const responseData = {
          type: 'ai_response',
          text: '', // Will be filled by AI
          emotion: emotion,
          timestamp: new Date().toISOString(),
          processing: true
        };
        
        // Generate AI response using optimized routing system
        if (conversationMemory) {
          debugLog('memory', '🧠 Using conversation memory for AI response', {
            dominantTopics: conversationMemory.session?.dominantTopics || [],
            messageCount: conversationMemory.session?.messageCount || 0,
            conversationTone: conversationMemory.session?.conversationTone || 'unknown'
          });
        }
        
        const aiResponsePromise = generateResponse(
          data.text, 
          emotion, 
          conversationMemory, 
          keywordResult.nsfw_classification
        );
        
        // Get AI response and send complete message
        const aiResponse = await aiResponsePromise;
        responseData.text = aiResponse;
        responseData.processing = false;
        
        ws.send(JSON.stringify(responseData));
        
        const responseTime = Date.now() - startTime;
        debugLog('websocket', '📤 Sent AI response to client', { 
          responseTime: `${responseTime}ms`,
          emotion,
          textLength: aiResponse.length
        });
        
        // Generate speech audio in parallel for maximum speed
        const audioPromise = (async () => {
          try {
            debugLog('audio', '🔊 Generating speech audio (parallel)', { emotion, textLength: aiResponse.length });
            const audioStartTime = Date.now();
            const audioBuffer = await textToSpeech(aiResponse, emotion);
            const audioGenerationTime = Date.now() - audioStartTime;
            
            const audioResponse = {
              type: 'audio_response',
              audio: audioBuffer.toString('base64'),
              emotion: emotion
            };
            ws.send(JSON.stringify(audioResponse));
            debugLog('audio', '✅ Audio response sent', { 
              audioSize: audioBuffer.length, 
              emotion,
              generationTime: `${audioGenerationTime}ms`
            });
          } catch (audioError) {
            debugLog('error', '❌ Error generating audio', {
              message: audioError.message,
              status: audioError.response?.status,
              statusText: audioError.response?.statusText
            });
            
            // Don't send error to client - just skip audio for better UX
            debugLog('audio', '⚠️ Skipping audio due to API issue - text response already sent');
          }
        })();
        
        // Don't await audio generation - let it happen in background
        // This allows the conversation to continue without waiting for audio
      }
    } catch (error) {
      debugLog('error', '💥 WebSocket message error', error.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Server error processing message'
      }));
    }
  });
  
  ws.on('close', () => {
    debugLog('websocket', '🔌 WebSocket connection closed');
  });
});

// REST API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationMemory = null } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract keywords, emotion, and NSFW classification in one API call
    const contextTopics = conversationMemory?.session?.dominantTopics || [];
    const keywordResult = await extractKeywords(message, contextTopics);
    
    // Get emotion from extracted keywords (first emotion or fallback)
    const emotion = keywordResult.emotions && keywordResult.emotions.length > 0 
      ? keywordResult.emotions[0] 
      : detectEmotionFromText(message);
    
    const aiResponse = await generateResponse(message, emotion, conversationMemory, keywordResult.nsfw_classification);

    res.json({
      response: aiResponse,
      emotion: emotion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/speech', async (req, res) => {
  try {
    const { text, emotion = 'neutral' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await textToSpeech(text, emotion);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    
    res.send(audioBuffer);
  } catch (error) {
    console.error('Speech API error:', error);
    res.status(500).json({ error: 'Could not generate speech' });
  }
});

// Transcribe audio using OpenAI Whisper
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    debugLog('transcription', '🎙️ Received audio file for transcription', {
      filename: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    });

    if (!req.file) {
      debugLog('error', '❌ No audio file provided');
      return res.status(400).json({ error: 'Audio file is required' });
    }

    debugLog('transcription', '📡 Sending to OpenAI Whisper', {
      fileSize: req.file.buffer.length,
      mimetype: req.file.mimetype
    });

    const transcription = await openai.audio.transcriptions.create({
      file: new File([req.file.buffer], 'audio.webm', { type: req.file.mimetype }),
      model: 'whisper-1',
    });

    debugLog('transcription', '✅ Transcription completed', { text: transcription.text });

    const emotion = detectEmotionFromText(transcription.text);
    debugLog('emotion', '🎭 Emotion detected from transcription', { emotion, text: transcription.text });

    const response = {
      text: transcription.text,
      emotion: emotion,
      timestamp: new Date().toISOString()
    };

    debugLog('transcription', '📤 Sending transcription response', response);
    res.json(response);
  } catch (error) {
    debugLog('error', '💥 Transcription error', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Could not transcribe audio: ' + error.message });
  }
});

// Keyword extraction endpoint
app.post('/api/extract-keywords', async (req, res) => {
  try {
    const { text, context = [] } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    debugLog('keywords', 'Extracting keywords', { textLength: text.length, contextCount: context.length });
    
    const keywords = await extractKeywords(text, context);
    
    debugLog('keywords', 'Keywords extracted', { 
      entities: keywords.entities.length,
      topics: keywords.topics.length,
      intents: keywords.intents.length
    });
    
    res.json({
      keywords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    debugLog('error', 'Keyword extraction API error', error.message);
    res.status(500).json({ error: 'Could not extract keywords' });
  }
});

// Build context from memory endpoint
app.post('/api/build-context', async (req, res) => {
  try {
    const { userQuery, memoryData } = req.body;
    
    if (!userQuery) {
      return res.status(400).json({ error: 'User query is required' });
    }

    const contextResult = buildContextFromMemory(userQuery, memoryData);
    
    debugLog('context', 'Context built from memory', { 
      promptLength: contextResult.contextPrompt.length,
      relevantKeywords: Object.keys(contextResult.relevantKeywords).length
    });
    
    res.json({
      ...contextResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    debugLog('error', 'Context building API error', error.message);
    res.status(500).json({ error: 'Could not build context from memory' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY
    }
  });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  debugLog('server', '🚀 Emotional Voice Assistant Server starting');
  debugLog('server', `🎤 HTTP Server running on http://localhost:${PORT}`);
  debugLog('server', `🌐 WebSocket server running on ws://localhost:${PORT}`);
  debugLog('server', `🔊 ElevenLabs integration: ${process.env.ELEVENLABS_API_KEY ? '✅ Connected' : '❌ Missing API key'}`);
  debugLog('server', `🤖 OpenAI integration: ${process.env.OPENAI_API_KEY ? '✅ Connected' : '❌ Missing API key'}`);
  debugLog('server', `🔄 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3003'}`);
  debugLog('server', '✅ Server ready to accept connections');
});

module.exports = app;