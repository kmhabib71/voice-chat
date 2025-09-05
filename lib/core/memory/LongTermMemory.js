/**
 * @fileoverview Long-term memory management for user facts and preferences
 * @author AI Girlfriend Development Team
 * @created 2025-09-04
 * 
 * @example
 * const longTermMemory = new LongTermMemory();
 * await longTermMemory.storeFact(userId, 'preferences', 'favorite_color', 'blue', context);
 */

// Infrastructure dependencies
const { getCollection, COLLECTIONS } = require('../../infrastructure/database');

/**
 * Long-term memory management class
 * Handles user facts, preferences, goals, and milestones
 */
class LongTermMemory {
    constructor() {
        this.collectionName = COLLECTIONS.LONG_TERM_MEMORY;
        this.validCategories = ['personal_facts', 'preferences', 'goals', 'milestones'];
        this.validImportanceLevels = ['low', 'medium', 'high'];
    }

    /**
     * Store user fact in long-term memory
     * @param {string} userId - User identifier
     * @param {string} category - Fact category
     * @param {string} key - Fact key/identifier
     * @param {string} value - Fact value
     * @param {Object} context - Additional context
     * @returns {Promise<Object>} Storage result
     */
    async storeFact(userId, category, key, value, context = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            // Check if fact already exists
            const existingFact = await collection.findOne({ userId, key });
            const now = new Date();

            const document = {
                userId,
                category,
                key,
                value: value.trim(),
                confidence: this._calculateConfidence(context),
                importance: context.importance || 'medium',
                firstMentioned: existingFact?.firstMentioned || now,
                lastConfirmed: now,
                contexts: this._updateContexts(existingFact?.contexts || [], context),
                source: context.source || 'conversation',
                confirmationCount: (existingFact?.confirmationCount || 0) + 1,
                lastUpdated: now
            };

            // Use upsert to update existing fact or create new one
            const result = await collection.replaceOne(
                { userId, key },
                document,
                { upsert: true }
            );

            return {
                success: true,
                key,
                category,
                value,
                isUpdate: result.matchedCount > 0,
                upserted: result.upsertedId !== null,
                confidence: document.confidence,
                importance: document.importance
            };

        } catch (error) {
            console.error('LongTermMemory.storeFact error:', error);
            throw new Error(`Failed to store fact: ${error.message}`);
        }
    }

    /**
     * Get user facts from long-term memory
     * @param {string} userId - User identifier
     * @param {Array} categories - Categories to filter by
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} User facts
     */
    async getFacts(userId, categories = [], options = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            const query = { userId };
            
            // Apply category filter if provided
            if (categories.length > 0) {
                const validCats = categories.filter(cat => this.validCategories.includes(cat));
                if (validCats.length > 0) {
                    query.category = { $in: validCats };
                }
            }

            // Apply importance filter if provided
            if (options.importance) {
                query.importance = options.importance;
            }

            // Apply confidence threshold if provided
            if (options.minConfidence) {
                query.confidence = { $gte: options.minConfidence };
            }

            const facts = await collection.find(query)
                .sort({ 
                    importance: -1, // High importance first
                    lastConfirmed: -1 // Most recent first
                })
                .limit(options.limit || 50)
                .toArray();

            // Transform facts for consistent interface
            return facts.map(fact => ({
                key: fact.key,
                category: fact.category,
                value: fact.value,
                confidence: fact.confidence,
                importance: fact.importance,
                firstMentioned: fact.firstMentioned,
                lastConfirmed: fact.lastConfirmed,
                confirmationCount: fact.confirmationCount,
                contexts: fact.contexts,
                source: fact.source,
                type: 'long_term'
            }));

        } catch (error) {
            console.error('LongTermMemory.getFacts error:', error);
            throw new Error(`Failed to get facts: ${error.message}`);
        }
    }

    /**
     * Get specific fact by key
     * @param {string} userId - User identifier
     * @param {string} key - Fact key
     * @returns {Promise<Object|null>} Fact data
     */
    async getFact(userId, key) {
        try {
            const collection = await getCollection(this.collectionName);

            const fact = await collection.findOne({ userId, key });
            
            if (!fact) {
                return null;
            }

            return {
                key: fact.key,
                category: fact.category,
                value: fact.value,
                confidence: fact.confidence,
                importance: fact.importance,
                firstMentioned: fact.firstMentioned,
                lastConfirmed: fact.lastConfirmed,
                confirmationCount: fact.confirmationCount,
                contexts: fact.contexts,
                source: fact.source,
                type: 'long_term'
            };

        } catch (error) {
            console.error('LongTermMemory.getFact error:', error);
            throw new Error(`Failed to get fact: ${error.message}`);
        }
    }

    /**
     * Update fact confidence or importance
     * @param {string} userId - User identifier
     * @param {string} key - Fact key
     * @param {Object} updates - Update data
     * @returns {Promise<Object>} Update result
     */
    async updateFact(userId, key, updates) {
        try {
            const collection = await getCollection(this.collectionName);

            const updateData = {
                lastUpdated: new Date()
            };

            if (updates.confidence !== undefined) {
                updateData.confidence = Math.max(0, Math.min(1, updates.confidence));
            }

            if (updates.importance && this.validImportanceLevels.includes(updates.importance)) {
                updateData.importance = updates.importance;
            }

            if (updates.value) {
                updateData.value = updates.value.trim();
                updateData.lastConfirmed = new Date();
                updateData.$inc = { confirmationCount: 1 };
            }

            if (updates.context) {
                const existingFact = await collection.findOne({ userId, key });
                if (existingFact) {
                    updateData.contexts = this._updateContexts(existingFact.contexts || [], updates.context);
                }
            }

            const result = await collection.updateOne(
                { userId, key },
                updateData.$inc ? 
                    { $set: { ...updateData, $inc: undefined }, $inc: updateData.$inc } :
                    { $set: updateData }
            );

            return {
                success: result.modifiedCount > 0,
                modified: result.modifiedCount,
                matched: result.matchedCount
            };

        } catch (error) {
            console.error('LongTermMemory.updateFact error:', error);
            throw new Error(`Failed to update fact: ${error.message}`);
        }
    }

    /**
     * Search facts by value content
     * @param {string} userId - User identifier
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async searchFacts(userId, query, options = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            const searchQuery = {
                userId,
                $or: [
                    { key: { $regex: query, $options: 'i' } },
                    { value: { $regex: query, $options: 'i' } }
                ]
            };

            // Apply category filter if provided
            if (options.category && this.validCategories.includes(options.category)) {
                searchQuery.category = options.category;
            }

            const results = await collection.find(searchQuery)
                .sort({ 
                    importance: -1,
                    confidence: -1,
                    lastConfirmed: -1 
                })
                .limit(options.limit || 10)
                .toArray();

            return results.map(fact => ({
                key: fact.key,
                category: fact.category,
                value: fact.value,
                confidence: fact.confidence,
                importance: fact.importance,
                relevanceScore: this._calculateRelevance(fact, query),
                type: 'long_term'
            }));

        } catch (error) {
            console.error('LongTermMemory.searchFacts error:', error);
            throw new Error(`Failed to search facts: ${error.message}`);
        }
    }

    /**
     * Get facts by category with statistics
     * @param {string} userId - User identifier
     * @param {string} category - Category to retrieve
     * @returns {Promise<Object>} Category facts and statistics
     */
    async getFactsByCategory(userId, category) {
        try {
            const collection = await getCollection(this.collectionName);

            const facts = await collection.find({ userId, category })
                .sort({ importance: -1, lastConfirmed: -1 })
                .toArray();

            const statistics = {
                total: facts.length,
                byImportance: {
                    high: facts.filter(f => f.importance === 'high').length,
                    medium: facts.filter(f => f.importance === 'medium').length,
                    low: facts.filter(f => f.importance === 'low').length
                },
                avgConfidence: facts.length > 0 ? 
                    facts.reduce((sum, f) => sum + f.confidence, 0) / facts.length : 0,
                lastUpdated: facts.length > 0 ? 
                    Math.max(...facts.map(f => f.lastConfirmed.getTime())) : null
            };

            return {
                category,
                facts: facts.map(fact => ({
                    key: fact.key,
                    value: fact.value,
                    confidence: fact.confidence,
                    importance: fact.importance,
                    lastConfirmed: fact.lastConfirmed,
                    confirmationCount: fact.confirmationCount,
                    type: 'long_term'
                })),
                statistics
            };

        } catch (error) {
            console.error('LongTermMemory.getFactsByCategory error:', error);
            throw new Error(`Failed to get facts by category: ${error.message}`);
        }
    }

    /**
     * Clear all long-term memories for user
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
            console.error('LongTermMemory.clear error:', error);
            throw new Error(`Failed to clear long-term memories: ${error.message}`);
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
                        totalFacts: { $sum: 1 },
                        avgConfidence: { $avg: '$confidence' },
                        totalConfirmations: { $sum: '$confirmationCount' },
                        byCategory: {
                            $push: {
                                category: '$category',
                                importance: '$importance'
                            }
                        },
                        oldestFact: { $min: '$firstMentioned' },
                        newestFact: { $max: '$lastConfirmed' }
                    }
                }
            ]).toArray();

            if (stats.length === 0) {
                return {
                    userId,
                    totalFacts: 0,
                    avgConfidence: 0,
                    totalConfirmations: 0,
                    byCategory: {},
                    byImportance: {},
                    oldestFact: null,
                    newestFact: null,
                    type: 'long_term'
                };
            }

            const stat = stats[0];
            const byCategory = {};
            const byImportance = { high: 0, medium: 0, low: 0 };

            stat.byCategory.forEach(item => {
                byCategory[item.category] = (byCategory[item.category] || 0) + 1;
                byImportance[item.importance]++;
            });

            return {
                userId,
                totalFacts: stat.totalFacts,
                avgConfidence: Math.round(stat.avgConfidence * 100) / 100,
                totalConfirmations: stat.totalConfirmations,
                byCategory,
                byImportance,
                oldestFact: stat.oldestFact,
                newestFact: stat.newestFact,
                type: 'long_term'
            };

        } catch (error) {
            console.error('LongTermMemory.getStatistics error:', error);
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }

    // Private helper methods

    /**
     * Calculate confidence score based on context
     * @private
     */
    _calculateConfidence(context) {
        let confidence = context.confidence || 0.8; // Default confidence

        // Adjust based on source
        if (context.source === 'direct_statement') confidence = Math.min(1.0, confidence + 0.1);
        if (context.source === 'inference') confidence = Math.max(0.3, confidence - 0.2);

        // Adjust based on confirmation
        if (context.confirmed === true) confidence = Math.min(1.0, confidence + 0.1);
        if (context.confirmed === false) confidence = Math.max(0.1, confidence - 0.3);

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    /**
     * Update contexts array with new context
     * @private
     */
    _updateContexts(existingContexts, newContext) {
        const contexts = [...existingContexts];
        
        // Add new context with timestamp
        contexts.push({
            ...newContext,
            timestamp: new Date(),
            conversationId: newContext.conversationId || null
        });

        // Keep only last 10 contexts to prevent unlimited growth
        return contexts.slice(-10);
    }

    /**
     * Calculate relevance score for search results
     * @private
     */
    _calculateRelevance(fact, query) {
        const queryLower = query.toLowerCase();
        let score = 0;

        // Exact key match
        if (fact.key.toLowerCase().includes(queryLower)) {
            score += 0.4;
        }

        // Exact value match
        if (fact.value.toLowerCase().includes(queryLower)) {
            score += 0.3;
        }

        // Importance boost
        if (fact.importance === 'high') score += 0.2;
        else if (fact.importance === 'medium') score += 0.1;

        // Confidence boost
        score += fact.confidence * 0.1;

        return Math.min(1.0, score);
    }
}

module.exports = LongTermMemory;