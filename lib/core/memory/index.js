/**
 * @fileoverview Unified memory interface for AI Girlfriend memory system
 * @created 2025-09-04
 * 
 * @example
 * const Memory = require('./index');
 * const userMemories = await Memory.retrieve(userId, 'work stress');
 */

// Import the main MemoryManager
const MemoryManager = require('./MemoryManager');

/**
 * Unified Memory Interface
 * Provides simplified access to all memory operations
 * Delegates to MemoryManager for actual operations
 */
class UnifiedMemoryInterface {
    constructor() {
        this.manager = MemoryManager;
    }

    // ===== Simple, consistent API methods =====

    /**
     * Store data in appropriate memory type
     * @param {string} userId - User identifier
     * @param {Object} data - Memory data
     * @param {string} type - Memory type: 'short_term', 'long_term', 'episodic'
     * @returns {Promise<Object>} Storage result
     */
    async store(userId, data, type) {
        try {
            switch (type) {
                case 'short_term':
                    return await this.manager.storeShortTermMemory(
                        userId, 
                        data.sessionId || new Date().getTime().toString(),
                        data.messages || [],
                        data
                    );

                case 'long_term':
                    return await this.manager.storeUserFact(
                        userId,
                        data.category || 'personal_facts',
                        data.key,
                        data.value,
                        data
                    );

                case 'episodic':
                    return await this.manager.createEpisodicMemory(
                        userId,
                        data.summary,
                        data
                    );

                default:
                    throw new Error(`Unknown memory type: ${type}`);
            }
        } catch (error) {
            console.error(`UnifiedMemoryInterface.store(${type}) error:`, error.message);
            throw error;
        }
    }

    /**
     * Retrieve memories for user
     * @param {string} userId - User identifier
     * @param {string} query - Search query or context (optional)
     * @param {Object} options - Retrieval options
     * @returns {Promise<Array>} Memory results
     */
    async retrieve(userId, query = null, options = {}) {
        try {
            const {
                type = 'all',
                limit = 10
            } = options;

            let memories = [];

            if (type === 'all' || type === 'short_term') {
                const shortTerm = await this.manager.retrieveRecentMemories(userId, limit);
                memories = memories.concat(shortTerm.map(m => ({ ...m, type: 'short_term' })));
            }

            if (type === 'all' || type === 'long_term') {
                const longTerm = await this.manager.getUserFacts(userId, options.categories);
                memories = memories.concat(longTerm.map(m => ({ ...m, type: 'long_term' })));
            }

            if (type === 'all' || type === 'episodic') {
                if (query) {
                    const episodic = await this.manager.searchEpisodicMemories(userId, query, limit);
                    memories = memories.concat(episodic.map(m => ({ ...m, type: 'episodic' })));
                } else {
                    // Get recent episodic memories
                    const episodic = await this.manager.episodicMemory.getRecent(userId, limit);
                    memories = memories.concat(episodic);
                }
            }

            return memories;

        } catch (error) {
            console.error('UnifiedMemoryInterface.retrieve error:', error.message);
            // Return empty array for non-critical operation
            return [];
        }
    }

    /**
     * Search memories using text query
     * @param {string} userId - User identifier
     * @param {string} query - Search query
     * @param {number} limit - Result limit
     * @returns {Promise<Array>} Search results
     */
    async search(userId, query, limit = 5) {
        try {
            const [longTermResults, episodicResults] = await Promise.all([
                this.manager.longTermMemory.searchFacts(userId, query, { limit }),
                this.manager.searchEpisodicMemories(userId, query, limit)
            ]);

            return [
                ...longTermResults,
                ...episodicResults
            ];

        } catch (error) {
            console.error('UnifiedMemoryInterface.search error:', error.message);
            // Return empty array for search failures
            return [];
        }
    }

    /**
     * Update emotional state
     * @param {string} userId - User identifier
     * @param {Object} emotionalData - Emotional state data
     * @returns {Promise<Object>} Update result
     */
    async updateEmotionalState(userId, emotionalData) {
        const emotion = typeof emotionalData === 'string' ? emotionalData : emotionalData.emotion;
        const context = typeof emotionalData === 'object' ? emotionalData : {};
        return await this.manager.updateEmotionalState(userId, emotion, context);
    }

    /**
     * Get emotional state for user
     * @param {string} userId - User identifier
     * @returns {Promise<Object|null>} Emotional state
     */
    async getEmotionalState(userId) {
        return await this.manager.getEmotionalState(userId);
    }

    // ===== Direct access to MemoryManager methods =====

    /**
     * Store short-term memory
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @param {Array} messages - Messages array
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Storage result
     */
    async storeShortTermMemory(userId, sessionId, messages, metadata = {}) {
        return await this.manager.storeShortTermMemory(userId, sessionId, messages, metadata);
    }

    /**
     * Retrieve recent memories
     * @param {string} userId - User identifier
     * @param {number} limit - Limit of results
     * @returns {Promise<Array>} Recent memories
     */
    async retrieveRecentMemories(userId, limit = 10) {
        return await this.manager.retrieveRecentMemories(userId, limit);
    }

    /**
     * Store user fact
     * @param {string} userId - User identifier
     * @param {string} category - Fact category
     * @param {string} key - Fact key
     * @param {string} value - Fact value
     * @param {Object} context - Additional context
     * @returns {Promise<Object>} Storage result
     */
    async storeUserFact(userId, category, key, value, context = {}) {
        return await this.manager.storeUserFact(userId, category, key, value, context);
    }

    /**
     * Get user facts
     * @param {string} userId - User identifier
     * @param {Array} categories - Categories to filter by
     * @returns {Promise<Array>} User facts
     */
    async getUserFacts(userId, categories = []) {
        return await this.manager.getUserFacts(userId, categories);
    }

    /**
     * Create episodic memory
     * @param {string} userId - User identifier
     * @param {string} summary - Session summary
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Creation result
     */
    async createEpisodicMemory(userId, summary, metadata = {}) {
        return await this.manager.createEpisodicMemory(userId, summary, metadata);
    }

    /**
     * Search episodic memories
     * @param {string} userId - User identifier
     * @param {string} query - Search query
     * @param {number} limit - Result limit
     * @returns {Promise<Array>} Search results
     */
    async searchEpisodicMemories(userId, query, limit = 5) {
        return await this.manager.searchEpisodicMemories(userId, query, limit);
    }

    /**
     * Get recent episodic memories
     * @param {string} userId - User identifier
     * @param {number} limit - Maximum number of memories to retrieve
     * @returns {Promise<Array>} Array of episodic memories
     */
    async getEpisodicMemories(userId, limit = 10) {
        return await this.manager.getEpisodicMemories(userId, limit);
    }

    // ===== Utility and statistics methods =====

    /**
     * Get comprehensive memory statistics
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} Memory statistics
     */
    async getMemoryStatistics(userId) {
        try {
            const [shortTermStats, longTermStats, episodicStats, managerStats] = await Promise.all([
                this.manager.shortTermMemory.getStatistics(userId),
                this.manager.longTermMemory.getStatistics(userId),
                this.manager.episodicMemory.getStatistics(userId),
                Promise.resolve(this.manager.getMemoryStatistics())
            ]);

            return {
                userId,
                timestamp: new Date().toISOString(),
                shortTerm: shortTermStats,
                longTerm: longTermStats,
                episodic: episodicStats,
                manager: managerStats,
                overall: {
                    totalMemories: shortTermStats.totalSessions + longTermStats.totalFacts + episodicStats.totalEpisodes,
                    totalMessages: shortTermStats.totalMessages,
                    avgConfidence: longTermStats.avgConfidence,
                    embeddingCoverage: episodicStats.embeddingCoverage
                }
            };

        } catch (error) {
            console.error('UnifiedMemoryInterface.getMemoryStatistics error:', error.message);
            throw error;
        }
    }

    /**
     * Clear all memories for user (for testing/cleanup)
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} Cleanup result
     */
    async clearUserMemories(userId) {
        return await this.manager.clearUserMemories(userId);
    }

    // ===== Importance scoring methods =====

    /**
     * Calculate importance score for conversation content
     * @param {string} message - User message
     * @param {string} response - AI response (optional)
     * @param {Object} context - Conversation context
     * @returns {number} Importance score (0.1-1.0)
     */
    calculateImportance(message, response = '', context = {}) {
        return this.manager.calculateImportance(message, response, context);
    }

    /**
     * Get detailed importance analysis
     * @param {string} message - User message
     * @param {string} response - AI response (optional)
     * @param {Object} context - Conversation context
     * @returns {Object} Detailed analysis with factors and reasoning
     */
    analyzeImportance(message, response = '', context = {}) {
        return this.manager.analyzeImportance(message, response, context);
    }

    /**
     * Store memory with automatic importance scoring and type selection
     * @param {string} userId - User identifier
     * @param {string} message - User message
     * @param {string} response - AI response
     * @param {Object} context - Conversation context
     * @param {string} memoryType - Type: 'auto', 'short_term', 'long_term', 'episodic'
     * @returns {Promise<Object>} Storage result with importance data
     */
    async storeWithImportance(userId, message, response = '', context = {}, memoryType = 'auto') {
        return await this.manager.storeWithImportance(userId, message, response, context, memoryType);
    }

    // ===== Session summarization methods =====

    /**
     * Create AI-powered session summary with vector embeddings
     * @param {string} userId - User identifier
     * @param {Array} messages - Conversation messages
     * @param {Object} sessionMetadata - Additional session data
     * @returns {Promise<Object>} Session summary result
     */
    async createSessionSummary(userId, messages, sessionMetadata = {}) {
        return await this.manager.createSessionSummary(userId, messages, sessionMetadata);
    }

    /**
     * Batch process multiple sessions for summarization
     * @param {string} userId - User identifier
     * @param {Array} sessionBatch - Array of session data
     * @returns {Promise<Object>} Batch processing results
     */
    async batchProcessSessions(userId, sessionBatch) {
        return await this.manager.batchProcessSessions(userId, sessionBatch);
    }

    // ===== Direct access to memory components =====

    /**
     * Get direct access to memory components for advanced operations
     * @returns {Object} Memory components
     */
    getComponents() {
        return {
            manager: this.manager,
            shortTerm: this.manager.shortTermMemory,
            longTerm: this.manager.longTermMemory,
            episodic: this.manager.episodicMemory,
            importanceScorer: this.manager.importanceScorer,
            sessionSummarizer: this.manager.sessionSummarizer
        };
    }
}

// Export singleton instance
module.exports = new UnifiedMemoryInterface();