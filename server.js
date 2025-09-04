/**
 * @fileoverview Main server entry point - AI Girlfriend Voice Chat
 * @author AI Girlfriend Project  
 * @created 2024-01-15
 * 
 * Architecture: Clean separation with /lib organization
 * - Features handle business logic
 * - Core handles AI intelligence
 * - API handles external services
 * - Infrastructure handles system concerns
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');

// Load configuration and validate environment
const config = require('./lib/infrastructure/config/environment');
const { debugLog } = require('./lib/utils/helpers');

// Initialize services
const chatController = require('./lib/features/chat/ChatController');
const voiceController = require('./lib/features/voice/VoiceController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.server.corsOrigin,
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: config.server.corsOrigin,
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

// Socket.io handling for real-time communication
io.on('connection', (socket) => {
  debugLog('socketio', '🔌 New Socket.io connection established', { socketId: socket.id });
  
  // Generate session ID for this connection
  const { generateSessionId } = require('./lib/utils/helpers');
  const sessionId = generateSessionId();
  socket.sessionId = sessionId;
  debugLog('socketio', 'Assigned session ID', { sessionId, socketId: socket.id });
  
  // Handle voice messages
  socket.on('voice_message', async (data) => {
    const startTime = Date.now();
    
    try {
      debugLog('socketio', '📨 Received voice message', { 
        type: data.type, 
        textLength: data.text?.length,
        socketId: socket.id
      });
      
      debugLog('processing', '🎭 Processing voice message', { 
        sessionId, 
        text: data.text.substring(0, 50) + '...',
        socketId: socket.id
      });
      
      const conversationMemory = data.conversationMemory || null;
      
      // Process message through chat controller
      const chatResponse = await chatController.processMessage(data.text, sessionId, conversationMemory);
      
      // Send AI response
      const responseData = {
        text: chatResponse.response,
        emotion: chatResponse.emotion,
        timestamp: new Date().toISOString(),
        processing: false
      };
      
      socket.emit('ai_response', responseData);
      
      const responseTime = Date.now() - startTime;
      debugLog('socketio', '📤 Sent AI response to client', { 
        responseTime: `${responseTime}ms`,
        emotion: chatResponse.emotion,
        textLength: chatResponse.response.length,
        socketId: socket.id
      });
      
      // Generate speech audio in parallel
      const audioPromise = (async () => {
        try {
          debugLog('audio', '🔊 Generating speech audio (parallel)', { 
            emotion: chatResponse.emotion,
            socketId: socket.id
          });
          const audioStartTime = Date.now();
          const audioBuffer = await voiceController.generateSpeech(chatResponse.response, chatResponse.emotion);
          const audioGenerationTime = Date.now() - audioStartTime;
          
          const audioResponse = {
            audio: audioBuffer.toString('base64'),
            emotion: chatResponse.emotion
          };
          socket.emit('audio_response', audioResponse);
          debugLog('audio', '✅ Audio response sent', { 
            audioSize: audioBuffer.length, 
            emotion: chatResponse.emotion,
            generationTime: `${audioGenerationTime}ms`,
            socketId: socket.id
          });
        } catch (audioError) {
          debugLog('error', '❌ Error generating audio', {
            message: audioError.message,
            socketId: socket.id
          });
          // Don't send error to client - just skip audio for better UX
          debugLog('audio', '⚠️ Skipping audio due to API issue - text response already sent');
        }
      })();
      
      // Don't await audio generation - let it happen in background
    } catch (error) {
      debugLog('error', '💥 Socket.io message error', { 
        error: error.message,
        socketId: socket.id
      });
      socket.emit('error', {
        message: 'Server error processing message'
      });
    }
  });
  
  socket.on('disconnect', (reason) => {
    debugLog('socketio', '🔌 Socket.io connection closed', { 
      reason,
      socketId: socket.id,
      sessionId: socket.sessionId
    });
  });
  
  socket.on('error', (error) => {
    debugLog('error', '❌ Socket.io connection error', {
      error: error.message,
      socketId: socket.id,
      sessionId: socket.sessionId
    });
  });
});

// REST API Routes

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationMemory = null, sessionId = null } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await chatController.processMessage(message, sessionId, conversationMemory);
    res.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Speech generation endpoint
app.post('/api/speech', async (req, res) => {
  try {
    const { text, emotion = 'neutral' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await voiceController.generateSpeech(text, emotion);
    
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

    const result = await voiceController.processAudioMessage(
      req.file.buffer, 
      req.file.mimetype,
      null, // conversationMemory
      null  // sessionId
    );

    debugLog('transcription', '📤 Sending transcription response', result);
    res.json(result);
  } catch (error) {
    debugLog('error', '💥 Transcription error', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
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
    
    const openaiService = require('./lib/api/openai');
    const keywords = await openaiService.extractKeywords(text, context);
    
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

    const { buildContextFromMemory } = require('./lib/features/memory/ContextBuilder');
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

// Reset conversation state endpoint
app.post('/api/reset-conversation', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const success = chatController.resetConversationState(sessionId);
    
    res.json({ 
      success, 
      message: success ? 'Conversation state reset' : 'No conversation state found for session',
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    debugLog('error', 'Conversation reset error', error.message);
    res.status(500).json({ error: 'Could not reset conversation state' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const stats = chatController.getStatistics();
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!config.openai.apiKey,
      elevenlabs: !!config.elevenlabs.apiKey,
      llama: !!(config.llama.apiUrl && config.llama.apiKey)
    },
    activeConversations: stats.activeConversations,
    conversationModes: stats.modeBreakdown,
    features: {
      memoryV2: config.features.memoryV2Enabled,
      emotionalIntelligence: config.features.emotionalIntelligenceEnabled
    }
  });
});

// Start server
server.listen(config.server.port, () => {
  debugLog('server', '🚀 Emotional Voice Assistant Server starting');
  debugLog('server', `🎤 HTTP Server running on http://localhost:${config.server.port}`);
  debugLog('server', `🌐 Socket.io server running on http://localhost:${config.server.port}`);
  debugLog('server', `🔊 ElevenLabs integration: ${config.elevenlabs.apiKey ? '✅ Connected' : '❌ Missing API key'}`);
  debugLog('server', `🤖 OpenAI integration: ${config.openai.apiKey ? '✅ Connected' : '❌ Missing API key'}`);
  debugLog('server', `🦙 Llama integration: ${config.llama.apiKey ? '✅ Connected' : '❌ Not configured'}`);
  debugLog('server', `🔄 CORS origin: ${config.server.corsOrigin}`);
  debugLog('server', `📁 Architecture: Clean /lib organization enabled`);
  debugLog('server', '✅ Server ready to accept connections');
});

module.exports = app;