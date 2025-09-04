/**
 * @fileoverview API Routes - All REST endpoints
 * @author AI Girlfriend Project
 * @created 2025-01-15
 * 
 * @example
 * const apiRoutes = require('./apiRoutes');
 * app.use('/api', apiRoutes);
 */

const express = require('express');
const router = express.Router();
const { debugLog } = require('../../utils/helpers');

// Import controllers
const chatController = require('../../features/chat/ChatController');
const voiceController = require('../../features/voice/VoiceController');

/**
 * Chat endpoint - Process text messages
 */
router.post('/chat', async (req, res) => {
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

/**
 * Speech generation endpoint - Convert text to speech
 */
router.post('/speech', async (req, res) => {
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

/**
 * Transcribe audio using OpenAI Whisper
 */
router.post('/transcribe', (req, res, next) => {
  // Get upload middleware from app locals
  const upload = req.app.locals.upload;
  upload.single('audio')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error' });
    }

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
});

/**
 * Keyword extraction endpoint
 */
router.post('/extract-keywords', async (req, res) => {
  try {
    const { text, context = [] } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    debugLog('keywords', 'Extracting keywords', { textLength: text.length, contextCount: context.length });
    
    const openaiService = require('../../api/openai');
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

/**
 * Build context from memory endpoint
 */
router.post('/build-context', async (req, res) => {
  try {
    const { userQuery, memoryData } = req.body;
    
    if (!userQuery) {
      return res.status(400).json({ error: 'User query is required' });
    }

    const { buildContextFromMemory } = require('../../features/memory/ContextBuilder');
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

/**
 * Reset conversation state endpoint
 */
router.post('/reset-conversation', async (req, res) => {
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

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  const config = require('../../infrastructure/config/environment');
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

module.exports = router;