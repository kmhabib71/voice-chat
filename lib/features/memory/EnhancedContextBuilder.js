/**
 * @fileoverview Enhanced Context Builder with semantic search integration
 * @author AI Girlfriend Project
 * @created 2025-09-07
 * 
 * @example
 * const contextBuilder = require('./EnhancedContextBuilder');
 * const context = await contextBuilder.buildEnhancedContext(userId, currentMessage);
 */

const memoryManager = require('../../core/memory');

class EnhancedContextBuilder {
  constructor() {
    this.maxTokens = 3000; // Keep context under 3K tokens
    this.maxUserFacts = 8;
    this.maxSemanticMemories = 3;
    this.maxRecentMessages = 5;
  }

  /**
   * Build comprehensive context from Memory v2 system with semantic search
   * @param {string} userId - User identifier
   * @param {string} currentMessage - Current user message
   * @param {Object} options - Context building options
   * @returns {Promise<Object>} Enhanced context object
   */
  async buildEnhancedContext(userId, currentMessage, options = {}) {
    try {
      console.log('\\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===');
      console.log(`👤 UserId: ${userId}`);
      console.log(`💬 Message: "${currentMessage?.substring(0, 50)}..."`);

      if (!userId || !currentMessage) {
        throw new Error('userId and currentMessage are required');
      }

      const startTime = Date.now();

      // Parallel data retrieval for optimal performance
      const [
        semanticMemories,
        userFacts,
        emotionalState,
        recentMessages
      ] = await Promise.all([
        this._getRelevantSemanticMemories(userId, currentMessage, options),
        this._getUserFacts(userId, options),
        this._getEmotionalState(userId, options),
        this._getRecentMessages(userId, options)
      ]);

      const buildTime = Date.now() - startTime;
      console.log(`⏱️ Context built in ${buildTime}ms`);

      // Assemble context with token efficiency
      const context = await this.assembleContextPrompt({
        personalFacts: userFacts,
        relevantMemories: semanticMemories,
        emotionalContext: emotionalState,
        recentContext: recentMessages,
        userId,
        buildTime
      });

      console.log('✅ Enhanced context assembled successfully');
      return context;

    } catch (error) {
      console.error('❌ Enhanced context building failed:', error.message);
      
      // Fallback to basic context
      return await this._buildBasicFallbackContext(userId, currentMessage);
    }
  }

  /**
   * Get semantically relevant memories using existing EpisodicMemory search
   * @private
   */
  async _getRelevantSemanticMemories(userId, currentMessage, options) {
    try {
      const limit = options.maxSemanticMemories || this.maxSemanticMemories;
      
      console.log(`🔍 Searching for ${limit} relevant semantic memories using existing EpisodicMemory search...`);
      
      // Use existing searchEpisodicMemories method from Task Group 1.2
      const memories = await memoryManager.searchEpisodicMemories(userId, currentMessage, limit);
      
      console.log(`📚 Found ${memories.length} semantically relevant memories`);
      
      memories.forEach((memory, i) => {
        console.log(`  Memory ${i+1}: "${memory.summary?.substring(0, 60)}..."`);
      });
      
      return memories;

    } catch (error) {
      console.log('⚠️ Semantic memory search failed, using fallback:', error.message);
      
      // Fallback to recent episodic memories
      try {
        return await memoryManager.getEpisodicMemories(userId, 2);
      } catch (fallbackError) {
        console.log('⚠️ Fallback to episodic memories also failed');
        return [];
      }
    }
  }

  /**
   * Get relevant user facts and preferences
   * @private
   */
  async _getUserFacts(userId, options) {
    try {
      const limit = options.maxUserFacts || this.maxUserFacts;
      
      console.log(`🧠 Retrieving user facts (limit: ${limit})...`);
      
      const facts = await memoryManager.getUserFacts(
        userId, 
        ['personal_facts', 'preferences', 'goals'],
        limit
      );
      
      console.log(`📊 Retrieved ${facts.length} user facts`);
      
      // Prioritize high-importance facts
      const prioritizedFacts = facts
        .sort((a, b) => {
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          return (importanceOrder[b.importance] || 1) - (importanceOrder[a.importance] || 1);
        })
        .slice(0, limit);

      prioritizedFacts.forEach((fact, i) => {
        console.log(`  Fact ${i+1}: ${fact.key} = "${fact.value}" (${fact.importance})`);
      });
      
      return prioritizedFacts;

    } catch (error) {
      console.log('⚠️ User facts retrieval failed:', error.message);
      return [];
    }
  }

  /**
   * Get current emotional state
   * @private
   */
  async _getEmotionalState(userId, options) {
    try {
      console.log('😊 Retrieving emotional state...');
      
      const emotionalState = await memoryManager.getEmotionalState(userId);
      
      if (emotionalState) {
        console.log(`📊 Emotional state: ${emotionalState.currentEmotion} (depth: ${emotionalState.relationshipDepth})`);
        
        return {
          currentEmotion: emotionalState.currentEmotion,
          baselineEmotion: emotionalState.baselineEmotion,
          relationshipDepth: emotionalState.relationshipDepth,
          affectionLevel: emotionalState.affectionLevel,
          trustLevel: emotionalState.trustLevel,
          conversationFrequency: emotionalState.conversationFrequency,
          lastUpdated: emotionalState.lastUpdated
        };
      } else {
        console.log('ℹ️ No emotional state found, using defaults');
        return {
          currentEmotion: 'neutral',
          baselineEmotion: 'neutral',
          relationshipDepth: 'superficial',
          affectionLevel: 0.5,
          trustLevel: 0.5,
          conversationFrequency: 'occasional',
          lastUpdated: null
        };
      }

    } catch (error) {
      console.log('⚠️ Emotional state retrieval failed:', error.message);
      return {
        currentEmotion: 'neutral',
        baselineEmotion: 'neutral',
        relationshipDepth: 'superficial',
        affectionLevel: 0.5,
        trustLevel: 0.5,
        conversationFrequency: 'occasional',
        lastUpdated: null
      };
    }
  }

  /**
   * Get recent conversation messages
   * @private
   */
  async _getRecentMessages(userId, options) {
    try {
      const limit = options.maxRecentMessages || this.maxRecentMessages;
      
      console.log(`💬 Retrieving recent messages (limit: ${limit})...`);
      
      const recentMemories = await memoryManager.retrieveRecentMemories(userId, limit);
      
      console.log(`📨 Retrieved ${recentMemories.length} recent memories`);
      
      // Extract messages from memories
      const recentMessages = [];
      recentMemories.forEach(memory => {
        if (memory.messages && Array.isArray(memory.messages)) {
          // Get last few messages from each session
          const sessionMessages = memory.messages.slice(-2);
          recentMessages.push(...sessionMessages);
        }
      });
      
      // Limit total messages and ensure they're recent
      const limitedMessages = recentMessages
        .slice(-limit)
        .map(msg => ({
          role: msg.role,
          content: msg.content?.substring(0, 200), // Limit length for token efficiency
          timestamp: msg.timestamp
        }));

      console.log(`💬 Processed ${limitedMessages.length} recent messages`);
      
      return limitedMessages;

    } catch (error) {
      console.log('⚠️ Recent messages retrieval failed:', error.message);
      return [];
    }
  }

  /**
   * Assemble all context components into structured prompt
   * @param {Object} contextData - All context components
   * @returns {Promise<Object>} Assembled context
   */
  async assembleContextPrompt(contextData) {
    try {
      const {
        personalFacts,
        relevantMemories,
        emotionalContext,
        recentContext,
        userId,
        buildTime
      } = contextData;

      console.log('🔨 Assembling context prompt...');

      // Build structured context sections
      const context = {
        // Personal facts section
        personalFacts: this._formatPersonalFacts(personalFacts),
        
        // Relevant memories section
        relevantMemories: this._formatRelevantMemories(relevantMemories),
        
        // Emotional context section
        emotionalContext: this._formatEmotionalContext(emotionalContext),
        
        // Recent conversation section
        recentContext: this._formatRecentContext(recentContext),
        
        // Metadata
        metadata: {
          userId,
          buildTime,
          contextBuilt: true,
          semanticSearchEnabled: true,
          totalComponents: {
            personalFacts: personalFacts?.length || 0,
            relevantMemories: relevantMemories?.length || 0,
            recentMessages: recentContext?.length || 0,
            emotionalState: emotionalContext ? 1 : 0
          }
        }
      };

      // Estimate token usage
      const estimatedTokens = this._estimateTokenUsage(context);
      context.metadata.estimatedTokens = estimatedTokens;
      
      console.log(`📊 Context assembled: ${estimatedTokens} estimated tokens`);
      
      if (estimatedTokens > this.maxTokens) {
        console.log('⚠️ Context exceeds token limit, applying compression...');
        return this._compressContext(context);
      }
      
      return context;

    } catch (error) {
      console.error('❌ Context assembly failed:', error.message);
      throw error;
    }
  }

  /**
   * Format personal facts for context
   * @private
   */
  _formatPersonalFacts(facts) {
    if (!facts || facts.length === 0) return null;
    
    return facts.map(fact => ({
      category: fact.category,
      key: fact.key,
      value: fact.value,
      importance: fact.importance,
      confidence: fact.confidence
    }));
  }

  /**
   * Format relevant memories for context
   * @private
   */
  _formatRelevantMemories(memories) {
    if (!memories || memories.length === 0) return null;
    
    return memories.map(memory => ({
      summary: memory.summary,
      emotion: memory.primaryEmotion,
      topics: memory.topics,
      importance: memory.importance,
      relevanceScore: memory.score,
      date: memory.date
    }));
  }

  /**
   * Format emotional context
   * @private
   */
  _formatEmotionalContext(emotionalState) {
    if (!emotionalState) return null;
    
    return {
      currentMood: emotionalState.currentEmotion,
      baseline: emotionalState.baselineEmotion,
      relationshipDepth: emotionalState.relationshipDepth,
      affection: Math.round(emotionalState.affectionLevel * 100),
      trust: Math.round(emotionalState.trustLevel * 100),
      frequency: emotionalState.conversationFrequency
    };
  }

  /**
   * Format recent conversation context
   * @private
   */
  _formatRecentContext(messages) {
    if (!messages || messages.length === 0) return null;
    
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }

  /**
   * Estimate token usage for context
   * @private
   */
  _estimateTokenUsage(context) {
    try {
      const contextString = JSON.stringify(context);
      // Rough estimation: 4 characters per token
      return Math.ceil(contextString.length / 4);
    } catch (error) {
      console.log('⚠️ Token estimation failed, using default');
      return 1500;
    }
  }

  /**
   * Compress context when it exceeds token limits
   * @private
   */
  _compressContext(context) {
    console.log('🗜️ Compressing context to fit token limits...');
    
    // Reduce content while preserving structure
    if (context.personalFacts && context.personalFacts.length > 5) {
      context.personalFacts = context.personalFacts.slice(0, 5);
    }
    
    if (context.relevantMemories && context.relevantMemories.length > 2) {
      context.relevantMemories = context.relevantMemories.slice(0, 2);
    }
    
    if (context.recentContext && context.recentContext.length > 3) {
      context.recentContext = context.recentContext.slice(-3);
    }
    
    // Shorten summaries
    if (context.relevantMemories) {
      context.relevantMemories.forEach(memory => {
        if (memory.summary && memory.summary.length > 100) {
          memory.summary = memory.summary.substring(0, 100) + '...';
        }
      });
    }
    
    context.metadata.compressed = true;
    context.metadata.estimatedTokens = this._estimateTokenUsage(context);
    
    console.log(`🗜️ Context compressed to ${context.metadata.estimatedTokens} tokens`);
    
    return context;
  }

  /**
   * Build basic fallback context when enhanced context fails
   * @private
   */
  async _buildBasicFallbackContext(userId, currentMessage) {
    console.log('🔄 Building basic fallback context...');
    
    try {
      // Get minimal context
      const [recentMemories, basicFacts] = await Promise.all([
        memoryManager.retrieveRecentMemories(userId, 2).catch(() => []),
        memoryManager.getUserFacts(userId, ['personal_facts'], 3).catch(() => [])
      ]);
      
      return {
        personalFacts: basicFacts,
        relevantMemories: null,
        emotionalContext: null,
        recentContext: recentMemories[0]?.messages?.slice(-2) || [],
        metadata: {
          userId,
          contextBuilt: true,
          fallbackMode: true,
          semanticSearchEnabled: false,
          estimatedTokens: 500
        }
      };
      
    } catch (error) {
      console.error('❌ Basic fallback context failed:', error.message);
      
      return {
        personalFacts: null,
        relevantMemories: null,
        emotionalContext: null,
        recentContext: [],
        metadata: {
          userId,
          contextBuilt: false,
          fallbackMode: true,
          semanticSearchEnabled: false,
          error: error.message,
          estimatedTokens: 100
        }
      };
    }
  }

  /**
   * Get context building statistics
   * @returns {Promise<Object>} Context building statistics
   */
  async getContextStatistics() {
    try {
      // Get memory statistics from existing MemoryManager
      const memoryStats = await memoryManager.getMemoryStatistics();
      
      return {
        maxTokenLimit: this.maxTokens,
        configuration: {
          maxUserFacts: this.maxUserFacts,
          maxSemanticMemories: this.maxSemanticMemories,
          maxRecentMessages: this.maxRecentMessages
        },
        memoryStatistics: memoryStats,
        lastBuilt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Failed to get context statistics:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = new EnhancedContextBuilder();