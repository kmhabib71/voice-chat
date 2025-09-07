/**
 * @fileoverview Core personality analysis system to build user personality profiles
 * @author AI Girlfriend Development Team
 * @created 2025-09-07
 * 
 * @example
 * const personalityAnalyzer = require('./PersonalityAnalyzer');
 * const profile = await personalityAnalyzer.analyzePersonality(userId, conversationHistory);
 */

// Infrastructure dependencies
const { getCollection, COLLECTIONS } = require('../../infrastructure/database');

// Core dependencies
const TraitExtractor = require('./TraitExtractor');

// API dependencies for AI analysis
const openaiService = require('../../api/openai');

/**
 * Core personality analysis system
 * Analyzes communication patterns from memory data and extracts Big Five + custom traits
 */
class PersonalityAnalyzer {
    constructor() {
        this.traitExtractor = new TraitExtractor();
        
        // Personality analysis statistics
        this.stats = {
            analysisCount: 0,
            profilesUpdated: 0,
            errors: 0,
            lastAnalysis: null,
            averageAnalysisTime: 0
        };
        
        // Minimum conversation data required for reliable analysis
        this.minimumDataThreshold = {
            messages: 10,
            sessions: 3,
            timespan: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        };
    }

    /**
     * Analyzes user personality from conversation history
     * @param {string} userId - User identifier
     * @param {Array} conversationHistory - Array of conversation messages
     * @returns {Promise<Object>} Personality profile following TASKS.md structure
     * @throws {ValidationError} When insufficient data or invalid userId
     */
    async analyzePersonality(userId, conversationHistory = null) {
        const startTime = Date.now();
        
        try {
            console.log(`🧠 === PERSONALITY ANALYSIS START for ${userId} ===`);

            // Get conversation history if not provided
            if (!conversationHistory) {
                conversationHistory = await this._getConversationHistory(userId);
            }

            // Validate sufficient data for analysis
            if (!this._hasSufficientData(conversationHistory)) {
                console.log('⚠️ Insufficient data for personality analysis');
                return await this._getDefaultPersonalityProfile(userId);
            }

            // Extract communication patterns and content
            const communicationPatterns = await this._analyzeCommunicationPatterns(conversationHistory);
            const emotionalPatterns = await this._analyzeEmotionalPatterns(conversationHistory);
            const topicPatterns = await this._analyzeTopicPatterns(conversationHistory);

            // Build personality profile using extracted data
            const personalityProfile = await this._buildPersonalityProfile({
                userId,
                communicationPatterns,
                emotionalPatterns,
                topicPatterns,
                conversationHistory
            });

            // Store personality profile in database
            await this._storePersonalityProfile(userId, personalityProfile);

            // Update statistics
            const analysisTime = Date.now() - startTime;
            this._updateAnalysisStats(analysisTime);

            console.log(`✅ Personality analysis completed in ${analysisTime}ms`);
            return personalityProfile;

        } catch (error) {
            this.stats.errors++;
            console.error('❌ Error in personality analysis:', error);
            
            // Return fallback profile on error
            return await this._getDefaultPersonalityProfile(userId);
        }
    }

    /**
     * Updates personality profile gradually over time
     * @param {string} userId - User identifier
     * @param {Object} newData - New conversation data to incorporate
     * @returns {Promise<Object>} Updated personality profile
     */
    async updatePersonalityProfile(userId, newData) {
        try {
            const existingProfile = await this.getPersonalityProfile(userId);
            if (!existingProfile) {
                return await this.analyzePersonality(userId);
            }

            // Gradual update strategy - blend old and new insights
            const updatedProfile = await this._blendPersonalityData(existingProfile, newData);
            
            await this._storePersonalityProfile(userId, updatedProfile);
            this.stats.profilesUpdated++;
            
            return updatedProfile;

        } catch (error) {
            console.error('Error updating personality profile:', error);
            throw error;
        }
    }

    /**
     * Gets existing personality profile from database
     * @param {string} userId - User identifier
     * @returns {Promise<Object|null>} Personality profile or null if not found
     */
    async getPersonalityProfile(userId) {
        try {
            const collection = await getCollection(COLLECTIONS.AI_PERSONALITY);
            const profile = await collection.findOne({ userId });
            
            return profile ? profile.personalityProfile : null;

        } catch (error) {
            console.error('Error retrieving personality profile:', error);
            return null;
        }
    }

    /**
     * Analyzes communication patterns from conversation history
     * @private
     */
    async _analyzeCommunicationPatterns(conversationHistory) {
        const patterns = {
            messageLength: this._analyzeMessageLength(conversationHistory),
            topicDeepness: this._analyzeTopicDeepness(conversationHistory),
            emotionalSharing: this._analyzeEmotionalSharing(conversationHistory),
            responseLatency: this._analyzeResponsePatterns(conversationHistory),
            conversationInitiation: this._analyzeInitiationPatterns(conversationHistory)
        };

        return patterns;
    }

    /**
     * Analyzes emotional patterns from conversation history
     * @private
     */
    async _analyzeEmotionalPatterns(conversationHistory) {
        const emotionalContent = conversationHistory
            .filter(msg => msg.sender === 'user')
            .map(msg => msg.message)
            .join('\n');

        // Use AI to analyze emotional patterns
        const emotionalAnalysis = await this._getAIEmotionalAnalysis(emotionalContent);
        
        return {
            emotionalNeedLevel: emotionalAnalysis.needLevel || 0.5,
            stressTriggers: emotionalAnalysis.stressTriggers || [],
            comfortSeekers: emotionalAnalysis.comfortSeekers || [],
            joyTriggers: emotionalAnalysis.joyTriggers || [],
            emotionalVolatility: emotionalAnalysis.volatility || 0.3
        };
    }

    /**
     * Analyzes topic patterns from conversation history
     * @private
     */
    async _analyzeTopicPatterns(conversationHistory) {
        const userMessages = conversationHistory
            .filter(msg => msg.sender === 'user')
            .map(msg => msg.message);

        return {
            preferredTopics: await this._extractPreferredTopics(userMessages),
            avoidedTopics: await this._extractAvoidedTopics(userMessages),
            conversationStyle: await this._analyzeConversationStyle(userMessages)
        };
    }

    /**
     * Builds complete personality profile from analyzed patterns
     * @private
     */
    async _buildPersonalityProfile(data) {
        const { userId, communicationPatterns, emotionalPatterns, topicPatterns } = data;

        // Use TraitExtractor to get Big Five traits
        const bigFiveTraits = await this.traitExtractor.extractBigFiveTraits(data.conversationHistory);

        // Build complete personality profile according to TASKS.md specification
        const personalityProfile = {
            userId,
            lastAnalyzed: new Date(),
            analysisVersion: "1.0",
            dataQuality: this._assessDataQuality(data.conversationHistory),
            
            corePersonality: {
                openness: bigFiveTraits.openness || 0.5,
                conscientiousness: bigFiveTraits.conscientiousness || 0.5,
                extraversion: bigFiveTraits.extraversion || 0.5,
                agreeableness: bigFiveTraits.agreeableness || 0.5,
                neuroticism: bigFiveTraits.neuroticism || 0.5
            },
            
            emotionalProfile: {
                emotionalNeedLevel: emotionalPatterns.emotionalNeedLevel,
                stressTriggers: emotionalPatterns.stressTriggers,
                comfortSeekers: emotionalPatterns.comfortSeekers,
                joyTriggers: emotionalPatterns.joyTriggers
            },
            
            communicationStyle: {
                messageLength: communicationPatterns.messageLength,
                topicDeepness: communicationPatterns.topicDeepness,
                emotionalSharing: communicationPatterns.emotionalSharing
            },
            
            relationshipDesires: {
                idealGirlfriendType: await this._determineIdealGirlfriendType(data),
                boundaryComfort: await this._analyzeBoundaryComfort(data),
                exclusivityDesire: await this._analyzeExclusivityDesire(data)
            }
        };

        return personalityProfile;
    }

    /**
     * Gets conversation history for personality analysis
     * @private
     */
    async _getConversationHistory(userId) {
        try {
            // Get from episodic memory and short-term memory
            const shortTermCollection = await getCollection(COLLECTIONS.SHORT_TERM_MEMORY);
            const episodicCollection = await getCollection(COLLECTIONS.EPISODIC_MEMORY);

            const [shortTermData, episodicData] = await Promise.all([
                shortTermCollection.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray(),
                episodicCollection.find({ userId }).sort({ createdAt: -1 }).limit(20).toArray()
            ]);

            // Combine and structure conversation history
            const conversationHistory = [];
            
            // Add recent short-term messages
            shortTermData.forEach(session => {
                if (session.messages) {
                    session.messages.forEach(msg => {
                        conversationHistory.push({
                            sender: msg.sender || 'user',
                            message: msg.content || msg.message || msg,
                            timestamp: session.createdAt,
                            sessionId: session.sessionId
                        });
                    });
                }
            });

            // Add episodic summaries as conversation context
            episodicData.forEach(episode => {
                conversationHistory.push({
                    sender: 'system',
                    message: `[Session Summary] ${episode.summary}`,
                    timestamp: episode.createdAt,
                    topics: episode.topics,
                    emotion: episode.primaryEmotion
                });
            });

            return conversationHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }

    /**
     * Checks if there's sufficient data for reliable personality analysis
     * @private
     */
    _hasSufficientData(conversationHistory) {
        const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
        const uniqueSessions = new Set(conversationHistory.map(msg => msg.sessionId)).size;
        
        const oldestMessage = conversationHistory.length > 0 ? 
            Math.min(...conversationHistory.map(msg => new Date(msg.timestamp).getTime())) : 
            Date.now();
        const timespan = Date.now() - oldestMessage;

        return userMessages.length >= this.minimumDataThreshold.messages &&
               uniqueSessions >= this.minimumDataThreshold.sessions &&
               timespan >= this.minimumDataThreshold.timespan;
    }

    /**
     * Returns default personality profile for new or insufficient data users
     * @private
     */
    async _getDefaultPersonalityProfile(userId) {
        return {
            userId,
            lastAnalyzed: new Date(),
            analysisVersion: "1.0",
            dataQuality: "insufficient",
            
            corePersonality: {
                openness: 0.5,
                conscientiousness: 0.5,
                extraversion: 0.5,
                agreeableness: 0.5,
                neuroticism: 0.5
            },
            
            emotionalProfile: {
                emotionalNeedLevel: 0.5,
                stressTriggers: [],
                comfortSeekers: [],
                joyTriggers: []
            },
            
            communicationStyle: {
                messageLength: "medium",
                topicDeepness: "moderate",
                emotionalSharing: "gradual"
            },
            
            relationshipDesires: {
                idealGirlfriendType: "companion",
                boundaryComfort: 0.5,
                exclusivityDesire: 0.5
            }
        };
    }

    /**
     * Uses AI to analyze emotional content for deeper insights
     * @private
     */
    async _getAIEmotionalAnalysis(emotionalContent) {
        try {
            if (!emotionalContent || emotionalContent.trim().length < 50) {
                return {
                    needLevel: 0.5,
                    stressTriggers: [],
                    comfortSeekers: [],
                    joyTriggers: [],
                    volatility: 0.3
                };
            }

            const prompt = `Analyze the emotional patterns in this conversation content and return a JSON response:

Content: "${emotionalContent.substring(0, 1000)}"

Return JSON with:
- needLevel: emotional need level 0.0-1.0
- stressTriggers: array of stress trigger keywords
- comfortSeekers: array of comfort-seeking behaviors
- joyTriggers: array of joy-inducing topics
- volatility: emotional volatility 0.0-1.0

Response must be valid JSON only.`;

            const response = await openaiService.generateChatCompletion(prompt, {
                maxTokens: 200,
                temperature: 0.3
            });

            return JSON.parse(response.trim());

        } catch (error) {
            console.error('Error in AI emotional analysis:', error);
            return {
                needLevel: 0.5,
                stressTriggers: [],
                comfortSeekers: [],
                joyTriggers: [],
                volatility: 0.3
            };
        }
    }

    /**
     * Analyzes message length patterns
     * @private
     */
    _analyzeMessageLength(conversationHistory) {
        const userMessages = conversationHistory
            .filter(msg => msg.sender === 'user')
            .map(msg => msg.message.length);

        if (userMessages.length === 0) return "medium";

        const averageLength = userMessages.reduce((a, b) => a + b, 0) / userMessages.length;
        
        if (averageLength < 30) return "short";
        if (averageLength > 100) return "long";
        return "medium";
    }

    /**
     * Analyzes topic depth patterns
     * @private
     */
    _analyzeTopicDeepness(conversationHistory) {
        const userMessages = conversationHistory
            .filter(msg => msg.sender === 'user')
            .map(msg => msg.message);

        // Check for indicators of deep conversation
        const deepIndicators = [
            /feelings?|emotion|feel|heart|soul/i,
            /dream|goal|future|hope|aspir/i,
            /relationship|love|care|connect/i,
            /meaning|purpose|philosophy|belief/i
        ];

        const deepTopics = userMessages.filter(msg => 
            deepIndicators.some(pattern => pattern.test(msg))
        );

        const deepRatio = deepTopics.length / Math.max(userMessages.length, 1);
        
        if (deepRatio > 0.3) return "deep";
        if (deepRatio > 0.1) return "moderate"; 
        return "surface";
    }

    /**
     * Analyzes emotional sharing patterns
     * @private
     */
    _analyzeEmotionalSharing(conversationHistory) {
        const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
        
        if (userMessages.length < 5) return "gradual";
        
        // Look for emotional content in early vs later messages
        const earlyMessages = userMessages.slice(0, Math.ceil(userMessages.length / 3));
        const emotionalPattern = /feel|emotion|happy|sad|angry|excited|nervous|love|hate/i;
        
        const earlyEmotional = earlyMessages.filter(msg => emotionalPattern.test(msg.message));
        
        if (earlyEmotional.length > earlyMessages.length * 0.4) return "immediate";
        if (earlyEmotional.length === 0) return "rare";
        return "gradual";
    }

    /**
     * Stores personality profile in database
     * @private
     */
    async _storePersonalityProfile(userId, personalityProfile) {
        try {
            const collection = await getCollection(COLLECTIONS.AI_PERSONALITY);
            
            await collection.updateOne(
                { userId },
                {
                    $set: {
                        userId,
                        name: "Emma", // Default AI name
                        backstory: "AI girlfriend with adaptive personality",
                        traits: Object.keys(personalityProfile.corePersonality),
                        relationshipRole: "girlfriend",
                        humorStyle: "adaptive",
                        responsePatterns: personalityProfile.communicationStyle,
                        memoryOfUser: personalityProfile,
                        personalityProfile: personalityProfile,
                        lastUpdated: new Date()
                    }
                },
                { upsert: true }
            );

            console.log(`✅ Personality profile stored for ${userId}`);

        } catch (error) {
            console.error('Error storing personality profile:', error);
            throw error;
        }
    }

    /**
     * Updates analysis statistics
     * @private
     */
    _updateAnalysisStats(analysisTime) {
        this.stats.analysisCount++;
        this.stats.lastAnalysis = new Date();
        
        // Update average analysis time
        if (this.stats.averageAnalysisTime === 0) {
            this.stats.averageAnalysisTime = analysisTime;
        } else {
            this.stats.averageAnalysisTime = 
                (this.stats.averageAnalysisTime * (this.stats.analysisCount - 1) + analysisTime) / 
                this.stats.analysisCount;
        }
    }

    /**
     * Gets personality analysis statistics
     * @returns {Object} Analysis statistics
     */
    getAnalysisStatistics() {
        return {
            ...this.stats,
            dataQuality: {
                minimumMessages: this.minimumDataThreshold.messages,
                minimumSessions: this.minimumDataThreshold.sessions,
                minimumTimespan: this.minimumDataThreshold.timespan
            }
        };
    }

    // Helper methods for personality profile building
    async _determineIdealGirlfriendType(data) {
        // Analyze conversation patterns to determine user's ideal type
        const { conversationHistory } = data;
        
        // Look for indicators
        const supportNeed = conversationHistory.filter(msg => 
            msg.sender === 'user' && /support|help|advice|guidance/i.test(msg.message)
        ).length;
        
        const romanticContent = conversationHistory.filter(msg =>
            msg.sender === 'user' && /love|romance|relationship|dating|partner/i.test(msg.message)
        ).length;
        
        const friendshipContent = conversationHistory.filter(msg =>
            msg.sender === 'user' && /friend|buddy|companion|hang out/i.test(msg.message)
        ).length;

        if (romanticContent > friendshipContent && romanticContent > supportNeed) return "romantic-partner";
        if (supportNeed > friendshipContent && supportNeed > romanticContent) return "mentor";
        return "best-friend";
    }

    async _analyzeBoundaryComfort(data) {
        // Analyze NSFW content and personal disclosure comfort
        return 0.5; // Default - would need more sophisticated analysis
    }

    async _analyzeExclusivityDesire(data) {
        // Analyze possessiveness and exclusivity indicators
        return 0.6; // Default higher - most users prefer some exclusivity
    }

    _assessDataQuality(conversationHistory) {
        const messageCount = conversationHistory.filter(msg => msg.sender === 'user').length;
        
        if (messageCount < 10) return "low";
        if (messageCount < 30) return "medium";
        if (messageCount < 100) return "good";
        return "excellent";
    }

    async _extractPreferredTopics(userMessages) {
        // Simple keyword extraction for preferred topics
        const topicMap = new Map();
        const topics = ['work', 'family', 'hobbies', 'sports', 'movies', 'music', 'food', 'travel'];
        
        userMessages.forEach(message => {
            topics.forEach(topic => {
                if (message.toLowerCase().includes(topic)) {
                    topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
                }
            });
        });

        return Array.from(topicMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic]) => topic);
    }

    async _extractAvoidedTopics(userMessages) {
        // Detect topics user seems to avoid or respond negatively to
        return []; // Would need more sophisticated analysis
    }

    async _analyzeConversationStyle(userMessages) {
        const totalLength = userMessages.reduce((sum, msg) => sum + msg.length, 0);
        const avgLength = totalLength / Math.max(userMessages.length, 1);
        
        return {
            verbosity: avgLength > 100 ? "high" : avgLength > 50 ? "medium" : "low",
            questionAsking: userMessages.filter(msg => msg.includes('?')).length / Math.max(userMessages.length, 1),
            emotionalExpressiveness: userMessages.filter(msg => /!|excited|love|hate|amazing/i.test(msg)).length / Math.max(userMessages.length, 1)
        };
    }

    async _blendPersonalityData(existingProfile, newData) {
        // Gradual personality profile updates - blend old and new data
        const blendFactor = 0.2; // 20% new data influence
        
        const blendedProfile = JSON.parse(JSON.stringify(existingProfile));
        
        // Update core personality traits gradually
        if (newData.corePersonality) {
            Object.keys(newData.corePersonality).forEach(trait => {
                if (blendedProfile.corePersonality[trait] !== undefined) {
                    blendedProfile.corePersonality[trait] = 
                        blendedProfile.corePersonality[trait] * (1 - blendFactor) +
                        newData.corePersonality[trait] * blendFactor;
                }
            });
        }
        
        blendedProfile.lastAnalyzed = new Date();
        return blendedProfile;
    }

    async _analyzeResponsePatterns(conversationHistory) {
        // Analyze user response time patterns
        return "normal"; // Would need timestamps for real analysis
    }

    async _analyzeInitiationPatterns(conversationHistory) {
        // Analyze who initiates conversations
        return "balanced"; // Would need session start analysis
    }
}

module.exports = PersonalityAnalyzer;