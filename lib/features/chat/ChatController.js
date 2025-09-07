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
const enhancedContextBuilder = require('../memory/EnhancedContextBuilder');

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
      
      // Generate AI response using Enhanced Context Builder (Task Group 1.4)
      console.log('\n🤖 === AI RESPONSE GENERATION PHASE ===');
      console.log(`🎭 Generating response for emotion: ${emotion}`);
      
      // Build enhanced memory context with semantic search
      const enhancedMemoryContext = await enhancedContextBuilder.buildEnhancedContext(userId, message);
      
      const aiResponse = await this.generateResponse(
        message, 
        emotion, 
        userId,
        keywordResult?.nsfw_classification,
        activeSessionId,
        enhancedMemoryContext
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

      // Update emotional state tracking (Task Group 1.4)
      console.log('\n😊 === EMOTIONAL STATE UPDATE ===');
      await this._updateEmotionalState(
        userId,
        emotion,
        {
          sessionId: activeSessionId,
          message: message,
          response: aiResponse,
          conversationMode: conversationState.mode,
          keywordAnalysis: keywordResult
        }
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
      
      // Use provided memory context or build new enhanced context
      const memoryContext = providedMemoryContext || await this._buildEnhancedMemoryContext(userId, userMessage);
      console.log('🧠 Using memory context:', providedMemoryContext ? 'provided from processMessage' : 'rebuilt with Enhanced Context Builder');
      
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
   * Build enhanced memory context using Enhanced Context Builder (Task Group 1.4)
   * @private
   */
  async _buildEnhancedMemoryContext(userId, userMessage) {
    try {
      console.log('🧠 Building enhanced memory context with semantic search...');
      
      // Use Enhanced Context Builder for comprehensive context
      const enhancedContext = await enhancedContextBuilder.buildEnhancedContext(userId, userMessage);
      
      console.log('✅ Enhanced memory context built successfully');
      return enhancedContext;
      
    } catch (error) {
      console.error('❌ Enhanced context building failed, falling back to basic context:', error);
      return await this._buildBasicMemoryContext(userId);
    }
  }

  /**
   * Build basic memory context as fallback (maintains backward compatibility)
   * @private
   */
  async _buildBasicMemoryContext(userId) {
    try {
      console.log('🔄 Building basic memory context (fallback mode)...');
      
      // Get basic memory context without semantic search
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
        contextBuilt: true,
        fallbackMode: true
      };
    } catch (error) {
      console.error('❌ Basic memory context building failed:', error);
      return { 
        contextBuilt: false, 
        userId,
        error: error.message 
      };
    }
  }

  /**
   * Legacy method maintained for backward compatibility
   * @deprecated Use _buildEnhancedMemoryContext instead
   * @private
   */
  async _buildMemoryContext(userId) {
    console.log('⚠️ Using deprecated _buildMemoryContext, consider upgrading to Enhanced Context Builder');
    return await this._buildBasicMemoryContext(userId);
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

  /**
   * Update emotional state tracking (Task Group 1.4)
   * @private
   */
  async _updateEmotionalState(userId, emotion, context) {
    try {
      console.log(`😊 Updating emotional state for user ${userId}: ${emotion}`);
      
      // Determine relationship progression based on conversation patterns
      const currentState = this.getConversationState(context.sessionId);
      const isNSFWMode = currentState.mode === 'nsfw';
      
      // Calculate relationship metrics
      const affectionDelta = this._calculateAffectionDelta(emotion, context);
      const trustDelta = this._calculateTrustDelta(context.keywordAnalysis, context.conversationMode);
      
      // Determine relationship depth progression
      const relationshipDepth = await this._assessRelationshipDepth(userId, context);
      
      // Build emotional context
      const emotionalContext = {
        baseline: this._determineBaselineEmotion(emotion),
        depth: relationshipDepth,
        affection: Math.max(0, Math.min(1, 0.5 + affectionDelta)), // Start at 0.5, adjust based on interaction
        trust: Math.max(0, Math.min(1, 0.5 + trustDelta)), // Start at 0.5, adjust based on openness
        frequency: this._assessConversationFrequency(userId),
        history: await this._buildEmotionalHistory(userId, emotion)
      };

      // Update emotional state in database
      const result = await memoryManager.updateEmotionalState(userId, emotion, emotionalContext);
      
      console.log(`✅ Emotional state updated: depth=${relationshipDepth}, affection=${emotionalContext.affection.toFixed(2)}, trust=${emotionalContext.trust.toFixed(2)}`);
      
      return result;

    } catch (error) {
      console.error('❌ Error updating emotional state:', error);
      // Don't throw - this shouldn't break the conversation flow
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate affection level change based on emotional interaction
   * @private
   */
  _calculateAffectionDelta(emotion, context) {
    let delta = 0;
    
    // Positive emotions increase affection
    const positiveEmotions = ['joy', 'love', 'surprise', 'excitement'];
    const negativeEmotions = ['sadness', 'anger', 'fear'];
    
    if (positiveEmotions.includes(emotion)) {
      delta += 0.05; // Small positive increment
    } else if (negativeEmotions.includes(emotion)) {
      // Negative emotions can increase closeness if handled well
      if (context.response && context.response.length > 50) {
        delta += 0.02; // Supportive response to negative emotion
      }
    }
    
    // NSFW conversations can increase affection if consensual
    if (context.conversationMode === 'nsfw') {
      delta += 0.03;
    }
    
    return delta;
  }

  /**
   * Calculate trust level change based on user openness
   * @private  
   */
  _calculateTrustDelta(keywordAnalysis, conversationMode) {
    let delta = 0;
    
    if (keywordAnalysis) {
      // Personal revelations increase trust
      if (keywordAnalysis.information_ownership?.about_user) {
        delta += 0.04;
      }
      
      // Intimate/personal topics increase trust
      if (keywordAnalysis.context?.includes('personal') || 
          keywordAnalysis.context?.includes('intimate')) {
        delta += 0.03;
      }
      
      // Future planning indicates trust
      if (keywordAnalysis.temporal_context?.timeframe === 'future') {
        delta += 0.02;
      }
    }
    
    return delta;
  }

  /**
   * Assess relationship depth based on conversation history
   * @private
   */
  async _assessRelationshipDepth(userId, context) {
    try {
      // Get current emotional state to check existing depth
      const currentState = await memoryManager.getEmotionalState(userId);
      const currentDepth = currentState?.relationshipDepth || 'superficial';
      
      // Simple progression logic (can be enhanced with more complex analysis)
      const depthProgression = {
        'superficial': 'developing',
        'developing': 'deep', 
        'deep': 'intimate'
      };
      
      // Check for depth progression indicators
      const hasPersonalContent = context.keywordAnalysis?.information_ownership?.about_user;
      const hasEmotionalMilestone = context.keywordAnalysis?.emotions?.length > 0;
      const isNSFWMode = context.conversationMode === 'nsfw';
      
      // Progress relationship depth if conditions are met
      if ((hasPersonalContent || hasEmotionalMilestone) && depthProgression[currentDepth]) {
        console.log(`📈 Relationship depth progressing: ${currentDepth} → ${depthProgression[currentDepth]}`);
        return depthProgression[currentDepth];
      }
      
      // NSFW mode can indicate intimacy if already deep
      if (isNSFWMode && currentDepth === 'deep') {
        return 'intimate';
      }
      
      return currentDepth;

    } catch (error) {
      console.log('⚠️ Error assessing relationship depth:', error.message);
      return 'superficial';
    }
  }

  /**
   * Assess conversation frequency pattern
   * @private
   */
  _assessConversationFrequency(userId) {
    // This would ideally check conversation timestamps to determine frequency
    // For now, return a default value - can be enhanced with actual frequency analysis
    return 'regular';
  }

  /**
   * Determine baseline emotion based on recent emotional pattern
   * @private
   */
  _determineBaselineEmotion(currentEmotion) {
    // Simple logic - in production this would analyze emotional history
    const positiveEmotions = ['joy', 'love', 'excitement'];
    const negativeEmotions = ['sadness', 'anger', 'fear'];
    
    if (positiveEmotions.includes(currentEmotion)) {
      return 'positive';
    } else if (negativeEmotions.includes(currentEmotion)) {
      return 'neutral'; // Don't set negative baseline too quickly
    }
    
    return 'neutral';
  }

  /**
   * Build emotional history array
   * @private
   */
  async _buildEmotionalHistory(userId, emotion) {
    try {
      // Get current emotional state to append to history
      const currentState = await memoryManager.getEmotionalState(userId);
      const existingHistory = currentState?.emotionalHistory || [];
      
      // Add new emotion entry
      const newEntry = {
        emotion,
        timestamp: new Date(),
        context: 'conversation'
      };
      
      // Keep last 10 emotional states
      const updatedHistory = [...existingHistory, newEntry].slice(-10);
      
      return updatedHistory;

    } catch (error) {
      console.log('⚠️ Error building emotional history:', error.message);
      return [{ emotion, timestamp: new Date(), context: 'conversation' }];
    }
  }
}

module.exports = new ChatController();