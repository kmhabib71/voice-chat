/**
 * @fileoverview Background personality data collection system
 * @author AI Girlfriend Development Team  
 * @created 2025-09-07
 * 
 * @example
 * const personalityCollector = require('./PersonalityCollector');
 * await personalityCollector.scheduleCollection('user123');
 */

// Core personality analysis
const PersonalityAnalyzer = require('../../core/intelligence/PersonalityAnalyzer');

// Infrastructure dependencies
const { getCollection, COLLECTIONS } = require('../database');

/**
 * Background personality data collection system
 * Collects personality data without affecting user experience
 */
class PersonalityCollector {
    constructor() {
        this.personalityAnalyzer = new PersonalityAnalyzer();
        
        // Collection settings
        this.collectionSettings = {
            collectionInterval: 24 * 60 * 60 * 1000, // 24 hours
            minimumMessageThreshold: 5, // Minimum new messages before re-analysis
            activeUserWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxCollectionTime: 30000 // 30 seconds max per collection
        };
        
        // Job queue simulation (in production, would use Redis Queue or similar)
        this.jobQueue = new Map();
        this.scheduledJobs = new Map();
        this.isProcessing = false;
        
        // Collection statistics
        this.stats = {
            collectionsCompleted: 0,
            collectionsSkipped: 0,
            errors: 0,
            averageCollectionTime: 0,
            lastCollectionRun: null,
            activeJobs: 0
        };

        // Start background processor
        this._startBackgroundProcessor();
    }

    /**
     * Schedules personality collection for a user
     * @param {string} userId - User identifier
     * @param {Object} options - Collection options
     * @returns {Promise<boolean>} Success status
     */
    async scheduleCollection(userId, options = {}) {
        try {
            console.log(`📅 Scheduling personality collection for ${userId}`);

            const collectionOptions = {
                userId,
                priority: options.priority || 'normal',
                immediate: options.immediate || false,
                delay: options.delay || this.collectionSettings.collectionInterval,
                maxRetries: options.maxRetries || 3,
                scheduledAt: new Date()
            };

            // Add to job queue
            const jobId = this._generateJobId(userId);
            this.jobQueue.set(jobId, collectionOptions);

            // Schedule recurring collection
            if (!options.oneTime) {
                this._scheduleRecurringCollection(userId, collectionOptions);
            }

            console.log(`✅ Collection scheduled for ${userId} (Job ID: ${jobId})`);
            return true;

        } catch (error) {
            console.error('Error scheduling personality collection:', error);
            this.stats.errors++;
            return false;
        }
    }

    /**
     * Collects personality data for a specific user
     * @param {string} userId - User identifier
     * @returns {Promise<Object|null>} Collection result
     */
    async collectPersonalityData(userId) {
        const startTime = Date.now();

        try {
            console.log(`🧠 === PERSONALITY DATA COLLECTION START for ${userId} ===`);

            // Check if user needs collection
            const needsCollection = await this._userNeedsCollection(userId);
            if (!needsCollection.shouldCollect) {
                console.log(`⏭️ Skipping collection for ${userId}: ${needsCollection.reason}`);
                this.stats.collectionsSkipped++;
                return { skipped: true, reason: needsCollection.reason };
            }

            // Get conversation history for analysis
            const conversationHistory = await this._getConversationHistory(userId);
            
            // Perform personality analysis
            const personalityInsights = await this.personalityAnalyzer.analyzePersonality(userId, conversationHistory);
            
            // Update personality profile
            await this._updatePersonalityProfile(userId, personalityInsights);
            
            // Update collection timestamp
            await this._updateCollectionTimestamp(userId);

            const collectionTime = Date.now() - startTime;
            this._updateCollectionStats(collectionTime);

            console.log(`✅ Personality collection completed for ${userId} in ${collectionTime}ms`);

            return {
                userId,
                success: true,
                collectionTime,
                insights: personalityInsights,
                dataQuality: personalityInsights.dataQuality
            };

        } catch (error) {
            const collectionTime = Date.now() - startTime;
            console.error(`❌ Error collecting personality data for ${userId}:`, error);
            
            this.stats.errors++;
            this._updateCollectionStats(collectionTime);

            return {
                userId,
                success: false,
                error: error.message,
                collectionTime
            };
        }
    }

    /**
     * Gets conversation history for personality analysis
     * @private
     */
    async _getConversationHistory(userId) {
        try {
            // Get recent short-term memory
            const shortTermCollection = await getCollection(COLLECTIONS.SHORT_TERM_MEMORY);
            const episodicCollection = await getCollection(COLLECTIONS.EPISODIC_MEMORY);

            const [shortTermData, episodicData] = await Promise.all([
                shortTermCollection.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .toArray(),
                episodicCollection.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .toArray()
            ]);

            const conversationHistory = [];

            // Add short-term messages
            shortTermData.forEach(session => {
                if (session.messages && Array.isArray(session.messages)) {
                    session.messages.forEach(msg => {
                        conversationHistory.push({
                            sender: msg.sender || 'user',
                            message: msg.content || msg.message || msg,
                            timestamp: session.createdAt,
                            sessionId: session.sessionId,
                            source: 'short_term'
                        });
                    });
                }
            });

            // Add episodic summaries
            episodicData.forEach(episode => {
                conversationHistory.push({
                    sender: 'system',
                    message: `[Episode] ${episode.summary}`,
                    timestamp: episode.createdAt,
                    topics: episode.topics,
                    emotion: episode.primaryEmotion,
                    source: 'episodic'
                });
            });

            return conversationHistory.sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );

        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }

    /**
     * Checks if user needs personality collection
     * @private
     */
    async _userNeedsCollection(userId) {
        try {
            // Check last collection time
            const lastCollection = await this._getLastCollectionTime(userId);
            const now = Date.now();
            
            if (lastCollection && (now - lastCollection) < this.collectionSettings.collectionInterval) {
                return {
                    shouldCollect: false,
                    reason: 'Recently collected'
                };
            }

            // Check if user has been active
            const isActiveUser = await this._isActiveUser(userId);
            if (!isActiveUser) {
                return {
                    shouldCollect: false,
                    reason: 'User inactive'
                };
            }

            // Check if there are enough new messages
            const newMessageCount = await this._getNewMessageCount(userId, lastCollection);
            if (newMessageCount < this.collectionSettings.minimumMessageThreshold) {
                return {
                    shouldCollect: false,
                    reason: 'Insufficient new messages'
                };
            }

            return {
                shouldCollect: true,
                reason: 'Collection needed',
                newMessages: newMessageCount
            };

        } catch (error) {
            console.error('Error checking collection needs:', error);
            return { shouldCollect: false, reason: 'Error checking needs' };
        }
    }

    /**
     * Updates personality profile in database
     * @private
     */
    async _updatePersonalityProfile(userId, personalityInsights) {
        try {
            const collection = await getCollection(COLLECTIONS.AI_PERSONALITY);
            
            await collection.updateOne(
                { userId },
                {
                    $set: {
                        personalityProfile: personalityInsights,
                        lastPersonalityUpdate: new Date(),
                        analysisVersion: personalityInsights.analysisVersion || "1.0"
                    }
                },
                { upsert: true }
            );

            console.log(`✅ Personality profile updated for ${userId}`);

        } catch (error) {
            console.error('Error updating personality profile:', error);
            throw error;
        }
    }

    /**
     * Starts the background job processor
     * @private
     */
    _startBackgroundProcessor() {
        console.log('🚀 Starting personality collection background processor');
        
        // Process jobs every 10 seconds
        setInterval(async () => {
            if (this.isProcessing || this.jobQueue.size === 0) {
                return;
            }

            this.isProcessing = true;

            try {
                await this._processJobQueue();
            } catch (error) {
                console.error('Error processing job queue:', error);
            } finally {
                this.isProcessing = false;
            }
        }, 10000); // 10 seconds
        
        console.log('✅ Background processor started');
    }

    /**
     * Processes jobs in the queue
     * @private
     */
    async _processJobQueue() {
        const now = Date.now();
        const jobsToProcess = [];

        // Find jobs ready for processing
        for (const [jobId, job] of this.jobQueue.entries()) {
            const readyTime = job.scheduledAt.getTime() + job.delay;
            
            if (now >= readyTime || job.immediate) {
                jobsToProcess.push({ jobId, job });
            }
        }

        // Process jobs (limit concurrent processing)
        const maxConcurrent = 3;
        const batches = [];
        
        for (let i = 0; i < jobsToProcess.length; i += maxConcurrent) {
            batches.push(jobsToProcess.slice(i, i + maxConcurrent));
        }

        for (const batch of batches) {
            await Promise.all(batch.map(({ jobId, job }) => this._processJob(jobId, job)));
        }
    }

    /**
     * Processes a single job
     * @private
     */
    async _processJob(jobId, job) {
        try {
            this.stats.activeJobs++;
            
            // Set timeout for job processing
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Collection timeout')), this.collectionSettings.maxCollectionTime);
            });

            const collectionPromise = this.collectPersonalityData(job.userId);
            
            // Race between collection and timeout
            const result = await Promise.race([collectionPromise, timeoutPromise]);
            
            // Remove job from queue
            this.jobQueue.delete(jobId);
            
            console.log(`✅ Job ${jobId} completed for user ${job.userId}`);

        } catch (error) {
            console.error(`❌ Job ${jobId} failed:`, error);
            
            // Retry logic
            job.retries = (job.retries || 0) + 1;
            if (job.retries < job.maxRetries) {
                job.delay = Math.min(job.delay * 2, 60 * 60 * 1000); // Exponential backoff, max 1 hour
                job.scheduledAt = new Date(Date.now() + job.delay);
                console.log(`🔄 Retrying job ${jobId} (attempt ${job.retries + 1})`);
            } else {
                this.jobQueue.delete(jobId);
                console.log(`❌ Job ${jobId} failed after ${job.maxRetries} retries`);
            }
            
        } finally {
            this.stats.activeJobs--;
        }
    }

    /**
     * Schedules recurring collection
     * @private
     */
    _scheduleRecurringCollection(userId, options) {
        const intervalId = setInterval(async () => {
            await this.scheduleCollection(userId, { ...options, oneTime: true });
        }, this.collectionSettings.collectionInterval);

        this.scheduledJobs.set(userId, intervalId);
        console.log(`🔄 Recurring collection scheduled for ${userId}`);
    }

    /**
     * Gets last collection time for user
     * @private
     */
    async _getLastCollectionTime(userId) {
        try {
            const collection = await getCollection(COLLECTIONS.AI_PERSONALITY);
            const profile = await collection.findOne({ userId });
            
            return profile?.lastPersonalityUpdate ? new Date(profile.lastPersonalityUpdate).getTime() : null;

        } catch (error) {
            console.error('Error getting last collection time:', error);
            return null;
        }
    }

    /**
     * Checks if user is active
     * @private
     */
    async _isActiveUser(userId) {
        try {
            const collection = await getCollection(COLLECTIONS.SHORT_TERM_MEMORY);
            const recentActivity = await collection.findOne({
                userId,
                createdAt: {
                    $gte: new Date(Date.now() - this.collectionSettings.activeUserWindow)
                }
            });

            return !!recentActivity;

        } catch (error) {
            console.error('Error checking user activity:', error);
            return false;
        }
    }

    /**
     * Gets count of new messages since last collection
     * @private
     */
    async _getNewMessageCount(userId, lastCollection) {
        try {
            const collection = await getCollection(COLLECTIONS.SHORT_TERM_MEMORY);
            const query = { userId };
            
            if (lastCollection) {
                query.createdAt = { $gt: new Date(lastCollection) };
            }

            const sessions = await collection.find(query).toArray();
            
            return sessions.reduce((count, session) => {
                return count + (session.messages ? session.messages.length : 0);
            }, 0);

        } catch (error) {
            console.error('Error getting new message count:', error);
            return 0;
        }
    }

    /**
     * Updates collection timestamp
     * @private
     */
    async _updateCollectionTimestamp(userId) {
        try {
            const collection = await getCollection(COLLECTIONS.AI_PERSONALITY);
            
            await collection.updateOne(
                { userId },
                {
                    $set: { lastPersonalityCollection: new Date() }
                },
                { upsert: true }
            );

        } catch (error) {
            console.error('Error updating collection timestamp:', error);
        }
    }

    /**
     * Updates collection statistics
     * @private
     */
    _updateCollectionStats(collectionTime) {
        this.stats.collectionsCompleted++;
        this.stats.lastCollectionRun = new Date();
        
        // Update average collection time
        if (this.stats.averageCollectionTime === 0) {
            this.stats.averageCollectionTime = collectionTime;
        } else {
            this.stats.averageCollectionTime = 
                (this.stats.averageCollectionTime * (this.stats.collectionsCompleted - 1) + collectionTime) / 
                this.stats.collectionsCompleted;
        }
    }

    /**
     * Generates unique job ID
     * @private
     */
    _generateJobId(userId) {
        return `personality_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Stops collection for a user
     * @param {string} userId - User identifier
     */
    stopCollectionForUser(userId) {
        // Remove from scheduled jobs
        if (this.scheduledJobs.has(userId)) {
            clearInterval(this.scheduledJobs.get(userId));
            this.scheduledJobs.delete(userId);
        }

        // Remove pending jobs
        for (const [jobId, job] of this.jobQueue.entries()) {
            if (job.userId === userId) {
                this.jobQueue.delete(jobId);
            }
        }

        console.log(`🛑 Collection stopped for user ${userId}`);
    }

    /**
     * Gets collection statistics
     * @returns {Object} Collection statistics
     */
    getCollectionStatistics() {
        return {
            ...this.stats,
            queueSize: this.jobQueue.size,
            scheduledUsers: this.scheduledJobs.size,
            settings: this.collectionSettings
        };
    }

    /**
     * Forces immediate collection for a user (for testing)
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} Collection result
     */
    async forceCollection(userId) {
        console.log(`🔨 Forcing immediate collection for ${userId}`);
        return await this.collectPersonalityData(userId);
    }

    /**
     * Clears all jobs and stops processing
     */
    shutdown() {
        console.log('🛑 Shutting down personality collector');
        
        // Clear all scheduled jobs
        for (const intervalId of this.scheduledJobs.values()) {
            clearInterval(intervalId);
        }
        
        // Clear queues
        this.jobQueue.clear();
        this.scheduledJobs.clear();
        
        console.log('✅ Personality collector shutdown complete');
    }
}

// Export singleton instance
module.exports = new PersonalityCollector();