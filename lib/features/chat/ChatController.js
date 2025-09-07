/**
 * @fileoverview Chat business logic and message processing with Memory v2 integration
 * @author AI Girlfriend Project  
 * @created 2024-01-15
 * @updated 2025-09-05 - Integrated Memory v2 system
 * 
 * @example
 * const chatController = require('./ChatController');
 * const response = await chatController.processMessage(message, sessionId, userId);
 */

const { v4: uuidv4 } = require('uuid');
const memoryManager = require('../../core/memory');

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
   * Process incoming chat message with AI routing and Memory v2 integration
   * @param {string} message - User message
   * @param {string} sessionId - Session identifier
   * @param {string} userId - User identifier for memory system
   * @returns {Promise<Object>} Response object with AI text, emotion, and metadata
   */
  async processMessage(message, sessionId, userId = 'default') {
    try {
      console.log('\n🎯 === CHAT CONTROLLER: processMessage START ===');
      console.log(`📝 Input: "${message}"`);
      console.log(`👤 UserId: ${userId}`);
      console.log(`🔗 SessionId: ${sessionId}`);
      
      if (!message || !message.trim()) {
        throw new Error('Message is required');
      }

      // Use provided sessionId or generate new one
      const activeSessionId = sessionId || uuidv4();
      console.log(`🆔 Active SessionId: ${activeSessionId}`);
      
      const conversationState = this.getConversationState(activeSessionId);
      console.log(`💬 Conversation State: ${JSON.stringify(conversationState)}`);
      
      let keywordResult = null;
      let emotion = 'neutral';

      // Get comprehensive memories for context (replaced old conversationMemory)
      console.log('\n🧠 === MEMORY RETRIEVAL PHASE ===');
      const [recentMemories, userFacts] = await Promise.all([
        memoryManager.retrieveRecentMemories(userId, 3),
        memoryManager.getUserFacts(userId, ['personal_facts', 'preferences']).catch(() => [])
      ]);
      
      // Episodic memories will be retrieved after keyword extraction to reuse analysis
      
      console.log(`📚 Recent memories count: ${recentMemories.length}`);
      recentMemories.forEach((mem, i) => {
        const preview = mem.summary || 
                       (mem.messages && mem.messages.length > 0 ? 
                        mem.messages[mem.messages.length-1].content?.substring(0, 50) : 'No content') ||
                       'Empty memory';
        const type = mem.memoryType || mem.type || 'unknown';
        console.log(`  Recent ${i+1}: "${preview}" (${type})`);
      });
      
      console.log(`🧠 User facts count: ${userFacts.length}`);
      userFacts.forEach((fact, i) => {
        console.log(`  Fact ${i+1}: ${fact.key} = "${fact.value}" (${fact.category})`);
      });
      
      const contextTopics = this._extractTopicsFromRecentMemories(recentMemories);
      console.log(`🏷️  Context topics: [${contextTopics.join(', ')}]`);

      // Always extract keywords for memory retrieval, regardless of mode
      console.log('\n🔍 === KEYWORD EXTRACTION PHASE ===');
      console.log('🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...');
      const openaiService = require('../../api/openai');
      
      // For NSFW mode, we still need keywords for memory but use different response generation
      keywordResult = await openaiService.extractKeywords(message, contextTopics);
      console.log('📊 Keyword extraction result:', JSON.stringify(keywordResult, null, 2));
      
      // Get emotion from extracted keywords
      emotion = keywordResult.emotions && keywordResult.emotions.length > 0 
        ? keywordResult.emotions[0] 
        : this.detectEmotionFromText(message);
      console.log(`😊 Emotion detected: ${emotion} (from keywords, mode: ${conversationState.mode})`);
      
      if (conversationState.mode === 'nsfw') {
        console.log('ℹ️  NSFW mode: Using keywords for memory retrieval, Llama for response generation');
      }

      // Get relevant episodic memories using extracted keywords (no extra API calls!)
      let episodicMemories = [];
      try {
        console.log('🔍 Retrieving episodic memories with existing keyword analysis...');
        episodicMemories = await memoryManager.searchEpisodicMemories(userId, message, 2, keywordResult);
        console.log(`✅ Found ${episodicMemories.length} relevant episodic memories via intelligent search`);
        episodicMemories.forEach((episode, i) => {
          console.log(`  Episode ${i+1}: "${episode.summary?.substring(0, 50)}..." (${episode.importance || 'unknown'})`);
        });
      } catch (error) {
        console.log('⚠️ Episodic search failed, falling back to recent memories');
        episodicMemories = await memoryManager.getEpisodicMemories(userId, 2).catch(() => []);
      }
      
      // Generate AI response using Memory v2 system with retrieved memory context
      console.log('\n🤖 === AI RESPONSE GENERATION PHASE ===');
      console.log(`🎭 Generating response for emotion: ${emotion}`);
      const memoryContext = {
        recentMemories,
        userFacts,
        episodicMemories,
        userId,
        contextBuilt: true
      };
      const aiResponse = await this.generateResponse(
        message, 
        emotion, 
        userId,
        keywordResult?.nsfw_classification,
        activeSessionId,
        memoryContext
      );
      console.log(`💬 AI Response: "${aiResponse}"`);

      // Store conversation in Memory v2 with context-aware routing
      console.log('\n💾 === MEMORY STORAGE PHASE ===');
      await this._storeConversationMemory(
        userId, 
        message, 
        aiResponse, 
        emotion, 
        keywordResult, 
        activeSessionId
      );

      const result = {
        response: aiResponse,
        emotion: emotion,
        sessionId: activeSessionId,
        conversationMode: conversationState.mode,
        timestamp: new Date().toISOString(),
        keywords: keywordResult,
        memoryUpdated: true
      };
      
      console.log('✅ === CHAT CONTROLLER: processMessage COMPLETE ===\n');
      return result;
    } catch (error) {
      console.error('Chat processing error:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Main response router - decides which AI model to use with Memory v2 integration
   * @param {string} userMessage - User's input message
   * @param {string} emotion - Detected emotion
   * @param {string} userId - User identifier for memory context
   * @param {Object} nsfwClassification - NSFW classification result
   * @param {string} sessionId - Session identifier
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, emotion, userId, nsfwClassification = null, sessionId = null, providedMemoryContext = null) {
    try {
      const conversationState = sessionId ? this.getConversationState(sessionId) : null;
      
      // Use provided memory context or build new one
      const memoryContext = providedMemoryContext || await this._buildMemoryContext(userId);
      console.log('🧠 Using memory context:', providedMemoryContext ? 'provided from processMessage' : 'rebuilt in generateResponse');
      
      // If already in NSFW mode, continue using Llama without re-checking
      if (conversationState && conversationState.mode === 'nsfw') {
        console.log(`[AI_ROUTING] Continuing NSFW conversation with Llama 3.3 (no re-check) - sessionId: ${sessionId}`);
        const llamaService = require('../../api/llama');
        return await llamaService.generateNSFWResponse(userMessage, emotion, memoryContext);
      }
      
      // First-time NSFW classification check (only for general mode or no session)
      if (nsfwClassification && nsfwClassification.isNSFW && nsfwClassification.confidence > 0.6) {
        // Switch to NSFW mode for this session
        if (conversationState) {
          conversationState.mode = 'nsfw';
          console.log(`[AI_ROUTING] Switched to NSFW mode - sessionId: ${sessionId}, category: ${nsfwClassification.category}`);
        }
        const llamaService = require('../../api/llama');
        return await llamaService.generateNSFWResponse(userMessage, emotion, memoryContext);
      } else {
        console.log(`[AI_ROUTING] Using GPT-4 mini for general content - sessionId: ${sessionId}`);
        const openaiService = require('../../api/openai');
        return await openaiService.generateEmotionalResponse(userMessage, emotion, memoryContext);
      }
    } catch (error) {
      console.error('Response routing failed:', error.message);
      // Fallback to general response without memory context
      const openaiService = require('../../api/openai');
      return await openaiService.generateEmotionalResponse(userMessage, emotion, null);
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

  // Helper methods for Memory v2 integration

  /**
   * Extract topics from recent memories for context
   * @private
   */
  _extractTopicsFromRecentMemories(recentMemories) {
    if (!recentMemories || recentMemories.length === 0) return [];
    
    try {
      const topics = [];
      recentMemories.forEach(memory => {
        if (memory.metadata?.topics) {
          topics.push(...memory.metadata.topics);
        }
      });
      
      // Return unique topics, limited to 5 most recent
      return [...new Set(topics)].slice(0, 5);
    } catch (error) {
      console.error('Error extracting topics from recent memories:', error);
      return [];
    }
  }

  /**
   * Build memory context for AI response generation
   * @private
   */
  async _buildMemoryContext(userId) {
    try {
      // Get comprehensive memory context
      const [recentMemories, userFacts, episodicMemories] = await Promise.all([
        memoryManager.retrieveRecentMemories(userId, 3),
        memoryManager.getUserFacts(userId, ['preferences', 'personal_facts']).catch(() => []),
        memoryManager.getEpisodicMemories(userId, 3).catch(() => [])
      ]);

      return {
        recentMemories,
        userFacts,
        episodicMemories,
        userId,
        contextBuilt: true
      };
    } catch (error) {
      console.error('Error building memory context:', error);
      return { contextBuilt: false };
    }
  }

  /**
   * Store conversation in Memory v2 with context-aware routing
   * @private
   */
  async _storeConversationMemory(userId, message, response, emotion, keywordResult, sessionId) {
    try {
      const context = {
        sessionId,
        emotion,
        extractedKeywords: keywordResult,
        timestamp: new Date(),
        conversationId: sessionId
      };

      // Use context-aware storage routing
      await memoryManager.storeWithImportance(
        userId,
        message,
        response,
        context,
        'auto' // Let the system decide based on context and importance
      );

      console.log(`[MEMORY_V2] Conversation stored with context-aware routing - userId: ${userId}, sessionId: ${sessionId}`);
    } catch (error) {
      console.error('Error storing conversation memory:', error);
      // Don't throw - this shouldn't break the conversation flow
    }
  }
}

module.exports = new ChatController();