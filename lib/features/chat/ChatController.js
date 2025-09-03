/**
 * @fileoverview Chat business logic and message processing
 * @author AI Girlfriend Project  
 * @created 2024-01-15
 * 
 * @example
 * const chatController = require('./ChatController');
 * const response = await chatController.processMessage(message, sessionId, memory);
 */

const { v4: uuidv4 } = require('uuid');

class ChatController {
  constructor() {
    // Conversation state tracking for NSFW mode persistence
    this.conversationStates = new Map(); // sessionId -> { mode: 'general'|'nsfw', lastActivity: timestamp }
    
    // Clean up old conversation states every 10 minutes
    setInterval(() => {
      this.cleanupExpiredStates();
    }, 10 * 60 * 1000);
  }

  /**
   * Process incoming chat message with AI routing
   * @param {string} message - User message
   * @param {string} sessionId - Session identifier
   * @param {Object} conversationMemory - Conversation memory context
   * @returns {Promise<Object>} Response object with AI text, emotion, and metadata
   */
  async processMessage(message, sessionId, conversationMemory = null) {
    try {
      if (!message || !message.trim()) {
        throw new Error('Message is required');
      }

      // Use provided sessionId or generate new one
      const activeSessionId = sessionId || uuidv4();
      const conversationState = this.getConversationState(activeSessionId);
      let keywordResult = null;
      let emotion = 'neutral';

      // Only extract keywords if NOT in NSFW mode (to avoid GPT-4 mini filtering)
      if (conversationState.mode !== 'nsfw') {
        const openaiService = require('../../api/openai');
        const contextTopics = conversationMemory?.session?.dominantTopics || [];
        keywordResult = await openaiService.extractKeywords(message, contextTopics);
        
        // Get emotion from extracted keywords
        emotion = keywordResult.emotions && keywordResult.emotions.length > 0 
          ? keywordResult.emotions[0] 
          : this.detectEmotionFromText(message);
      } else {
        // In NSFW mode - just detect emotion directly
        emotion = this.detectEmotionFromText(message);
      }
      
      // Generate AI response using optimized routing system
      const aiResponse = await this.generateResponse(
        message, 
        emotion, 
        conversationMemory, 
        keywordResult?.nsfw_classification,
        activeSessionId
      );

      return {
        response: aiResponse,
        emotion: emotion,
        sessionId: activeSessionId,
        conversationMode: conversationState.mode,
        timestamp: new Date().toISOString(),
        keywords: keywordResult
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Main response router - decides which AI model to use
   * @param {string} userMessage - User's input message
   * @param {string} emotion - Detected emotion
   * @param {Object} conversationMemory - Conversation memory context
   * @param {Object} nsfwClassification - NSFW classification result
   * @param {string} sessionId - Session identifier
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, emotion, conversationMemory = null, nsfwClassification = null, sessionId = null) {
    try {
      const conversationState = sessionId ? this.getConversationState(sessionId) : null;
      
      // If already in NSFW mode, continue using Llama without re-checking
      if (conversationState && conversationState.mode === 'nsfw') {
        console.log(`[AI_ROUTING] Continuing NSFW conversation with Llama 3.3 (no re-check) - sessionId: ${sessionId}`);
        const llamaService = require('../../api/llama');
        return await llamaService.generateNSFWResponse(userMessage, emotion, conversationMemory);
      }
      
      // First-time NSFW classification check (only for general mode or no session)
      if (nsfwClassification && nsfwClassification.isNSFW && nsfwClassification.confidence > 0.6) {
        // Switch to NSFW mode for this session
        if (conversationState) {
          conversationState.mode = 'nsfw';
          console.log(`[AI_ROUTING] Switched to NSFW mode - sessionId: ${sessionId}, category: ${nsfwClassification.category}`);
        }
        const llamaService = require('../../api/llama');
        return await llamaService.generateNSFWResponse(userMessage, emotion, conversationMemory);
      } else {
        console.log(`[AI_ROUTING] Using GPT-4 mini for general content - sessionId: ${sessionId}`);
        const openaiService = require('../../api/openai');
        return await openaiService.generateEmotionalResponse(userMessage, emotion, conversationMemory);
      }
    } catch (error) {
      console.error('Response routing failed:', error.message);
      // Fallback to general response
      const openaiService = require('../../api/openai');
      return await openaiService.generateEmotionalResponse(userMessage, emotion, conversationMemory);
    }
  }

  /**
   * Get or initialize conversation state
   * @param {string} sessionId - Session identifier
   * @returns {Object} Conversation state object
   */
  getConversationState(sessionId) {
    if (!this.conversationStates.has(sessionId)) {
      this.conversationStates.set(sessionId, {
        mode: 'general',
        lastActivity: Date.now()
      });
    }
    const state = this.conversationStates.get(sessionId);
    state.lastActivity = Date.now();
    return state;
  }

  /**
   * Reset conversation state for a session
   * @param {string} sessionId - Session identifier
   * @returns {boolean} Success status
   */
  resetConversationState(sessionId) {
    if (this.conversationStates.has(sessionId)) {
      this.conversationStates.delete(sessionId);
      console.log(`[CONVERSATION] Manual conversation reset - sessionId: ${sessionId}`);
      return true;
    }
    return false;
  }

  /**
   * Clean up expired conversation states
   */
  cleanupExpiredStates() {
    const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour
    for (const [sessionId, state] of this.conversationStates.entries()) {
      if (state.lastActivity < cutoffTime) {
        this.conversationStates.delete(sessionId);
        console.log(`[CLEANUP] Removed expired conversation state - sessionId: ${sessionId}`);
      }
    }
  }

  /**
   * Simple emotion detection from text
   * @param {string} text - Text to analyze
   * @returns {string} Detected emotion
   */
  detectEmotionFromText(text) {
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

  /**
   * Get conversation statistics
   * @returns {Object} Statistics about active conversations
   */
  getStatistics() {
    return {
      activeConversations: this.conversationStates.size,
      modeBreakdown: {
        general: Array.from(this.conversationStates.values()).filter(s => s.mode === 'general').length,
        nsfw: Array.from(this.conversationStates.values()).filter(s => s.mode === 'nsfw').length
      }
    };
  }
}

module.exports = new ChatController();