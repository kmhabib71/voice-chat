/**
 * @fileoverview Episodic memory management for session summaries with vector search
 * @author AI Girlfriend Development Team
 * @created 2025-09-04
 * 
 * @example
 * const episodicMemory = new EpisodicMemory();
 * await episodicMemory.create(userId, summary, metadata);
 */

// Infrastructure dependencies
const { getCollection, COLLECTIONS } = require('../../infrastructure/database');

/**
 * Episodic memory management class
 * Handles session summaries with vector search capabilities
 */
class EpisodicMemory {
    constructor() {
        this.collectionName = COLLECTIONS.EPISODIC_MEMORY;
        this.validImportanceLevels = ['low', 'medium', 'high'];
        this.vectorIndexName = 'memory_vector_index';
    }

    /**
     * Create episodic memory (session summary)
     * @param {string} userId - User identifier
     * @param {string} summary - Session summary
     * @param {Object} metadata - Session metadata
     * @returns {Promise<Object>} Creation result
     */
    async create(userId, summary, metadata = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            const document = {
                userId,
                date: metadata.date || new Date().toISOString().split('T')[0],
                summary: summary.trim(),
                primaryEmotion: metadata.emotion || 'neutral',
                topics: this._extractTopics(metadata.topics || []),
                importance: this._validateImportance(metadata.importance || 'medium'),
                vectorEmbedding: metadata.embedding || [], // Will be populated by AI service
                conversationLength: metadata.length || 0,
                sessionDuration: metadata.duration || 0,
                messageCount: metadata.messageCount || 0,
                qualityScore: this._calculateQualityScore(metadata),
                createdAt: new Date(),
                source: metadata.source || 'conversation'
            };

            const result = await collection.insertOne(document);

            return {
                success: true,
                episodeId: result.insertedId,
                date: document.date,
                summary: document.summary,
                importance: document.importance,
                topics: document.topics,
                hasEmbedding: document.vectorEmbedding.length > 0
            };

        } catch (error) {
            console.error('EpisodicMemory.create error:', error);
            throw new Error(`Failed to create episodic memory: ${error.message}`);
        }
    }

    /**
     * Search episodic memories using text query
     * @param {string} userId - User identifier
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Search results
     */
    async search(userId, query, limit = 5) {
        try {
            const collection = await getCollection(this.collectionName);

            // Try vector search first (if embeddings are available)
            try {
                const vectorResults = await this._vectorSearch(collection, userId, query, limit);
                if (vectorResults.length > 0) {
                    return vectorResults;
                }
            } catch (vectorError) {
                console.warn('Vector search failed, falling back to text search:', vectorError.message);
            }

            // Fallback to text search
            const textResults = await this._textSearch(collection, userId, query, limit);
            return textResults;

        } catch (error) {
            console.error('EpisodicMemory.search error:', error);
            throw new Error(`Failed to search episodic memories: ${error.message}`);
        }
    }

    /**
     * Get episodic memories by date range
     * @param {string} userId - User identifier
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Episodic memories
     */
    async getByDateRange(userId, startDate, endDate, options = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            const query = {
                userId,
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            };

            // Apply importance filter if provided
            if (options.importance) {
                query.importance = options.importance;
            }

            // Apply emotion filter if provided
            if (options.emotion) {
                query.primaryEmotion = options.emotion;
            }

            const episodes = await collection.find(query)
                .sort({ createdAt: -1 })
                .limit(options.limit || 20)
                .toArray();

            return episodes.map(episode => this._transformEpisode(episode));

        } catch (error) {
            console.error('EpisodicMemory.getByDateRange error:', error);
            throw new Error(`Failed to get episodes by date range: ${error.message}`);
        }
    }

    /**
     * Get recent episodic memories
     * @param {string} userId - User identifier
     * @param {number} limit - Maximum results
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Recent episodes
     */
    async getRecent(userId, limit = 10, options = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            const query = { userId };

            // Apply importance filter if provided
            if (options.importance) {
                query.importance = options.importance;
            }

            const episodes = await collection.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            return episodes.map(episode => this._transformEpisode(episode));

        } catch (error) {
            console.error('EpisodicMemory.getRecent error:', error);
            throw new Error(`Failed to get recent episodes: ${error.message}`);
        }
    }

    /**
     * Update episodic memory with vector embedding
     * @param {string} userId - User identifier
     * @param {ObjectId} episodeId - Episode ID
     * @param {Array} embedding - Vector embedding
     * @returns {Promise<Object>} Update result
     */
    async updateEmbedding(userId, episodeId, embedding) {
        try {
            const collection = await getCollection(this.collectionName);

            const result = await collection.updateOne(
                { _id: episodeId, userId },
                { 
                    $set: { 
                        vectorEmbedding: embedding,
                        lastUpdated: new Date(),
                        hasEmbedding: true
                    }
                }
            );

            return {
                success: result.modifiedCount > 0,
                modified: result.modifiedCount,
                hasEmbedding: true
            };

        } catch (error) {
            console.error('EpisodicMemory.updateEmbedding error:', error);
            throw new Error(`Failed to update embedding: ${error.message}`);
        }
    }

    /**
     * Get episodes by importance level
     * @param {string} userId - User identifier
     * @param {string} importance - Importance level
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Episodes by importance
     */
    async getByImportance(userId, importance, limit = 10) {
        try {
            const collection = await getCollection(this.collectionName);

            const episodes = await collection.find({ userId, importance })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            return episodes.map(episode => this._transformEpisode(episode));

        } catch (error) {
            console.error('EpisodicMemory.getByImportance error:', error);
            throw new Error(`Failed to get episodes by importance: ${error.message}`);
        }
    }

    /**
     * Get episodes by topic
     * @param {string} userId - User identifier
     * @param {string} topic - Topic to search for
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Episodes by topic
     */
    async getByTopic(userId, topic, limit = 10) {
        try {
            const collection = await getCollection(this.collectionName);

            const episodes = await collection.find({ 
                userId, 
                topics: { $in: [topic] }
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

            return episodes.map(episode => this._transformEpisode(episode));

        } catch (error) {
            console.error('EpisodicMemory.getByTopic error:', error);
            throw new Error(`Failed to get episodes by topic: ${error.message}`);
        }
    }

    /**
     * Clear all episodic memories for user
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} Cleanup result
     */
    async clear(userId) {
        try {
            const collection = await getCollection(this.collectionName);

            const result = await collection.deleteMany({ userId });

            return {
                success: true,
                deletedCount: result.deletedCount
            };

        } catch (error) {
            console.error('EpisodicMemory.clear error:', error);
            throw new Error(`Failed to clear episodic memories: ${error.message}`);
        }
    }

    /**
     * Get memory statistics for user
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} Memory statistics
     */
    async getStatistics(userId) {
        try {
            const collection = await getCollection(this.collectionName);

            const stats = await collection.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        totalEpisodes: { $sum: 1 },
                        totalConversationLength: { $sum: '$conversationLength' },
                        avgQualityScore: { $avg: '$qualityScore' },
                        withEmbeddings: { 
                            $sum: { 
                                $cond: [{ $gt: [{ $size: '$vectorEmbedding' }, 0] }, 1, 0] 
                            }
                        },
                        byImportance: {
                            $push: '$importance'
                        },
                        byEmotion: {
                            $push: '$primaryEmotion'
                        },
                        oldestEpisode: { $min: '$createdAt' },
                        newestEpisode: { $max: '$createdAt' }
                    }
                }
            ]).toArray();

            if (stats.length === 0) {
                return {
                    userId,
                    totalEpisodes: 0,
                    totalConversationLength: 0,
                    avgQualityScore: 0,
                    withEmbeddings: 0,
                    byImportance: {},
                    byEmotion: {},
                    oldestEpisode: null,
                    newestEpisode: null,
                    type: 'episodic'
                };
            }

            const stat = stats[0];
            const byImportance = this._countArray(stat.byImportance);
            const byEmotion = this._countArray(stat.byEmotion);

            return {
                userId,
                totalEpisodes: stat.totalEpisodes,
                totalConversationLength: stat.totalConversationLength,
                avgQualityScore: Math.round(stat.avgQualityScore * 100) / 100,
                withEmbeddings: stat.withEmbeddings,
                embeddingCoverage: stat.totalEpisodes > 0 ? 
                    Math.round((stat.withEmbeddings / stat.totalEpisodes) * 100) : 0,
                byImportance,
                byEmotion,
                oldestEpisode: stat.oldestEpisode,
                newestEpisode: stat.newestEpisode,
                type: 'episodic'
            };

        } catch (error) {
            console.error('EpisodicMemory.getStatistics error:', error);
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }

    // Private helper methods

    /**
     * Perform vector search using MongoDB Atlas Vector Search
     * @private
     */
    async _vectorSearch(collection, userId, query, limit) {
        // Note: This would require the query to be converted to vector embedding first
        // For now, we'll return empty array and fall back to text search
        // TODO: Implement vector embedding generation and vector search pipeline
        
        // Example vector search pipeline (requires embedding):
        // const pipeline = [
        //     {
        //         $vectorSearch: {
        //             index: this.vectorIndexName,
        //             path: "vectorEmbedding",
        //             queryVector: queryEmbedding, // Would need to generate this
        //             numCandidates: 100,
        //             limit: limit,
        //             filter: { userId: userId }
        //         }
        //     },
        //     {
        //         $project: {
        //             userId: 1,
        //             summary: 1,
        //             topics: 1,
        //             importance: 1,
        //             primaryEmotion: 1,
        //             createdAt: 1,
        //             score: { $meta: "vectorSearchScore" }
        //         }
        //     }
        // ];
        
        return [];
    }

    /**
     * Perform text-based search as fallback
     * @private
     */
    async _textSearch(collection, userId, query, limit) {
        const searchQuery = {
            userId,
            $or: [
                { summary: { $regex: query, $options: 'i' } },
                { topics: { $in: [new RegExp(query, 'i')] } }
            ]
        };

        const episodes = await collection.find(searchQuery)
            .sort({ 
                importance: -1, // High importance first
                createdAt: -1   // Recent first
            })
            .limit(limit)
            .toArray();

        return episodes.map(episode => ({
            ...this._transformEpisode(episode),
            searchRelevance: this._calculateTextRelevance(episode, query)
        }));
    }

    /**
     * Transform episode for consistent interface
     * @private
     */
    _transformEpisode(episode) {
        return {
            id: episode._id,
            date: episode.date,
            summary: episode.summary,
            primaryEmotion: episode.primaryEmotion,
            topics: episode.topics,
            importance: episode.importance,
            conversationLength: episode.conversationLength,
            messageCount: episode.messageCount,
            qualityScore: episode.qualityScore,
            hasEmbedding: Array.isArray(episode.vectorEmbedding) && episode.vectorEmbedding.length > 0,
            createdAt: episode.createdAt,
            type: 'episodic'
        };
    }

    /**
     * Extract and validate topics
     * @private
     */
    _extractTopics(topics) {
        if (!Array.isArray(topics)) {
            return [];
        }

        return topics
            .filter(topic => typeof topic === 'string' && topic.trim().length > 0)
            .map(topic => topic.trim().toLowerCase())
            .slice(0, 10); // Limit to 10 topics
    }

    /**
     * Validate importance level
     * @private
     */
    _validateImportance(importance) {
        return this.validImportanceLevels.includes(importance) ? importance : 'medium';
    }

    /**
     * Calculate quality score for session
     * @private
     */
    _calculateQualityScore(metadata) {
        let score = 0.5; // Base score

        // Length indicators
        if (metadata.length > 20) score += 0.2;
        else if (metadata.length > 10) score += 0.1;

        // Duration indicators
        if (metadata.duration > 300) score += 0.1; // > 5 minutes

        // Message count indicators
        if (metadata.messageCount > 15) score += 0.1;

        // Emotion indicators (strong emotions = higher quality)
        const strongEmotions = ['excited', 'happy', 'sad', 'angry', 'surprised'];
        if (strongEmotions.includes(metadata.emotion)) score += 0.1;

        return Math.max(0.1, Math.min(1.0, score));
    }

    /**
     * Calculate text relevance score
     * @private
     */
    _calculateTextRelevance(episode, query) {
        const queryLower = query.toLowerCase();
        let score = 0;

        // Summary match
        if (episode.summary.toLowerCase().includes(queryLower)) {
            score += 0.4;
        }

        // Topic match
        const matchingTopics = episode.topics.filter(topic => 
            topic.toLowerCase().includes(queryLower)
        );
        score += matchingTopics.length * 0.2;

        // Importance boost
        if (episode.importance === 'high') score += 0.2;
        else if (episode.importance === 'medium') score += 0.1;

        return Math.min(1.0, score);
    }

    /**
     * Count occurrences in array
     * @private
     */
    _countArray(arr) {
        return arr.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    }
}

module.exports = EpisodicMemory;