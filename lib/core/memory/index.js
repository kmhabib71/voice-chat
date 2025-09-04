/**
 * @fileoverview Unified memory interface for AI Girlfriend memory system
 * @created 2025-09-04
 * 
 * @example
 * const Memory = require('./index');
 * const userMemories = await Memory.retrieve(userId, 'work stress');
 */

const { getCollection, COLLECTIONS } = require('../../infrastructure/database');

class MemoryInterface {
    constructor() {
        this.collections = COLLECTIONS;
    }

    /**
     * Store data in appropriate memory type
     * @param {string} userId - User identifier
     * @param {Object} data - Memory data
     * @param {string} type - Memory type: 'short_term', 'long_term', 'episodic'
     * @returns {Promise<Object>} Storage result
     */
    async store(userId, data, type) {
        try {
            let collection;
            let document;

            switch (type) {
                case 'short_term':
                    collection = await getCollection(this.collections.SHORT_TERM_MEMORY);
                    document = {
                        userId,
                        sessionId: data.sessionId || new Date().getTime().toString(),
                        messages: data.messages || [],
                        currentMood: data.mood || null,
                        activeTopics: data.topics || [],
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    };
                    break;

                case 'long_term':
                    collection = await getCollection(this.collections.LONG_TERM_MEMORY);
                    document = {
                        userId,
                        category: data.category || 'personal_facts',
                        key: data.key,
                        value: data.value,
                        confidence: data.confidence || 0.8,
                        importance: data.importance || 'medium',
                        firstMentioned: data.firstMentioned || new Date(),
                        lastConfirmed: new Date(),
                        contexts: data.contexts || []
                    };
                    break;

                case 'episodic':
                    collection = await getCollection(this.collections.EPISODIC_MEMORY);
                    document = {
                        userId,
                        date: data.date || new Date().toISOString().split('T')[0],
                        summary: data.summary,
                        primaryEmotion: data.emotion || 'neutral',
                        topics: data.topics || [],
                        importance: data.importance || 'medium',
                        vectorEmbedding: data.embedding || [],
                        conversationLength: data.length || 0,
                        createdAt: new Date()
                    };
                    break;

                default:
                    throw new Error(`Unknown memory type: ${type}`);
            }

            const result = await collection.insertOne(document);
            return {
                success: true,
                insertedId: result.insertedId,
                type
            };

        } catch (error) {
            console.error(`Error storing ${type} memory:`, error);
            throw error;
        }
    }

    /**
     * Retrieve memories for user
     * @param {string} userId - User identifier
     * @param {string} query - Search query or context
     * @param {Object} options - Retrieval options
     * @returns {Promise<Array>} Memory results
     */
    async retrieve(userId, query = null, options = {}) {
        try {
            const {
                type = 'all',
                limit = 10,
                importance = null,
                category = null
            } = options;

            let memories = [];

            if (type === 'all' || type === 'short_term') {
                const shortTerm = await this._getShortTermMemories(userId, limit);
                memories = memories.concat(shortTerm);
            }

            if (type === 'all' || type === 'long_term') {
                const longTerm = await this._getLongTermMemories(userId, { category, limit });
                memories = memories.concat(longTerm);
            }

            if (type === 'all' || type === 'episodic') {
                const episodic = await this._getEpisodicMemories(userId, { importance, limit });
                memories = memories.concat(episodic);
            }

            return memories;

        } catch (error) {
            console.error('Error retrieving memories:', error);
            throw error;
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
            // For now, implement basic text search
            // TODO: Implement vector search when embeddings are available
            
            const longTermCollection = await getCollection(this.collections.LONG_TERM_MEMORY);
            const episodicCollection = await getCollection(this.collections.EPISODIC_MEMORY);

            const [longTermResults, episodicResults] = await Promise.all([
                longTermCollection.find({
                    userId,
                    $or: [
                        { key: { $regex: query, $options: 'i' } },
                        { value: { $regex: query, $options: 'i' } }
                    ]
                }).limit(limit).toArray(),

                episodicCollection.find({
                    userId,
                    $or: [
                        { summary: { $regex: query, $options: 'i' } },
                        { topics: { $in: [new RegExp(query, 'i')] } }
                    ]
                }).limit(limit).toArray()
            ]);

            return [
                ...longTermResults.map(m => ({ ...m, type: 'long_term' })),
                ...episodicResults.map(m => ({ ...m, type: 'episodic' }))
            ];

        } catch (error) {
            console.error('Error searching memories:', error);
            throw error;
        }
    }

    /**
     * Update emotional state
     * @param {string} userId - User identifier
     * @param {Object} emotionalData - Emotional state data
     * @returns {Promise<Object>} Update result
     */
    async updateEmotionalState(userId, emotionalData) {
        try {
            const collection = await getCollection(this.collections.EMOTIONAL_STATE);
            
            const document = {
                userId,
                currentEmotion: emotionalData.emotion || 'neutral',
                baselineEmotion: emotionalData.baseline || 'neutral',
                relationshipDepth: emotionalData.depth || 'superficial',
                affectionLevel: emotionalData.affection || 0.5,
                trustLevel: emotionalData.trust || 0.5,
                conversationFrequency: emotionalData.frequency || 'occasional',
                emotionalHistory: emotionalData.history || [],
                lastUpdated: new Date()
            };

            const result = await collection.replaceOne(
                { userId },
                document,
                { upsert: true }
            );

            return {
                success: true,
                upserted: result.upsertedId !== null,
                modified: result.modifiedCount > 0
            };

        } catch (error) {
            console.error('Error updating emotional state:', error);
            throw error;
        }
    }

    /**
     * Get emotional state for user
     * @param {string} userId - User identifier
     * @returns {Promise<Object|null>} Emotional state
     */
    async getEmotionalState(userId) {
        try {
            const collection = await getCollection(this.collections.EMOTIONAL_STATE);
            return await collection.findOne({ userId });
        } catch (error) {
            console.error('Error getting emotional state:', error);
            throw error;
        }
    }

    // Private helper methods
    async _getShortTermMemories(userId, limit) {
        const collection = await getCollection(this.collections.SHORT_TERM_MEMORY);
        const memories = await collection.find({ userId })
            .sort({ _id: -1 })
            .limit(limit)
            .toArray();
        return memories.map(m => ({ ...m, type: 'short_term' }));
    }

    async _getLongTermMemories(userId, options) {
        const collection = await getCollection(this.collections.LONG_TERM_MEMORY);
        const query = { userId };
        
        if (options.category) {
            query.category = options.category;
        }

        const memories = await collection.find(query)
            .sort({ lastConfirmed: -1 })
            .limit(options.limit || 10)
            .toArray();
        return memories.map(m => ({ ...m, type: 'long_term' }));
    }

    async _getEpisodicMemories(userId, options) {
        const collection = await getCollection(this.collections.EPISODIC_MEMORY);
        const query = { userId };
        
        if (options.importance) {
            query.importance = options.importance;
        }

        const memories = await collection.find(query)
            .sort({ createdAt: -1 })
            .limit(options.limit || 5)
            .toArray();
        return memories.map(m => ({ ...m, type: 'episodic' }));
    }
}

// Export singleton instance
module.exports = new MemoryInterface();