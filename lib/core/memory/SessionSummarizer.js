/**
 * @fileoverview AI-powered session summarization system for episodic memory
 * @author AI Girlfriend Development Team
 * @created 2025-09-04
 * 
 * @example
 * const sessionSummarizer = new SessionSummarizer();
 * const result = await sessionSummarizer.createSessionSummary(userId, messages);
 */

// Dependencies
const OpenAIService = require('../../api/openai');
const ImportanceScorer = require('./ImportanceScorer');

/**
 * AI-powered session summarization system
 * Creates intelligent summaries with vector embeddings for episodic memory storage
 */
class SessionSummarizer {
    constructor(memoryManager = null) {
        this.openAIService = OpenAIService;
        this.memoryManager = memoryManager; // Will be injected by MemoryManager
        this.importanceScorer = new ImportanceScorer();
        
        // Configuration
        this.config = {
            minMessagesForSummary: 3,
            maxSummaryLength: 250,
            embeddingModel: 'text-embedding-3-small',
            summaryModel: process.env.OPENAI_MODEL || 'gpt-4o-mini'
        };

        // Statistics tracking
        this.stats = {
            summariesGenerated: 0,
            embeddingsCreated: 0,
            errors: 0,
            averageSummaryTime: 0,
            lastOperation: null
        };
    }

    /**
     * Create session summary with AI-powered analysis and vector embeddings
     * @param {string} userId - User identifier
     * @param {Array} messages - Conversation messages
     * @param {Object} sessionMetadata - Additional session information
     * @returns {Promise<Object>} Summary creation result
     */
    async createSessionSummary(userId, messages, sessionMetadata = {}) {
        const startTime = Date.now();
        
        try {
            this._validateInputs(userId, messages);

            // Extract metadata from messages and session
            const metadata = await this.extractMetadata(messages, sessionMetadata);
            
            // Generate AI-powered summary
            const summary = await this.generateAISummary(messages, metadata);
            
            // Create vector embedding for semantic search
            const embedding = await this.createEmbedding(summary);
            
            // Calculate session importance
            const sessionImportance = this._calculateSessionImportance(messages, metadata);
            
            // Store in episodic memory
            const result = await this.storeEpisodicMemory({
                userId,
                summary,
                vectorEmbedding: embedding,
                ...metadata,
                importanceScore: sessionImportance.score,
                importanceLevel: sessionImportance.level,
                importanceFactors: sessionImportance.factors
            });

            // Update statistics
            const processingTime = Date.now() - startTime;
            this._updateStats('createSessionSummary', processingTime);

            return {
                success: true,
                episodeId: result.episodeId,
                summary,
                embedding: embedding.length,
                metadata,
                processingTime,
                importanceScore: sessionImportance.score,
                importanceLevel: sessionImportance.level
            };

        } catch (error) {
            this._handleError('createSessionSummary', error);
            throw error;
        }
    }

    /**
     * Generate AI-powered summary of conversation messages
     * @param {Array} messages - Conversation messages
     * @param {Object} metadata - Session metadata for context
     * @returns {Promise<string>} Generated summary
     */
    async generateAISummary(messages, metadata = {}) {
        try {
            // Prepare messages for summarization
            const processedMessages = this._preprocessMessages(messages);
            
            // Create summarization options based on metadata
            const summaryOptions = {
                maxLength: this.config.maxSummaryLength,
                focusOn: this._determineFocusAreas(metadata),
                includeMetadata: true
            };

            // Generate summary using OpenAI
            const summary = await this.openAIService.generateSessionSummary(
                processedMessages, 
                summaryOptions
            );

            // Enhance summary with metadata context
            const enhancedSummary = this._enhanceSummaryWithMetadata(summary, metadata);

            return enhancedSummary;

        } catch (error) {
            console.error('SessionSummarizer.generateAISummary error:', error);
            throw new Error(`Failed to generate AI summary: ${error.message}`);
        }
    }

    /**
     * Create vector embedding for semantic search
     * @param {string} text - Text to create embedding for
     * @returns {Promise<Array>} Vector embedding (1536 dimensions)
     */
    async createEmbedding(text) {
        try {
            if (!text || typeof text !== 'string' || text.trim().length < 10) {
                throw new Error('Valid text (min 10 characters) required for embedding');
            }

            const embedding = await this.openAIService.createEmbedding(text);
            
            this.stats.embeddingsCreated++;
            
            return embedding;

        } catch (error) {
            console.error('SessionSummarizer.createEmbedding error:', error);
            throw new Error(`Failed to create embedding: ${error.message}`);
        }
    }

    /**
     * Extract comprehensive metadata from messages and session context
     * @param {Array} messages - Conversation messages
     * @param {Object} sessionMetadata - Additional session data
     * @returns {Promise<Object>} Extracted metadata
     */
    async extractMetadata(messages, sessionMetadata = {}) {
        try {
            const messageCount = messages.length;
            const sessionStart = new Date();
            
            // Calculate session duration (estimate from metadata or use current time)
            const sessionDuration = sessionMetadata.duration || 
                this._estimateSessionDuration(messages);

            // Extract topics and emotions using existing OpenAI service
            const keywordAnalysis = await this._analyzeSessionContent(messages);

            // Calculate conversation quality metrics
            const qualityMetrics = this._calculateQualityMetrics(messages);

            // Extract key topics
            const topics = this._extractKeyTopics(messages, keywordAnalysis);

            // Determine primary emotion
            const primaryEmotion = this._determinePrimaryEmotion(messages, keywordAnalysis);

            // Calculate importance factors
            const importanceFactors = this._analyzeImportanceFactors(messages);

            return {
                date: sessionMetadata.date || new Date().toISOString().split('T')[0],
                messageCount,
                conversationLength: this._calculateConversationLength(messages),
                sessionDuration,
                topics,
                primaryEmotion,
                qualityScore: qualityMetrics.overall,
                participationBalance: qualityMetrics.participationBalance,
                averageMessageLength: qualityMetrics.averageMessageLength,
                emotionalIntensity: qualityMetrics.emotionalIntensity,
                source: sessionMetadata.source || 'conversation',
                platform: sessionMetadata.platform || 'web',
                
                // Keyword analysis results
                entities: keywordAnalysis.entities,
                intents: keywordAnalysis.intents,
                contextMarkers: keywordAnalysis.context,
                nsfwClassification: keywordAnalysis.nsfw_classification,
                
                // Importance analysis
                importanceFactors,
                
                // Session metadata
                ...sessionMetadata
            };

        } catch (error) {
            console.error('SessionSummarizer.extractMetadata error:', error);
            // Return basic metadata on error
            return {
                date: new Date().toISOString().split('T')[0],
                messageCount: messages.length,
                conversationLength: messages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0),
                topics: ['conversation'],
                primaryEmotion: 'neutral',
                qualityScore: 0.5,
                source: 'conversation',
                ...sessionMetadata
            };
        }
    }

    /**
     * Store episodic memory using MemoryManager
     * @param {Object} memoryData - Complete memory data
     * @returns {Promise<Object>} Storage result
     */
    async storeEpisodicMemory(memoryData) {
        try {
            const result = await this.memoryManager.createEpisodicMemory(
                memoryData.userId,
                memoryData.summary,
                memoryData
            );

            // Update embedding in episodic memory if provided
            if (memoryData.vectorEmbedding && result.episodeId) {
                await this.memoryManager.episodicMemory.updateEmbedding(
                    memoryData.userId,
                    result.episodeId,
                    memoryData.vectorEmbedding
                );
            }

            return result;

        } catch (error) {
            console.error('SessionSummarizer.storeEpisodicMemory error:', error);
            throw new Error(`Failed to store episodic memory: ${error.message}`);
        }
    }

    /**
     * Batch process multiple sessions for summarization
     * @param {string} userId - User identifier
     * @param {Array} sessionBatch - Array of session data
     * @returns {Promise<Array>} Batch processing results
     */
    async batchProcessSessions(userId, sessionBatch) {
        try {
            const results = [];
            
            for (const session of sessionBatch) {
                try {
                    const result = await this.createSessionSummary(
                        userId, 
                        session.messages, 
                        session.metadata || {}
                    );
                    results.push({ success: true, ...result });
                } catch (error) {
                    results.push({ 
                        success: false, 
                        error: error.message,
                        sessionId: session.sessionId || 'unknown'
                    });
                }
            }

            return {
                totalSessions: sessionBatch.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results
            };

        } catch (error) {
            console.error('SessionSummarizer.batchProcessSessions error:', error);
            throw new Error(`Batch processing failed: ${error.message}`);
        }
    }

    /**
     * Get summarization statistics
     * @returns {Object} Current statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }

    // Private helper methods

    /**
     * Validate input parameters
     * @private
     */
    _validateInputs(userId, messages) {
        if (!userId || typeof userId !== 'string') {
            throw new Error('Valid userId is required');
        }
        
        if (!Array.isArray(messages) || messages.length < this.config.minMessagesForSummary) {
            throw new Error(`At least ${this.config.minMessagesForSummary} messages required for summary`);
        }

        // Validate message structure
        for (const msg of messages) {
            if (!msg.content || typeof msg.content !== 'string') {
                throw new Error('All messages must have valid content');
            }
            if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
                throw new Error('All messages must have valid role (user or assistant)');
            }
        }
    }

    /**
     * Preprocess messages for better summarization
     * @private
     */
    _preprocessMessages(messages) {
        return messages
            .filter(msg => msg.content && msg.content.trim().length > 0)
            .map(msg => ({
                role: msg.role,
                content: msg.content.trim(),
                timestamp: msg.timestamp || new Date().toISOString()
            }));
    }

    /**
     * Determine focus areas based on metadata
     * @private
     */
    _determineFocusAreas(metadata) {
        const focusAreas = ['key_topics', 'emotions'];
        
        if (metadata.importanceFactors?.personalRevelation) {
            focusAreas.push('personal_revelations');
        }
        if (metadata.importanceFactors?.lifeEvent) {
            focusAreas.push('life_events');
        }
        if (metadata.importanceFactors?.goalSetting) {
            focusAreas.push('goals_aspirations');
        }
        
        return focusAreas;
    }

    /**
     * Enhance summary with metadata context
     * @private
     */
    _enhanceSummaryWithMetadata(summary, metadata) {
        let enhanced = summary;

        // Add emotional context if significant
        if (metadata.emotionalIntensity > 0.7) {
            enhanced += ` [High emotional intensity: ${metadata.primaryEmotion}]`;
        }

        // Add importance markers
        if (metadata.importanceFactors?.emotionalMilestone) {
            enhanced += ' [Emotional milestone]';
        }
        if (metadata.importanceFactors?.personalRevelation) {
            enhanced += ' [Personal revelation]';
        }
        if (metadata.importanceFactors?.lifeEvent) {
            enhanced += ' [Life event]';
        }

        return enhanced;
    }

    /**
     * Analyze session content using OpenAI
     * @private
     */
    async _analyzeSessionContent(messages) {
        try {
            // Combine all messages into analysis text
            const analysisText = messages
                .map(msg => msg.content)
                .join(' ')
                .substring(0, 2000); // Limit for API efficiency

            return await this.openAIService.extractKeywords(analysisText);
        } catch (error) {
            console.warn('Session content analysis failed, using fallback');
            return {
                entities: [],
                topics: ['conversation'],
                intents: ['discussion'],
                emotions: ['neutral'],
                context: ['general'],
                nsfw_classification: { isNSFW: false, category: 'general', confidence: 0.5 }
            };
        }
    }

    /**
     * Calculate conversation quality metrics
     * @private
     */
    _calculateQualityMetrics(messages) {
        const totalLength = messages.reduce((acc, msg) => acc + msg.content.length, 0);
        const userMessages = messages.filter(msg => msg.role === 'user');
        const assistantMessages = messages.filter(msg => msg.role === 'assistant');
        
        // Calculate participation balance (0.5 = perfect balance)
        const userRatio = userMessages.length / messages.length;
        const participationBalance = 1 - Math.abs(0.5 - userRatio);
        
        // Calculate average message length
        const averageMessageLength = totalLength / messages.length;
        
        // Estimate emotional intensity based on message characteristics
        const emotionalKeywords = ['love', 'hate', 'excited', 'sad', 'happy', 'angry', 'worried', 'afraid'];
        const emotionalMessages = messages.filter(msg => 
            emotionalKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
        );
        const emotionalIntensity = emotionalMessages.length / messages.length;
        
        // Overall quality score (0-1)
        const qualityFactors = [
            Math.min(participationBalance * 2, 1), // Balanced conversation
            Math.min(averageMessageLength / 50, 1), // Substantial messages
            Math.min(messages.length / 10, 1), // Good length conversation
            emotionalIntensity // Emotional engagement
        ];
        
        const overall = qualityFactors.reduce((acc, factor) => acc + factor, 0) / qualityFactors.length;
        
        return {
            overall: Math.round(overall * 100) / 100,
            participationBalance: Math.round(participationBalance * 100) / 100,
            averageMessageLength: Math.round(averageMessageLength),
            emotionalIntensity: Math.round(emotionalIntensity * 100) / 100
        };
    }

    /**
     * Extract key topics from messages
     * @private
     */
    _extractKeyTopics(messages, keywordAnalysis) {
        const topics = keywordAnalysis.topics || [];
        
        // Add fallback topic extraction from message content
        if (topics.length === 0) {
            const commonWords = this._extractCommonWords(messages);
            topics.push(...commonWords.slice(0, 3));
        }
        
        return topics.slice(0, 5); // Limit to 5 topics
    }

    /**
     * Determine primary emotion from conversation
     * @private
     */
    _determinePrimaryEmotion(messages, keywordAnalysis) {
        const emotions = keywordAnalysis.emotions || ['neutral'];
        
        // Use the first emotion as primary, or neutral as fallback
        return emotions[0] || 'neutral';
    }

    /**
     * Calculate session importance using ImportanceScorer
     * @private
     */
    _calculateSessionImportance(messages, metadata) {
        try {
            // Create a combined context for importance analysis
            const conversationText = messages
                .map(msg => msg.content)
                .join(' ')
                .substring(0, 1000); // Limit for performance

            const context = {
                userId: 'session_analysis',
                sessionLength: messages.length,
                emotionalIntensity: metadata.emotionalIntensity,
                qualityScore: metadata.qualityScore,
                topics: metadata.topics
            };

            const analysis = this.importanceScorer.analyzeImportanceFactors(
                conversationText, 
                '', 
                context
            );

            return {
                score: analysis.score,
                level: analysis.level,
                factors: analysis.factors
            };
        } catch (error) {
            console.warn('Session importance calculation failed, using default');
            return {
                score: 0.5,
                level: 'medium',
                factors: {}
            };
        }
    }

    /**
     * Analyze importance factors for session
     * @private
     */
    _analyzeImportanceFactors(messages) {
        const factors = {
            emotionalMilestone: false,
            personalRevelation: false,
            lifeEvent: false,
            goalSetting: false,
            preferenceDeclaration: false
        };

        // Simple keyword-based analysis (could be enhanced with AI)
        const conversationText = messages.map(msg => msg.content).join(' ').toLowerCase();

        // Check for emotional milestones
        const emotionalKeywords = ['devastated', 'elated', 'heartbroken', 'overjoyed', 'breakthrough'];
        factors.emotionalMilestone = emotionalKeywords.some(keyword => conversationText.includes(keyword));

        // Check for personal revelations
        const revelationKeywords = ['secret', 'never told', 'confession', 'truth is', 'admit'];
        factors.personalRevelation = revelationKeywords.some(keyword => conversationText.includes(keyword));

        // Check for life events
        const lifeEventKeywords = ['married', 'died', 'graduated', 'promoted', 'moved', 'diagnosed'];
        factors.lifeEvent = lifeEventKeywords.some(keyword => conversationText.includes(keyword));

        // Check for goal setting
        const goalKeywords = ['want to', 'plan to', 'goal', 'dream', 'aspire'];
        factors.goalSetting = goalKeywords.some(keyword => conversationText.includes(keyword));

        // Check for preferences
        const preferenceKeywords = ['favorite', 'prefer', 'like', 'love', 'enjoy'];
        factors.preferenceDeclaration = preferenceKeywords.some(keyword => conversationText.includes(keyword));

        return factors;
    }

    /**
     * Estimate session duration from message timestamps or use default
     * @private
     */
    _estimateSessionDuration(messages) {
        if (messages.length < 2) return 300; // 5 minutes default

        // If messages have timestamps, calculate actual duration
        const timestamps = messages
            .map(msg => msg.timestamp)
            .filter(ts => ts)
            .map(ts => new Date(ts).getTime());

        if (timestamps.length >= 2) {
            const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000;
            return Math.max(60, Math.min(3600, duration)); // Between 1 minute and 1 hour
        }

        // Estimate based on message count (average 30 seconds per exchange)
        return Math.min(messages.length * 15, 1800); // Max 30 minutes
    }

    /**
     * Calculate total conversation length in characters
     * @private
     */
    _calculateConversationLength(messages) {
        return messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
    }

    /**
     * Extract common words for topic identification
     * @private
     */
    _extractCommonWords(messages) {
        const text = messages.map(msg => msg.content).join(' ').toLowerCase();
        const words = text.split(/\s+/).filter(word => word.length > 4);
        const frequency = {};

        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    /**
     * Update statistics
     * @private
     */
    _updateStats(operation, processingTime = 0) {
        this.stats.summariesGenerated++;
        this.stats.lastOperation = {
            operation,
            timestamp: new Date().toISOString(),
            processingTime
        };

        // Update average processing time
        if (processingTime > 0) {
            this.stats.averageSummaryTime = 
                (this.stats.averageSummaryTime + processingTime) / 2;
        }
    }

    /**
     * Handle errors with logging
     * @private
     */
    _handleError(operation, error) {
        this.stats.errors++;
        console.error(`SessionSummarizer.${operation} error:`, error.message);
        
        // Log error details for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('Error stack:', error.stack);
        }
    }
}

module.exports = SessionSummarizer;