/**
 * @fileoverview Individual trait analysis for Big Five personality model
 * @author AI Girlfriend Development Team
 * @created 2025-09-07
 * 
 * @example
 * const traitExtractor = require('./TraitExtractor');
 * const traits = await traitExtractor.extractBigFiveTraits(conversationHistory);
 */

// API dependencies for AI analysis
const openaiService = require('../../api/openai');

/**
 * Individual trait analysis for Big Five personality traits
 * Extracts personality indicators from conversation patterns
 */
class TraitExtractor {
    constructor() {
        // Big Five trait analysis patterns
        this.traitPatterns = {
            openness: {
                keywords: [
                    'creative', 'imagination', 'artistic', 'curious', 'explore', 'new',
                    'innovative', 'ideas', 'abstract', 'philosophy', 'adventure', 'experiment'
                ],
                negativeKeywords: [
                    'routine', 'traditional', 'conservative', 'practical', 'conventional'
                ],
                indicators: [
                    /new.{1,20}(idea|concept|experience)/i,
                    /creative|artistic|imagination/i,
                    /explore|discover|adventure/i,
                    /philosophy|abstract|intellectual/i
                ]
            },
            
            conscientiousness: {
                keywords: [
                    'organized', 'plan', 'schedule', 'goal', 'achievement', 'discipline',
                    'responsible', 'reliable', 'work', 'duty', 'commitment', 'efficient'
                ],
                negativeKeywords: [
                    'messy', 'disorganized', 'procrastinate', 'lazy', 'careless'
                ],
                indicators: [
                    /plan.{1,10}(ahead|future|goal)/i,
                    /organized|schedule|routine/i,
                    /work.{1,10}(hard|diligent|focused)/i,
                    /goal|achievement|success/i
                ]
            },
            
            extraversion: {
                keywords: [
                    'social', 'party', 'friends', 'outgoing', 'talkative', 'energetic',
                    'group', 'crowd', 'meeting', 'people', 'interaction', 'communicate'
                ],
                negativeKeywords: [
                    'alone', 'quiet', 'shy', 'introverted', 'solitude', 'withdrawn'
                ],
                indicators: [
                    /love.{1,20}(people|social|party)/i,
                    /friends|social|outgoing/i,
                    /energy|energetic|active/i,
                    /talk.{1,10}(lot|much|often)/i
                ]
            },
            
            agreeableness: {
                keywords: [
                    'kind', 'helpful', 'caring', 'compassionate', 'empathy', 'understanding',
                    'supportive', 'nice', 'gentle', 'considerate', 'cooperation', 'harmony'
                ],
                negativeKeywords: [
                    'selfish', 'rude', 'harsh', 'inconsiderate', 'conflict', 'argue'
                ],
                indicators: [
                    /help.{1,20}(others|people|someone)/i,
                    /care|caring|compassion/i,
                    /understand|empathy|support/i,
                    /kind|nice|gentle/i
                ]
            },
            
            neuroticism: {
                keywords: [
                    'stress', 'anxiety', 'worry', 'nervous', 'upset', 'emotional',
                    'moody', 'sensitive', 'overwhelmed', 'pressure', 'tension', 'fear'
                ],
                negativeKeywords: [
                    'calm', 'relaxed', 'stable', 'confident', 'peaceful', 'secure'
                ],
                indicators: [
                    /stress|anxiety|worry/i,
                    /nervous|overwhelmed|pressure/i,
                    /emotional|moody|sensitive/i,
                    /fear|afraid|scared/i
                ]
            }
        };

        // Trait scoring weights
        this.scoringWeights = {
            keywordMatch: 0.3,
            patternMatch: 0.4,
            contextualAnalysis: 0.3
        };
    }

    /**
     * Extracts Big Five personality traits from conversation history
     * @param {Array} conversationHistory - Array of conversation messages
     * @returns {Promise<Object>} Big Five trait scores (0.0-1.0)
     * @throws {Error} When conversation history is invalid
     */
    async extractBigFiveTraits(conversationHistory) {
        try {
            console.log('🔍 === BIG FIVE TRAIT EXTRACTION START ===');

            if (!conversationHistory || conversationHistory.length === 0) {
                return this._getDefaultTraitScores();
            }

            // Filter user messages for analysis
            const userMessages = conversationHistory
                .filter(msg => msg.sender === 'user')
                .map(msg => msg.message)
                .filter(msg => msg && msg.trim().length > 0);

            if (userMessages.length < 5) {
                console.log('⚠️ Insufficient user messages for trait analysis');
                return this._getDefaultTraitScores();
            }

            // Extract traits in parallel
            const [
                openness,
                conscientiousness, 
                extraversion,
                agreeableness,
                neuroticism
            ] = await Promise.all([
                this._extractOpenness(userMessages),
                this._extractConscientiousness(userMessages),
                this._extractExtraversion(userMessages),
                this._extractAgreeableness(userMessages),
                this._extractNeuroticism(userMessages)
            ]);

            const traits = {
                openness: this._normalizeScore(openness),
                conscientiousness: this._normalizeScore(conscientiousness),
                extraversion: this._normalizeScore(extraversion),
                agreeableness: this._normalizeScore(agreeableness),
                neuroticism: this._normalizeScore(neuroticism)
            };

            console.log('✅ Big Five trait extraction completed', traits);
            return traits;

        } catch (error) {
            console.error('❌ Error in Big Five trait extraction:', error);
            return this._getDefaultTraitScores();
        }
    }

    /**
     * Extracts openness to experience trait
     * @private
     */
    async _extractOpenness(userMessages) {
        const patterns = this.traitPatterns.openness;
        
        let score = 0.5; // Neutral baseline
        
        // Keyword analysis
        const keywordScore = this._analyzeKeywords(userMessages, patterns.keywords, patterns.negativeKeywords);
        
        // Pattern matching
        const patternScore = this._analyzePatterns(userMessages, patterns.indicators);
        
        // Contextual analysis using AI
        const contextualScore = await this._getAITraitAnalysis(userMessages, 'openness');
        
        // Combine scores
        score = (keywordScore * this.scoringWeights.keywordMatch) +
                (patternScore * this.scoringWeights.patternMatch) +
                (contextualScore * this.scoringWeights.contextualAnalysis);

        return score;
    }

    /**
     * Extracts conscientiousness trait
     * @private
     */
    async _extractConscientiousness(userMessages) {
        const patterns = this.traitPatterns.conscientiousness;
        
        let score = 0.5; // Neutral baseline
        
        const keywordScore = this._analyzeKeywords(userMessages, patterns.keywords, patterns.negativeKeywords);
        const patternScore = this._analyzePatterns(userMessages, patterns.indicators);
        const contextualScore = await this._getAITraitAnalysis(userMessages, 'conscientiousness');
        
        score = (keywordScore * this.scoringWeights.keywordMatch) +
                (patternScore * this.scoringWeights.patternMatch) +
                (contextualScore * this.scoringWeights.contextualAnalysis);

        return score;
    }

    /**
     * Extracts extraversion trait
     * @private
     */
    async _extractExtraversion(userMessages) {
        const patterns = this.traitPatterns.extraversion;
        
        let score = 0.5; // Neutral baseline
        
        // Additional extraversion indicators
        const messageLength = this._analyzeMessageVerbosity(userMessages);
        const socialLanguage = this._analyzeSocialLanguage(userMessages);
        
        const keywordScore = this._analyzeKeywords(userMessages, patterns.keywords, patterns.negativeKeywords);
        const patternScore = this._analyzePatterns(userMessages, patterns.indicators);
        const contextualScore = await this._getAITraitAnalysis(userMessages, 'extraversion');
        
        // Include additional indicators
        score = (keywordScore * 0.2) +
                (patternScore * 0.2) +
                (contextualScore * 0.3) +
                (messageLength * 0.15) +
                (socialLanguage * 0.15);

        return score;
    }

    /**
     * Extracts agreeableness trait
     * @private
     */
    async _extractAgreeableness(userMessages) {
        const patterns = this.traitPatterns.agreeableness;
        
        let score = 0.5; // Neutral baseline
        
        const keywordScore = this._analyzeKeywords(userMessages, patterns.keywords, patterns.negativeKeywords);
        const patternScore = this._analyzePatterns(userMessages, patterns.indicators);
        const contextualScore = await this._getAITraitAnalysis(userMessages, 'agreeableness');
        const politenessScore = this._analyzePoliteness(userMessages);
        
        score = (keywordScore * 0.25) +
                (patternScore * 0.25) +
                (contextualScore * 0.3) +
                (politenessScore * 0.2);

        return score;
    }

    /**
     * Extracts neuroticism trait
     * @private
     */
    async _extractNeuroticism(userMessages) {
        const patterns = this.traitPatterns.neuroticism;
        
        let score = 0.5; // Neutral baseline
        
        const keywordScore = this._analyzeKeywords(userMessages, patterns.keywords, patterns.negativeKeywords);
        const patternScore = this._analyzePatterns(userMessages, patterns.indicators);
        const contextualScore = await this._getAITraitAnalysis(userMessages, 'neuroticism');
        const emotionalVolatility = this._analyzeEmotionalVolatility(userMessages);
        
        score = (keywordScore * 0.25) +
                (patternScore * 0.25) +
                (contextualScore * 0.3) +
                (emotionalVolatility * 0.2);

        return score;
    }

    /**
     * Analyzes keywords for trait indicators
     * @private
     */
    _analyzeKeywords(userMessages, positiveKeywords, negativeKeywords) {
        const allText = userMessages.join(' ').toLowerCase();
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveKeywords.forEach(keyword => {
            const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
            positiveCount += matches;
        });
        
        negativeKeywords.forEach(keyword => {
            const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
            negativeCount += matches;
        });
        
        if (positiveCount + negativeCount === 0) return 0.5;
        
        const ratio = positiveCount / (positiveCount + negativeCount);
        return ratio;
    }

    /**
     * Analyzes regex patterns for trait indicators
     * @private
     */
    _analyzePatterns(userMessages, patterns) {
        let totalMatches = 0;
        let totalMessages = userMessages.length;
        
        userMessages.forEach(message => {
            patterns.forEach(pattern => {
                if (pattern.test(message)) {
                    totalMatches++;
                }
            });
        });
        
        // Return proportion of messages with pattern matches
        return Math.min(totalMatches / totalMessages, 1.0);
    }

    /**
     * Uses AI to analyze trait contextually
     * @private
     */
    async _getAITraitAnalysis(userMessages, traitName) {
        try {
            if (userMessages.length === 0) return 0.5;
            
            // Sample messages to avoid token limits
            const sampleMessages = userMessages.slice(0, 10).join('\n');
            
            const prompt = `Analyze the ${traitName} personality trait in these messages on a scale of 0.0 to 1.0:

Messages: "${sampleMessages}"

Big Five ${traitName} definition:
- Openness: creativity, curiosity, openness to new experiences
- Conscientiousness: organization, discipline, goal-oriented behavior
- Extraversion: social energy, outgoing nature, talkativeness
- Agreeableness: kindness, cooperation, trust in others
- Neuroticism: emotional instability, anxiety, stress response

Return only a decimal number between 0.0 and 1.0 representing the ${traitName} level.`;

            const response = await openaiService.generateChatCompletion(prompt, {
                maxTokens: 10,
                temperature: 0.3
            });

            const score = parseFloat(response.trim());
            return isNaN(score) ? 0.5 : Math.max(0.0, Math.min(1.0, score));

        } catch (error) {
            console.error(`Error in AI ${traitName} analysis:`, error);
            return 0.5;
        }
    }

    /**
     * Analyzes message verbosity for extraversion
     * @private
     */
    _analyzeMessageVerbosity(userMessages) {
        if (userMessages.length === 0) return 0.5;
        
        const averageLength = userMessages.reduce((sum, msg) => sum + msg.length, 0) / userMessages.length;
        
        // Higher verbosity suggests higher extraversion
        if (averageLength > 150) return 0.8;
        if (averageLength > 100) return 0.7;
        if (averageLength > 50) return 0.6;
        if (averageLength > 20) return 0.5;
        return 0.3;
    }

    /**
     * Analyzes social language usage
     * @private
     */
    _analyzeSocialLanguage(userMessages) {
        const socialWords = ['we', 'us', 'together', 'share', 'with', 'everyone', 'others'];
        const allText = userMessages.join(' ').toLowerCase();
        
        let socialCount = 0;
        socialWords.forEach(word => {
            socialCount += (allText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        });
        
        const totalWords = allText.split(' ').length;
        return Math.min(socialCount / Math.max(totalWords, 1) * 20, 1.0); // Scale up the ratio
    }

    /**
     * Analyzes politeness patterns for agreeableness
     * @private
     */
    _analyzePoliteness(userMessages) {
        const politeWords = ['please', 'thank', 'sorry', 'excuse', 'appreciate', 'grateful'];
        const allText = userMessages.join(' ').toLowerCase();
        
        let politeCount = 0;
        politeWords.forEach(word => {
            politeCount += (allText.match(new RegExp(`\\b${word}`, 'g')) || []).length;
        });
        
        // Higher politeness suggests higher agreeableness
        return Math.min(politeCount / Math.max(userMessages.length, 1), 1.0);
    }

    /**
     * Analyzes emotional volatility for neuroticism
     * @private
     */
    _analyzeEmotionalVolatility(userMessages) {
        const strongEmotions = [
            /!{2,}/, // Multiple exclamation marks
            /\b(hate|love|amazing|terrible|awful|fantastic)\b/i,
            /\b(so|very|extremely|incredibly|totally)\s+\w+/i,
            /[A-Z]{3,}/ // All caps words
        ];
        
        let volatilityCount = 0;
        userMessages.forEach(message => {
            strongEmotions.forEach(pattern => {
                if (pattern.test(message)) {
                    volatilityCount++;
                }
            });
        });
        
        return Math.min(volatilityCount / Math.max(userMessages.length, 1), 1.0);
    }

    /**
     * Normalizes trait scores to 0.0-1.0 range
     * @private
     */
    _normalizeScore(score) {
        return Math.max(0.0, Math.min(1.0, score || 0.5));
    }

    /**
     * Returns default trait scores for insufficient data
     * @private
     */
    _getDefaultTraitScores() {
        return {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5
        };
    }

    /**
     * Gets trait extraction statistics
     * @returns {Object} Analysis statistics and patterns
     */
    getTraitPatterns() {
        return {
            supportedTraits: Object.keys(this.traitPatterns),
            keywordCounts: Object.keys(this.traitPatterns).reduce((acc, trait) => {
                acc[trait] = {
                    positive: this.traitPatterns[trait].keywords.length,
                    negative: this.traitPatterns[trait].negativeKeywords.length,
                    patterns: this.traitPatterns[trait].indicators.length
                };
                return acc;
            }, {}),
            scoringWeights: this.scoringWeights
        };
    }

    /**
     * Analyzes trait confidence based on data quality
     * @param {Array} userMessages - User message array
     * @returns {Object} Confidence scores for each trait
     */
    getTraitConfidence(userMessages) {
        const messageCount = userMessages.length;
        const totalWords = userMessages.join(' ').split(' ').length;
        
        let confidence = 0.3; // Base confidence
        
        if (messageCount >= 10) confidence += 0.2;
        if (messageCount >= 25) confidence += 0.2;
        if (totalWords >= 100) confidence += 0.2;
        if (totalWords >= 500) confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }
}

module.exports = TraitExtractor;