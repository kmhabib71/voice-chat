/**
 * @fileoverview Core memory management system to replace localStorage
 * @author AI Girlfriend Development Team
 * @created 2025-09-04
 * 
 * @example
 * const memoryManager = require('./MemoryManager');
 * await memoryManager.storeShortTermMemory(userId, sessionId, messages, metadata);
 */

// Infrastructure dependencies
const { getCollection, COLLECTIONS } = require('../../infrastructure/database');

// Core memory system classes
const ShortTermMemory = require('./ShortTermMemory');
const LongTermMemory = require('./LongTermMemory'); 
const EpisodicMemory = require('./EpisodicMemory');
const ImportanceScorer = require('./ImportanceScorer');
const SessionSummarizer = require('./SessionSummarizer');

/**
 * Main memory management system
 * Handles all memory operations with CRUD for all collection types
 */
class MemoryManager {
    constructor() {
        this.shortTermMemory = new ShortTermMemory();
        this.longTermMemory = new LongTermMemory();
        this.episodicMemory = new EpisodicMemory();
        this.importanceScorer = new ImportanceScorer();
        this.sessionSummarizer = new SessionSummarizer(this); // Inject self to avoid circular dependency
        
        // Memory statistics tracking
        this.stats = {
            shortTermOperations: 0,
            longTermOperations: 0,
            episodicOperations: 0,
            importanceEvaluations: 0,
            sessionSummaries: 0,
            errors: 0,
            lastOperation: null
        };
    }

    /**
     * Store short-term memory (recent conversations with 24h TTL)
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @param {Array} messages - Conversation messages
     * @param {Object} metadata - Additional metadata (mood, topics, etc.)
     * @returns {Promise<Object>} Storage result
     * @throws {Error} Storage failed
     */
    async storeShortTermMemory(userId, sessionId, messages, metadata = {}) {
        try {
            this._validateUserId(userId);
            this._validateSessionId(sessionId);
            this._validateMessages(messages);

            const result = await this.shortTermMemory.store(userId, sessionId, messages, metadata);
            
            this._updateStats('short_term', 'store');
            return result;

        } catch (error) {
            this._handleError('storeShortTermMemory', error);
            throw error;
        }
    }

    /**
     * Retrieve recent memories for user
     * @param {string} userId - User identifier
     * @param {number} limit - Maximum number of memories to retrieve
     * @returns {Promise<Array>} Recent memories
     */
    async retrieveRecentMemories(userId, limit = 10) {
        try {
            this._validateUserId(userId);
            this._validateLimit(limit);

            const memories = await this.shortTermMemory.retrieve(userId, limit);
            
            this._updateStats('short_term', 'retrieve');
            return memories;

        } catch (error) {
            this._handleError('retrieveRecentMemories', error);
            // Fallback to empty array for non-critical operation
            return [];
        }
    }

    /**
     * Store user fact in long-term memory
     * @param {string} userId - User identifier
     * @param {string} category - Fact category (personal_facts, preferences, goals, milestones)
     * @param {string} key - Fact key/identifier
     * @param {string} value - Fact value
     * @param {Object} context - Additional context information
     * @returns {Promise<Object>} Storage result
     */
    async storeUserFact(userId, category, key, value, context = {}) {
        try {
            this._validateUserId(userId);
            this._validateCategory(category);
            this._validateFactKey(key);
            this._validateFactValue(value);

            const result = await this.longTermMemory.storeFact(userId, category, key, value, context);
            
            this._updateStats('long_term', 'store');
            return result;

        } catch (error) {
            this._handleError('storeUserFact', error);
            throw error;
        }
    }

    /**
     * Get user facts from long-term memory
     * @param {string} userId - User identifier
     * @param {Array} categories - Categories to filter by (optional)
     * @returns {Promise<Array>} User facts
     */
    async getUserFacts(userId, categories = []) {
        try {
            this._validateUserId(userId);

            const facts = await this.longTermMemory.getFacts(userId, categories);
            
            this._updateStats('long_term', 'retrieve');
            return facts;

        } catch (error) {
            this._handleError('getUserFacts', error);
            // Fallback to empty array for non-critical operation
            return [];
        }
    }

    /**
     * Create episodic memory (session summary)
     * @param {string} userId - User identifier
     * @param {string} summary - Session summary
     * @param {Object} metadata - Session metadata (emotion, topics, importance, etc.)
     * @returns {Promise<Object>} Creation result
     */
    async createEpisodicMemory(userId, summary, metadata = {}) {
        try {
            this._validateUserId(userId);
            this._validateSummary(summary);

            const result = await this.episodicMemory.create(userId, summary, metadata);
            
            this._updateStats('episodic', 'store');
            return result;

        } catch (error) {
            this._handleError('createEpisodicMemory', error);
            throw error;
        }
    }

    /**
     * Search episodic memories using query
     * @param {string} userId - User identifier
     * @param {string} query - Search query
     * @param {number} limit - Maximum results to return
     * @returns {Promise<Array>} Search results
     */
    async searchEpisodicMemories(userId, query, limit = 5) {
        try {
            this._validateUserId(userId);
            this._validateQuery(query);
            this._validateLimit(limit);

            const results = await this.episodicMemory.search(userId, query, limit);
            
            this._updateStats('episodic', 'search');
            return results;

        } catch (error) {
            this._handleError('searchEpisodicMemories', error);
            // Fallback to empty array for search operations
            return [];
        }
    }

    /**
     * Update user's emotional state
     * @param {string} userId - User identifier
     * @param {string} emotion - Current emotion
     * @param {Object} context - Emotional context and history
     * @returns {Promise<Object>} Update result
     */
    async updateEmotionalState(userId, emotion, context = {}) {
        try {
            this._validateUserId(userId);
            this._validateEmotion(emotion);

            const collection = await getCollection(COLLECTIONS.EMOTIONAL_STATE);
            
            const emotionalData = {
                userId,
                currentEmotion: emotion,
                baselineEmotion: context.baseline || 'neutral',
                relationshipDepth: context.depth || 'superficial',
                affectionLevel: context.affection || 0.5,
                trustLevel: context.trust || 0.5,
                conversationFrequency: context.frequency || 'occasional',
                emotionalHistory: context.history || [],
                lastUpdated: new Date()
            };

            const result = await collection.replaceOne(
                { userId },
                emotionalData,
                { upsert: true }
            );

            this._updateStats('emotional', 'update');
            return {
                success: true,
                upserted: result.upsertedId !== null,
                modified: result.modifiedCount > 0
            };

        } catch (error) {
            this._handleError('updateEmotionalState', error);
            throw error;
        }
    }

    /**
     * Get user's current emotional state
     * @param {string} userId - User identifier
     * @returns {Promise<Object|null>} Emotional state
     */
    async getEmotionalState(userId) {
        try {
            this._validateUserId(userId);

            const collection = await getCollection(COLLECTIONS.EMOTIONAL_STATE);
            const emotionalState = await collection.findOne({ userId });

            this._updateStats('emotional', 'retrieve');
            return emotionalState;

        } catch (error) {
            this._handleError('getEmotionalState', error);
            // Return default emotional state as fallback
            return {
                userId,
                currentEmotion: 'neutral',
                baselineEmotion: 'neutral', 
                relationshipDepth: 'superficial',
                affectionLevel: 0.5,
                trustLevel: 0.5,
                conversationFrequency: 'occasional',
                emotionalHistory: [],
                lastUpdated: new Date()
            };
        }
    }

    /**
     * Calculate importance score for conversation content
     * @param {string} message - User message
     * @param {string} response - AI response (optional)
     * @param {Object} context - Conversation context
     * @returns {number} Importance score (0.1-1.0)
     */
    calculateImportance(message, response = '', context = {}) {
        try {
            this._updateStats('importance', 'evaluate');
            return this.importanceScorer.calculateImportance(message, response, context);
        } catch (error) {
            this._handleError('calculateImportance', error);
            return 0.5; // Default to medium importance on error
        }
    }

    /**
     * Get detailed importance analysis
     * @param {string} message - User message
     * @param {string} response - AI response (optional)
     * @param {Object} context - Conversation context
     * @returns {Object} Detailed analysis with factors and reasoning
     */
    analyzeImportance(message, response = '', context = {}) {
        try {
            this._updateStats('importance', 'analyze');
            return this.importanceScorer.analyzeImportanceFactors(message, response, context);
        } catch (error) {
            this._handleError('analyzeImportance', error);
            return {
                score: 0.5,
                level: 'medium',
                factors: {},
                reasoning: ['Error in importance analysis']
            };
        }
    }

    /**
     * Store memory with automatic importance scoring
     * @param {string} userId - User identifier
     * @param {string} message - User message
     * @param {string} response - AI response
     * @param {Object} context - Conversation context
     * @param {string} memoryType - Type: 'short_term', 'long_term', 'episodic'
     * @returns {Promise<Object>} Storage result with importance score
     */
    async storeWithImportance(userId, message, response = '', context = {}, memoryType = 'auto') {
        try {
            // Calculate importance score
            const importanceAnalysis = this.analyzeImportance(message, response, context);
            const { score, level } = importanceAnalysis;

            // Determine memory type automatically if not specified
            if (memoryType === 'auto') {
                if (score >= 0.8) {
                    memoryType = 'episodic'; // High importance → episodic memory
                } else if (score >= 0.6) {
                    memoryType = 'long_term'; // Medium-high → long term facts
                } else {
                    memoryType = 'short_term'; // Lower importance → short term
                }
            }

            // Enhanced context with importance data
            const enhancedContext = {
                ...context,
                importance: level,
                importanceScore: score,
                importanceFactors: importanceAnalysis.factors,
                importanceReasoning: importanceAnalysis.reasoning
            };

            let result;

            // Store based on determined type
            switch (memoryType) {
                case 'short_term':
                    result = await this.storeShortTermMemory(
                        userId,
                        context.sessionId || `session_${Date.now()}`,
                        [{ content: message, role: 'user' }, { content: response, role: 'assistant' }],
                        enhancedContext
                    );
                    break;

                case 'long_term':
                    // Extract key-value for long term storage
                    const factData = this._extractFactFromMessage(message, enhancedContext);
                    if (factData) {
                        result = await this.storeUserFact(
                            userId,
                            factData.category,
                            factData.key,
                            factData.value,
                            enhancedContext
                        );
                    } else {
                        // Fallback to short term if fact extraction fails
                        result = await this.storeShortTermMemory(
                            userId,
                            context.sessionId || `session_${Date.now()}`,
                            [{ content: message, role: 'user' }, { content: response, role: 'assistant' }],
                            enhancedContext
                        );
                    }
                    break;

                case 'episodic':
                    // Create summary for episodic memory
                    const summary = this._createSummaryFromMessage(message, response, enhancedContext);
                    result = await this.createEpisodicMemory(userId, summary, enhancedContext);
                    break;

                default:
                    throw new Error(`Unknown memory type: ${memoryType}`);
            }

            // Add importance information to result
            return {
                ...result,
                importance: {
                    score,
                    level,
                    memoryType,
                    factors: importanceAnalysis.factors,
                    reasoning: importanceAnalysis.reasoning
                }
            };

        } catch (error) {
            this._handleError('storeWithImportance', error);
            throw error;
        }
    }

    /**
     * Create AI-powered session summary with vector embeddings
     * @param {string} userId - User identifier
     * @param {Array} messages - Conversation messages
     * @param {Object} sessionMetadata - Additional session data
     * @returns {Promise<Object>} Session summary result
     */
    async createSessionSummary(userId, messages, sessionMetadata = {}) {
        try {
            this._validateUserId(userId);
            this._updateStats('session_summary', 'create');
            
            const result = await this.sessionSummarizer.createSessionSummary(
                userId, 
                messages, 
                sessionMetadata
            );

            return result;
        } catch (error) {
            this._handleError('createSessionSummary', error);
            throw error;
        }
    }

    /**
     * Batch process multiple sessions for summarization
     * @param {string} userId - User identifier
     * @param {Array} sessionBatch - Array of session data
     * @returns {Promise<Object>} Batch processing results
     */
    async batchProcessSessions(userId, sessionBatch) {
        try {
            this._validateUserId(userId);
            this._updateStats('session_summary', 'batch');

            const result = await this.sessionSummarizer.batchProcessSessions(userId, sessionBatch);
            
            return result;
        } catch (error) {
            this._handleError('batchProcessSessions', error);
            throw error;
        }
    }

    /**
     * Get memory statistics including importance and summarization metrics
     * @returns {Object} Memory usage statistics
     */
    getMemoryStatistics() {
        const summarizerStats = this.sessionSummarizer.getStatistics();
        
        return {
            ...this.stats,
            sessionSummarizer: summarizerStats,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Clear all memories for user (for testing/cleanup)
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} Cleanup result
     */
    async clearUserMemories(userId) {
        try {
            this._validateUserId(userId);

            const results = await Promise.allSettled([
                this.shortTermMemory.clear(userId),
                this.longTermMemory.clear(userId),
                this.episodicMemory.clear(userId),
                this._clearEmotionalState(userId)
            ]);

            const successful = results.filter(r => r.status === 'fulfilled').length;
            
            return {
                success: successful === 4,
                cleared: successful,
                total: 4,
                details: results
            };

        } catch (error) {
            this._handleError('clearUserMemories', error);
            throw error;
        }
    }

    // Private validation methods
    _validateUserId(userId) {
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
            throw new Error('Valid userId is required');
        }
    }

    _validateSessionId(sessionId) {
        if (!sessionId || typeof sessionId !== 'string') {
            throw new Error('Valid sessionId is required');
        }
    }

    _validateMessages(messages) {
        if (!Array.isArray(messages)) {
            throw new Error('Messages must be an array');
        }
    }

    _validateCategory(category) {
        const validCategories = ['personal_facts', 'preferences', 'goals', 'milestones'];
        if (!validCategories.includes(category)) {
            throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
        }
    }

    _validateFactKey(key) {
        if (!key || typeof key !== 'string' || key.trim().length === 0) {
            throw new Error('Valid fact key is required');
        }
    }

    _validateFactValue(value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Valid fact value is required');
        }
    }

    _validateSummary(summary) {
        if (!summary || typeof summary !== 'string' || summary.trim().length < 10) {
            throw new Error('Summary must be at least 10 characters long');
        }
    }

    _validateQuery(query) {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error('Valid search query is required');
        }
    }

    _validateEmotion(emotion) {
        if (!emotion || typeof emotion !== 'string') {
            throw new Error('Valid emotion string is required');
        }
    }

    _validateLimit(limit) {
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            throw new Error('Limit must be an integer between 1 and 100');
        }
    }

    // Private helper methods for importance-based storage

    /**
     * Extract fact data from message for long-term storage
     * @private
     */
    _extractFactFromMessage(message, context) {
        const messageContent = message.toLowerCase().trim();

        // Preference patterns
        const preferencePatterns = [
            { pattern: /my favorite (.+) is (.+)/i, category: 'preferences', type: 'favorite' },
            { pattern: /i like (.+)/i, category: 'preferences', type: 'likes' },
            { pattern: /i love (.+)/i, category: 'preferences', type: 'loves' },
            { pattern: /i hate (.+)/i, category: 'preferences', type: 'dislikes' },
            { pattern: /i prefer (.+)/i, category: 'preferences', type: 'preferences' }
        ];

        // Personal fact patterns
        const personalPatterns = [
            { pattern: /my name is (.+)/i, category: 'personal_facts', type: 'name' },
            { pattern: /i am (.+) years old/i, category: 'personal_facts', type: 'age' },
            { pattern: /i live in (.+)/i, category: 'personal_facts', type: 'location' },
            { pattern: /i work as (.+)/i, category: 'personal_facts', type: 'occupation' },
            { pattern: /i am (.+)/i, category: 'personal_facts', type: 'identity' }
        ];

        // Goal patterns
        const goalPatterns = [
            { pattern: /i want to (.+)/i, category: 'goals', type: 'aspiration' },
            { pattern: /my goal is (.+)/i, category: 'goals', type: 'goal' },
            { pattern: /i plan to (.+)/i, category: 'goals', type: 'plan' },
            { pattern: /i hope to (.+)/i, category: 'goals', type: 'hope' }
        ];

        const allPatterns = [...preferencePatterns, ...personalPatterns, ...goalPatterns];

        for (const { pattern, category, type } of allPatterns) {
            const match = messageContent.match(pattern);
            if (match) {
                return {
                    category,
                    key: `${type}_${Date.now()}`,
                    value: match[1] || match[2] || match[0],
                    metadata: { extractedFrom: message, type, ...context }
                };
            }
        }

        // If no pattern matches but importance is high, create a general fact
        if (context.importanceScore >= 0.6) {
            return {
                category: 'personal_facts',
                key: `important_statement_${Date.now()}`,
                value: message.trim(),
                metadata: { extractedFrom: message, type: 'general', ...context }
            };
        }

        return null;
    }

    /**
     * Create summary from message for episodic storage
     * @private
     */
    _createSummaryFromMessage(message, response, context) {
        const factors = context.importanceFactors || {};
        let summary = `User shared: ${message}`;

        if (response) {
            summary += ` AI responded: ${response}`;
        }

        // Add context about why this is important
        if (factors.emotionalMilestone) {
            summary += ' [Emotional milestone detected]';
        }
        if (factors.personalRevelation) {
            summary += ' [Personal revelation shared]';
        }
        if (factors.lifeEvent) {
            summary += ' [Life event mentioned]';
        }
        if (factors.goalSetting) {
            summary += ' [Goal or aspiration discussed]';
        }

        return summary;
    }

    _updateStats(type, operation) {
        this.stats[`${type}Operations`]++;
        this.stats.lastOperation = {
            type,
            operation,
            timestamp: new Date().toISOString()
        };
    }

    _handleError(operation, error) {
        this.stats.errors++;
        console.error(`MemoryManager.${operation} error:`, error.message);
        
        // Log error details for debugging
        console.error('Error stack:', error.stack);
    }

    async _clearEmotionalState(userId) {
        const collection = await getCollection(COLLECTIONS.EMOTIONAL_STATE);
        return await collection.deleteOne({ userId });
    }
}

// Export singleton instance
module.exports = new MemoryManager();