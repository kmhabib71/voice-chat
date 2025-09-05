/**
 * @fileoverview Context-aware analysis system for intelligent memory routing
 * @author AI Girlfriend Development Team
 * @created 2025-09-05
 * 
 * @example
 * const contextAnalyzer = new ContextAnalyzer();
 * const analysis = contextAnalyzer.analyzeContext(message, extractedKeywords);
 */

/**
 * Context-aware analyzer for intelligent subject detection and information routing
 * Provides lightweight analysis without additional API calls
 */
class ContextAnalyzer {
    constructor() {
        // Subject detection patterns
        this.subjectPatterns = {
            self: {
                pronouns: ['i', 'me', 'my', 'myself', "i'm", "i'll", "i've", "i'd"],
                patterns: [
                    /^i am/i, /^i'm/i, /^my name/i, /^i feel/i, /^i think/i,
                    /^i like/i, /^i love/i, /^i hate/i, /^i want/i, /^i need/i,
                    /^i have/i, /^i was/i, /^i will/i, /^i would/i
                ]
            },
            thirdPerson: {
                pronouns: ['he', 'she', 'they', 'him', 'her', 'them', 'his', 'hers', 'their'],
                patterns: [
                    /he is/i, /she is/i, /they are/i, /he was/i, /she was/i,
                    /he said/i, /she said/i, /they said/i, /he told/i, /she told/i
                ]
            },
            relationships: {
                family: ['mom', 'dad', 'mother', 'father', 'parent', 'brother', 'sister', 'sibling', 'son', 'daughter', 'child', 'wife', 'husband', 'spouse'],
                friends: ['friend', 'buddy', 'pal', 'mate', 'bestie', 'roommate'],
                professional: ['colleague', 'coworker', 'boss', 'manager', 'teacher', 'professor', 'doctor'],
                romantic: ['boyfriend', 'girlfriend', 'partner', 'ex', 'crush', 'date']
            }
        };

        // Temporal context patterns
        this.temporalPatterns = {
            current: [/currently/i, /right now/i, /at the moment/i, /today/i, /this week/i],
            past: [/yesterday/i, /last week/i, /ago/i, /used to/i, /was/i, /were/i, /had/i, /did/i],
            future: [/tomorrow/i, /next week/i, /will/i, /going to/i, /plan to/i, /hope to/i],
            hypothetical: [/if i/i, /what if/i, /imagine if/i, /suppose/i, /would/i, /could/i, /might/i]
        };

        // Certainty indicators
        this.certaintyPatterns = {
            high: [/definitely/i, /certainly/i, /absolutely/i, /sure/i, /positive/i, /know/i],
            medium: [/probably/i, /likely/i, /think/i, /believe/i, /seem/i, /appear/i],
            low: [/maybe/i, /perhaps/i, /possibly/i, /might/i, /could be/i, /not sure/i],
            speculative: [/if/i, /suppose/i, /imagine/i, /what if/i, /wonder/i, /curious/i]
        };

        // Context cache for learning patterns
        this.userPatterns = new Map();
    }

    /**
     * Analyze context of a message with enhanced intelligence
     * @param {string} message - User message to analyze
     * @param {Object} extractedKeywords - Keywords from OpenAI extraction
     * @param {Object} conversationContext - Previous conversation context
     * @returns {Object} Enhanced context analysis
     */
    analyzeContext(message, extractedKeywords = {}, conversationContext = {}) {
        try {
            const messageContent = message.toLowerCase().trim();

            // Base analysis from AI extraction
            const baseAnalysis = {
                subject_analysis: extractedKeywords.subject_analysis || { primary_subject: 'unclear', confidence: 0.5 },
                information_ownership: extractedKeywords.information_ownership || { belongs_to_user: true, about_user: true, about_others: false },
                temporal_context: extractedKeywords.temporal_context || { timeframe: 'current', certainty: 'factual' },
                relationship_context: extractedKeywords.relationship_context || { mentioned_people: [], user_involvement: 'direct' }
            };

            // Enhanced local analysis
            const enhancedAnalysis = {
                subject_analysis: this._analyzeSubject(messageContent, baseAnalysis.subject_analysis),
                information_ownership: this._analyzeOwnership(messageContent, baseAnalysis.information_ownership),
                temporal_context: this._analyzeTemporal(messageContent, baseAnalysis.temporal_context),
                relationship_context: this._analyzeRelationships(messageContent, baseAnalysis.relationship_context),
                certainty_analysis: this._analyzeCertainty(messageContent),
                context_confidence: this._calculateContextConfidence(messageContent, baseAnalysis)
            };

            // Store pattern for learning
            this._updatePatternLearning(conversationContext.userId, messageContent, enhancedAnalysis);

            return enhancedAnalysis;

        } catch (error) {
            console.error('ContextAnalyzer.analyzeContext error:', error);
            return this._getDefaultAnalysis();
        }
    }

    /**
     * Determine appropriate memory routing based on context
     * @param {Object} contextAnalysis - Context analysis result
     * @param {number} importanceScore - Importance score from ImportanceScorer
     * @returns {Object} Routing decision
     */
    determineMemoryRouting(contextAnalysis, importanceScore) {
        const { information_ownership, temporal_context, certainty_analysis, context_confidence } = contextAnalysis;

        // Routing logic based on context
        if (!information_ownership.about_user && information_ownership.about_others) {
            // Third-party information -> Episodic memory with relationship context
            return {
                memoryType: 'episodic',
                reasoning: 'Third-party information',
                metadata: {
                    isThirdParty: true,
                    relationship: contextAnalysis.relationship_context,
                    importance: Math.max(0.1, importanceScore * 0.7) // Reduce importance for others' info
                }
            };
        }

        if (temporal_context.timeframe === 'hypothetical' || certainty_analysis.level === 'speculative') {
            // Hypothetical or speculative -> Lower importance, episodic storage
            return {
                memoryType: 'episodic',
                reasoning: 'Hypothetical or speculative content',
                metadata: {
                    isSpeculative: true,
                    importance: Math.max(0.1, importanceScore * 0.5) // Significantly reduce importance
                }
            };
        }

        if (temporal_context.timeframe === 'past' && temporal_context.certainty === 'factual') {
            // Past factual information -> Long-term memory with temporal context
            return {
                memoryType: 'long_term',
                reasoning: 'Past factual information about user',
                metadata: {
                    isPastEvent: true,
                    temporal: temporal_context,
                    importance: importanceScore * 0.8 // Slight reduction for past events
                }
            };
        }

        if (information_ownership.about_user && context_confidence > 0.7) {
            // High-confidence user information -> Route by importance
            if (importanceScore >= 0.8) {
                return {
                    memoryType: 'episodic',
                    reasoning: 'High-importance user information',
                    metadata: { isUserData: true, importance: importanceScore }
                };
            } else if (importanceScore >= 0.6) {
                return {
                    memoryType: 'long_term',
                    reasoning: 'Medium-importance user facts',
                    metadata: { isUserData: true, importance: importanceScore }
                };
            }
        }

        // Default routing (current behavior)
        if (importanceScore >= 0.8) return { memoryType: 'episodic', reasoning: 'High importance' };
        if (importanceScore >= 0.6) return { memoryType: 'long_term', reasoning: 'Medium importance' };
        return { memoryType: 'short_term', reasoning: 'Low importance' };
    }

    // Private analysis methods

    /**
     * Analyze subject of the message
     * @private
     */
    _analyzeSubject(message, baseAnalysis) {
        let confidence = baseAnalysis.confidence;
        let primary_subject = baseAnalysis.primary_subject;

        // Check for clear first-person indicators
        if (this.subjectPatterns.self.patterns.some(pattern => pattern.test(message))) {
            primary_subject = 'self';
            confidence = Math.max(confidence, 0.9);
        }

        // Check for third-person indicators
        if (this.subjectPatterns.thirdPerson.patterns.some(pattern => pattern.test(message))) {
            primary_subject = 'other';
            confidence = Math.max(confidence, 0.8);
        }

        // Check for relationship mentions
        for (const [category, terms] of Object.entries(this.subjectPatterns.relationships)) {
            if (terms.some(term => message.includes(term))) {
                if (message.includes('my ')) {
                    primary_subject = 'related_person';
                    confidence = Math.max(confidence, 0.85);
                } else {
                    primary_subject = 'other';
                    confidence = Math.max(confidence, 0.75);
                }
                break;
            }
        }

        return { primary_subject, confidence };
    }

    /**
     * Analyze information ownership
     * @private
     */
    _analyzeOwnership(message, baseAnalysis) {
        let ownership = { ...baseAnalysis };

        // Strong first-person indicators
        if (message.match(/^(i am|i'm|i feel|i think|i believe|my name|i have)/i)) {
            ownership.belongs_to_user = true;
            ownership.about_user = true;
            ownership.about_others = false;
        }

        // Third-party story indicators
        if (message.match(/(my friend|he said|she told|they mentioned|someone)/i)) {
            ownership.belongs_to_user = false;
            ownership.about_user = false;
            ownership.about_others = true;
        }

        // Mixed content (stories involving user and others)
        if (message.match(/(we|us|our|together)/i)) {
            ownership.about_user = true;
            ownership.about_others = true;
        }

        return ownership;
    }

    /**
     * Analyze temporal context
     * @private
     */
    _analyzeTemporal(message, baseAnalysis) {
        let temporal = { ...baseAnalysis };

        // Check temporal patterns
        for (const [timeframe, patterns] of Object.entries(this.temporalPatterns)) {
            if (patterns.some(pattern => pattern.test(message))) {
                temporal.timeframe = timeframe;
                break;
            }
        }

        // Adjust certainty based on timeframe
        if (temporal.timeframe === 'hypothetical') {
            temporal.certainty = 'speculative';
        } else if (temporal.timeframe === 'future') {
            temporal.certainty = message.match(/will definitely|definitely will/i) ? 'factual' : 'speculative';
        }

        return temporal;
    }

    /**
     * Analyze relationships mentioned
     * @private
     */
    _analyzeRelationships(message, baseAnalysis) {
        const relationships = { ...baseAnalysis };
        const mentioned_people = [];

        // Detect relationship types
        for (const [category, terms] of Object.entries(this.subjectPatterns.relationships)) {
            for (const term of terms) {
                if (message.includes(term)) {
                    mentioned_people.push(category.slice(0, -1)); // Remove 's' from category name
                }
            }
        }

        relationships.mentioned_people = [...new Set(mentioned_people)]; // Remove duplicates

        // Determine user involvement
        if (message.match(/^i/i) && mentioned_people.length > 0) {
            relationships.user_involvement = 'direct';
        } else if (mentioned_people.length > 0 && !message.match(/^i/i)) {
            relationships.user_involvement = 'observer';
        } else if (message.match(/(we|us|together)/i)) {
            relationships.user_involvement = 'participant';
        }

        return relationships;
    }

    /**
     * Analyze certainty and confidence levels
     * @private
     */
    _analyzeCertainty(message) {
        let level = 'medium';
        let confidence = 0.5;

        // Check certainty patterns
        for (const [certaintyLevel, patterns] of Object.entries(this.certaintyPatterns)) {
            if (patterns.some(pattern => pattern.test(message))) {
                level = certaintyLevel;
                confidence = {
                    high: 0.9,
                    medium: 0.7,
                    low: 0.4,
                    speculative: 0.2
                }[certaintyLevel];
                break;
            }
        }

        return { level, confidence };
    }

    /**
     * Calculate overall context confidence
     * @private
     */
    _calculateContextConfidence(message, baseAnalysis) {
        let confidence = 0.5;

        // Boost confidence for clear patterns
        if (message.match(/^(i am|i'm|my|i feel|i think)/i)) confidence += 0.3;
        if (message.match(/(my friend|he said|she told)/i)) confidence += 0.2;
        if (message.length > 50) confidence += 0.1; // Longer messages provide more context
        if (baseAnalysis.subject_analysis?.confidence > 0.7) confidence += 0.2;

        return Math.min(1.0, confidence);
    }

    /**
     * Update pattern learning for user
     * @private
     */
    _updatePatternLearning(userId, message, analysis) {
        if (!userId) return;

        if (!this.userPatterns.has(userId)) {
            this.userPatterns.set(userId, {
                patterns: [],
                commonPhrases: new Map(),
                lastUpdated: new Date()
            });
        }

        const userPattern = this.userPatterns.get(userId);
        
        // Store successful pattern recognition
        if (analysis.context_confidence > 0.7) {
            userPattern.patterns.push({
                message: message.substring(0, 100), // Store limited length
                analysis: {
                    subject: analysis.subject_analysis.primary_subject,
                    ownership: analysis.information_ownership.about_user,
                    timeframe: analysis.temporal_context.timeframe
                },
                timestamp: new Date(),
                confidence: analysis.context_confidence
            });

            // Keep only recent patterns (last 50)
            if (userPattern.patterns.length > 50) {
                userPattern.patterns = userPattern.patterns.slice(-50);
            }
        }

        userPattern.lastUpdated = new Date();
    }

    /**
     * Get default analysis for error cases
     * @private
     */
    _getDefaultAnalysis() {
        return {
            subject_analysis: { primary_subject: 'unclear', confidence: 0.3 },
            information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
            temporal_context: { timeframe: 'current', certainty: 'factual' },
            relationship_context: { mentioned_people: [], user_involvement: 'direct' },
            certainty_analysis: { level: 'medium', confidence: 0.5 },
            context_confidence: 0.3
        };
    }

    /**
     * Get user-specific pattern statistics
     * @param {string} userId - User identifier
     * @returns {Object} Pattern statistics
     */
    getUserPatternStats(userId) {
        if (!this.userPatterns.has(userId)) {
            return { patterns: 0, accuracy: 0, lastUpdated: null };
        }

        const userPattern = this.userPatterns.get(userId);
        const highConfidencePatterns = userPattern.patterns.filter(p => p.confidence > 0.8);
        
        return {
            patterns: userPattern.patterns.length,
            accuracy: highConfidencePatterns.length / userPattern.patterns.length,
            lastUpdated: userPattern.lastUpdated,
            commonSubjects: this._getCommonSubjects(userPattern.patterns)
        };
    }

    /**
     * Get common subjects for user
     * @private
     */
    _getCommonSubjects(patterns) {
        const subjects = patterns.map(p => p.analysis.subject);
        const frequency = {};
        
        subjects.forEach(subject => {
            frequency[subject] = (frequency[subject] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([subject, count]) => ({ subject, count }));
    }
}

module.exports = ContextAnalyzer;