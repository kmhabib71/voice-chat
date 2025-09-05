/**
 * @fileoverview Short-term memory management for recent conversations (24h TTL)
 * @author AI Girlfriend Development Team
 * @created 2025-09-04
 * 
 * @example
 * const shortTermMemory = new ShortTermMemory();
 * await shortTermMemory.store(userId, sessionId, messages, metadata);
 */

// Infrastructure dependencies
const { getCollection, COLLECTIONS } = require('../../infrastructure/database');

/**
 * Short-term memory management class
 * Handles recent conversations with automatic 24-hour expiration
 */
class ShortTermMemory {
    constructor() {
        this.collectionName = COLLECTIONS.SHORT_TERM_MEMORY;
    }

    /**
     * Store short-term memory with TTL handling
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @param {Array} messages - Conversation messages
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Storage result
     */
    async store(userId, sessionId, messages, metadata = {}) {
        try {
            const collection = await getCollection(this.collectionName);

            const document = {
                userId,
                sessionId,
                messages: this._sanitizeMessages(messages),
                currentMood: metadata.mood || null,
                activeTopics: metadata.topics || [],
                messageCount: messages.length,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours TTL
            };

            // Use upsert to update existing session or create new one
            const result = await collection.replaceOne(
                { userId, sessionId },
                document,
                { upsert: true }
            );

            return {
                success: true,
                sessionId,
                messageCount: messages.length,
                upserted: result.upsertedId !== null,
                modified: result.modifiedCount > 0,
                expiresAt: document.expiresAt
            };

        } catch (error) {
            console.error('ShortTermMemory.store error:', error);
            throw new Error(`Failed to store short-term memory: ${error.message}`);
        }
    }

    /**
     * Retrieve recent memories for user
     * @param {string} userId - User identifier
     * @param {number} limit - Maximum memories to retrieve
     * @returns {Promise<Array>} Recent memories
     */
    async retrieve(userId, limit = 10) {
        try {
            const collection = await getCollection(this.collectionName);

            const memories = await collection.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            // Transform memories for consistent interface
            return memories.map(memory => ({
                sessionId: memory.sessionId,
                messages: memory.messages,
                messageCount: memory.messageCount,
                currentMood: memory.currentMood,
                activeTopics: memory.activeTopics,
                createdAt: memory.createdAt,
                expiresAt: memory.expiresAt,
                type: 'short_term'
            }));

        } catch (error) {
            console.error('ShortTermMemory.retrieve error:', error);
            throw new Error(`Failed to retrieve short-term memories: ${error.message}`);
        }
    }

    /**
     * Get specific session memory
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object|null>} Session memory
     */
    async getSession(userId, sessionId) {
        try {
            const collection = await getCollection(this.collectionName);

            const session = await collection.findOne({ userId, sessionId });
            
            if (!session) {
                return null;
            }

            return {
                sessionId: session.sessionId,
                messages: session.messages,
                messageCount: session.messageCount,
                currentMood: session.currentMood,
                activeTopics: session.activeTopics,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
                type: 'short_term'
            };

        } catch (error) {
            console.error('ShortTermMemory.getSession error:', error);
            throw new Error(`Failed to get session: ${error.message}`);
        }
    }

    /**
     * Update session metadata (mood, topics)
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @param {Object} metadata - Metadata updates
     * @returns {Promise<Object>} Update result
     */
    async updateSessionMetadata(userId, sessionId, metadata) {
        try {
            const collection = await getCollection(this.collectionName);

            const updateData = {};
            
            if (metadata.mood !== undefined) {
                updateData.currentMood = metadata.mood;
            }
            
            if (metadata.topics !== undefined) {
                updateData.activeTopics = metadata.topics;
            }

            updateData.lastUpdated = new Date();

            const result = await collection.updateOne(
                { userId, sessionId },
                { $set: updateData }
            );

            return {
                success: result.modifiedCount > 0,
                modified: result.modifiedCount,
                matched: result.matchedCount
            };

        } catch (error) {
            console.error('ShortTermMemory.updateSessionMetadata error:', error);
            throw new Error(`Failed to update session metadata: ${error.message}`);
        }
    }

    /**
     * Add messages to existing session
     * @param {string} userId - User identifier
     * @param {string} sessionId - Session identifier
     * @param {Array} newMessages - New messages to add
     * @returns {Promise<Object>} Update result
     */
    async appendMessages(userId, sessionId, newMessages) {
        try {
            const collection = await getCollection(this.collectionName);

            const sanitizedMessages = this._sanitizeMessages(newMessages);

            const result = await collection.updateOne(
                { userId, sessionId },
                { 
                    $push: { messages: { $each: sanitizedMessages } },
                    $inc: { messageCount: sanitizedMessages.length },
                    $set: { 
                        lastUpdated: new Date(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Reset TTL
                    }
                }
            );

            return {
                success: result.modifiedCount > 0,
                messagesAdded: sanitizedMessages.length,
                modified: result.modifiedCount
            };

        } catch (error) {
            console.error('ShortTermMemory.appendMessages error:', error);
            throw new Error(`Failed to append messages: ${error.message}`);
        }
    }

    /**
     * Get active sessions for user
     * @param {string} userId - User identifier
     * @returns {Promise<Array>} Active session IDs
     */
    async getActiveSessions(userId) {
        try {
            const collection = await getCollection(this.collectionName);

            const sessions = await collection.find(
                { userId },
                { projection: { sessionId: 1, createdAt: 1, messageCount: 1 } }
            )
            .sort({ createdAt: -1 })
            .toArray();

            return sessions.map(session => ({
                sessionId: session.sessionId,
                createdAt: session.createdAt,
                messageCount: session.messageCount
            }));

        } catch (error) {
            console.error('ShortTermMemory.getActiveSessions error:', error);
            throw new Error(`Failed to get active sessions: ${error.message}`);
        }
    }

    /**
     * Clear all short-term memories for user
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
            console.error('ShortTermMemory.clear error:', error);
            throw new Error(`Failed to clear short-term memories: ${error.message}`);
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
                        totalSessions: { $sum: 1 },
                        totalMessages: { $sum: '$messageCount' },
                        oldestSession: { $min: '$createdAt' },
                        newestSession: { $max: '$createdAt' }
                    }
                }
            ]).toArray();

            return stats.length > 0 ? {
                userId,
                totalSessions: stats[0].totalSessions,
                totalMessages: stats[0].totalMessages,
                oldestSession: stats[0].oldestSession,
                newestSession: stats[0].newestSession,
                type: 'short_term'
            } : {
                userId,
                totalSessions: 0,
                totalMessages: 0,
                oldestSession: null,
                newestSession: null,
                type: 'short_term'
            };

        } catch (error) {
            console.error('ShortTermMemory.getStatistics error:', error);
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }

    /**
     * Sanitize messages to ensure data consistency
     * @private
     * @param {Array} messages - Raw messages
     * @returns {Array} Sanitized messages
     */
    _sanitizeMessages(messages) {
        if (!Array.isArray(messages)) {
            return [];
        }

        return messages.map((message, index) => {
            if (typeof message === 'string') {
                return {
                    content: message.trim(),
                    timestamp: new Date(),
                    index,
                    type: 'text'
                };
            }
            
            if (typeof message === 'object' && message !== null) {
                return {
                    content: String(message.content || '').trim(),
                    timestamp: message.timestamp || new Date(),
                    index,
                    type: message.type || 'text',
                    role: message.role || 'user',
                    metadata: message.metadata || {}
                };
            }

            return {
                content: String(message).trim(),
                timestamp: new Date(),
                index,
                type: 'text'
            };
        }).filter(msg => msg.content.length > 0);
    }
}

module.exports = ShortTermMemory;