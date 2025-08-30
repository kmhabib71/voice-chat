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

// Generate AI response with emotional context
async function generateEmotionalResponse(userMessage, emotion) {
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

    const systemPrompt = `You are an empathetic AI assistant. The user seems to be feeling ${emotion}. ${emotionalContext[emotion]}. Keep your response concise but emotionally appropriate.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I understand you're feeling " + emotion + ". I'm here to help you.";
  }
}

// Convert text to speech using ElevenLabs
async function textToSpeech(text, emotion = 'neutral') {
  try {
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
        text: text,
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
        voice_settings: settings
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error in text-to-speech:', error.response?.data || error.message);
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
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      debugLog('websocket', '📨 Received message from client', data);
      
      if (data.type === 'voice_message') {
        debugLog('processing', '🎭 Processing voice message', { text: data.text });
        
        // Process voice message
        const emotion = detectEmotionFromText(data.text);
        debugLog('emotion', '😊 Emotion detected', { emotion, text: data.text });
        
        const aiResponse = await generateEmotionalResponse(data.text, emotion);
        debugLog('ai', '🤖 AI response generated', { response: aiResponse, emotion });
        
        // Send response back to client
        const responseData = {
          type: 'ai_response',
          text: aiResponse,
          emotion: emotion,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(responseData));
        debugLog('websocket', '📤 Sent AI response to client', responseData);
        
        // Generate speech audio
        try {
          debugLog('audio', '🔊 Generating speech audio', { emotion, textLength: aiResponse.length });
          const audioBuffer = await textToSpeech(aiResponse, emotion);
          
          const audioResponse = {
            type: 'audio_response',
            audio: audioBuffer.toString('base64'),
            emotion: emotion
          };
          ws.send(JSON.stringify(audioResponse));
          debugLog('audio', '✅ Audio response sent', { 
            audioSize: audioBuffer.length, 
            base64Size: audioResponse.audio.length,
            emotion 
          });
        } catch (audioError) {
          debugLog('error', '❌ Error generating audio', audioError);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Could not generate audio response'
          }));
        }
      }
    } catch (error) {
      debugLog('error', '💥 WebSocket message error', error);
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
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const emotion = detectEmotionFromText(message);
    const aiResponse = await generateEmotionalResponse(message, emotion);

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