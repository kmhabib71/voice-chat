/**
 * @fileoverview Importance scoring system for memory prioritization
 * @author AI Girlfriend Development Team
 * @created 2025-09-04
 * 
 * @example
 * const importanceScorer = new ImportanceScorer();
 * const score = importanceScorer.calculateImportance(message, response, context);
 */

/**
 * Memory importance scoring system
 * Analyzes conversation content to determine storage priority and retrieval relevance
 */
class ImportanceScorer {
    constructor() {
        // Emotional milestone keywords
        this.emotionalKeywords = [
            'love', 'hate', 'depression', 'anxiety', 'breakthrough', 'epiphany',
            'devastated', 'elated', 'heartbroken', 'overjoyed', 'traumatic', 
            'life-changing', 'overwhelming', 'profound', 'meaningful', 'significant'
        ];

        // Personal revelation patterns
        this.revelationPatterns = [
            /i am/i, /i'm/i, /my name is/i, /i identify as/i, /i believe/i,
            /my biggest fear/i, /my greatest/i, /i've never told/i, /secret/i,
            /confession/i, /truth is/i, /honestly/i, /between us/i, /personal/i
        ];

        // Life event indicators
        this.lifeEventKeywords = [
            'married', 'divorced', 'pregnant', 'baby', 'died', 'funeral', 'wedding',
            'graduated', 'promotion', 'fired', 'quit', 'moved', 'relocated',
            'diagnosis', 'surgery', 'accident', 'injury', 'recovery', 'therapy',
            'birthday', 'anniversary', 'milestone', 'achievement', 'loss'
        ];

        // Preference declaration patterns
        this.preferencePatterns = [
            /i like/i, /i love/i, /i hate/i, /i prefer/i, /my favorite/i,
            /i enjoy/i, /i can't stand/i, /i'm into/i, /i'm not into/i,
            /i would rather/i, /i usually/i, /i typically/i, /i always/i, /i never/i
        ];

        // Goal setting indicators
        this.goalKeywords = [
            'want to', 'plan to', 'hoping to', 'goal', 'dream', 'aspire',
            'ambition', 'objective', 'target', 'aim', 'strive', 'wish',
            'bucket list', 'resolution', 'commitment', 'promise'
        ];

        // Small talk patterns
        this.smallTalkPatterns = [
            /how are you/i, /what's up/i, /nice weather/i, /how's it going/i,
            /good morning/i, /good night/i, /hello/i, /hi there/i, /bye/i,
            /see you later/i, /take care/i, /have a good/i, /weekend/i, /busy day/i
        ];

        // Cache for repetitive content detection
        this.messageHistory = new Map();
        this.similarityThreshold = 0.8;
    }

    /**
     * Calculate importance score for message content
     * @param {string} message - User message
     * @param {string} response - AI response (optional)
     * @param {Object} context - Conversation context
     * @returns {number} Importance score 0.1-1.0
     */
    calculateImportance(message, response = '', context = {}) {
        try {
            let score = 0.3; // Lower base importance

            // Validate input
            if (!message || typeof message !== 'string') {
                return 0.1;
            }

            const messageContent = message.toLowerCase().trim();
            let highImportanceCount = 0;
            let mediumImportanceCount = 0;

            // HIGH IMPORTANCE (+0.4 to +0.5)
            if (this.isEmotionalMilestone(messageContent, context)) {
                score += 0.5;
                highImportanceCount++;
            }
            if (this.isPersonalRevelation(messageContent, context)) {
                score += 0.4;
                highImportanceCount++;
            }
            if (this.isLifeEvent(messageContent, context)) {
                score += 0.4;
                highImportanceCount++;
            }

            // MEDIUM IMPORTANCE (+0.1 to +0.2)
            if (this.isPreferenceDeclaration(messageContent)) {
                score += 0.15;  // Reduced from 0.2
                mediumImportanceCount++;
            }
            if (this.isGoalSetting(messageContent)) {
                score += 0.15;  // Reduced from 0.2
                mediumImportanceCount++;
            }

            // Context-based adjustments
            if (this.hasEmotionalContext(context)) {
                score += 0.2;  // Increased for emotional context
            }
            if (this.isFirstMention(messageContent, context)) {
                score += 0.1;  // Reduced from 0.15
            }

            // LOW IMPORTANCE (-0.1 to -0.3)
            if (this.isSmallTalk(messageContent)) {
                score -= 0.2;
            }
            if (this.isRepetitiveContent(messageContent, context)) {
                score -= 0.15;  // Increased penalty
            }

            // Length-based adjustments
            if (messageContent.length < 10) {
                score -= 0.1; // Very short messages
            } else if (messageContent.length > 200) {
                score += 0.05; // Reduced bonus for long messages
            }

            // Question vs statement analysis
            if (this.isDeepQuestion(messageContent)) {
                score += 0.1;  // Reduced from 0.15
            }

            // Calibration adjustments to better fit expected ranges
            if (highImportanceCount > 0 && score < 0.7) {
                score = Math.max(score, 0.7); // Ensure high importance items score ≥ 0.7
            } else if (mediumImportanceCount > 0 && highImportanceCount === 0) {
                score = Math.min(score, 0.65); // Cap medium importance at 0.65
            } else if (this.isSmallTalk(messageContent)) {
                score = Math.min(score, 0.35); // Cap small talk at 0.35
            }

            // Return constrained score
            const finalScore = Math.max(0.1, Math.min(1.0, score));
            
            // Update message history for repetitive content detection
            this._updateMessageHistory(messageContent, finalScore, context);

            return Math.round(finalScore * 100) / 100; // Round to 2 decimal places

        } catch (error) {
            console.error('ImportanceScorer.calculateImportance error:', error);
            return 0.5; // Default to medium importance on error
        }
    }

    /**
     * Check if message contains emotional milestone indicators
     * @param {string} message - Message content
     * @param {Object} context - Conversation context
     * @returns {boolean}
     */
    isEmotionalMilestone(message, context = {}) {
        // Direct emotional keyword match
        const hasEmotionalKeyword = this.emotionalKeywords.some(keyword => 
            message.includes(keyword)
        );

        // Strong emotional expressions
        const strongEmotionalPatterns = [
            /i feel so/i, /i'm feeling/i, /makes me feel/i, /emotional/i,
            /crying/i, /tears/i, /can't stop/i, /overwhelming/i,
            /never felt/i, /first time/i, /changed my life/i, /will never forget/i
        ];

        const hasStrongEmotion = strongEmotionalPatterns.some(pattern =>
            pattern.test(message)
        );

        // Context indicators
        const hasEmotionalContext = context.mood && 
            ['excited', 'devastated', 'elated', 'heartbroken', 'profound'].includes(context.mood);

        return hasEmotionalKeyword || hasStrongEmotion || hasEmotionalContext;
    }

    /**
     * Check if message contains personal revelation
     * @param {string} message - Message content
     * @param {Object} context - Conversation context
     * @returns {boolean}
     */
    isPersonalRevelation(message, context = {}) {
        // Pattern matching for revelations
        const hasRevelationPattern = this.revelationPatterns.some(pattern =>
            pattern.test(message)
        );

        // Deep personal sharing indicators
        const personalSharingPatterns = [
            /i've been thinking/i, /i realize/i, /i understand now/i,
            /i need to tell you/i, /i want you to know/i, /the truth is/i,
            /i admit/i, /i confess/i, /between you and me/i, /privately/i
        ];

        const hasPersonalSharing = personalSharingPatterns.some(pattern =>
            pattern.test(message)
        );

        // Identity or belief statements
        const identityPatterns = [
            /i am gay/i, /i am straight/i, /i am bi/i, /i am trans/i,
            /i believe in/i, /my religion/i, /politically i/i, /i identify/i
        ];

        const hasIdentityStatement = identityPatterns.some(pattern =>
            pattern.test(message)
        );

        return hasRevelationPattern || hasPersonalSharing || hasIdentityStatement;
    }

    /**
     * Check if message contains life event indicators
     * @param {string} message - Message content
     * @param {Object} context - Conversation context
     * @returns {boolean}
     */
    isLifeEvent(message, context = {}) {
        // Direct keyword match
        const hasLifeEventKeyword = this.lifeEventKeywords.some(keyword =>
            message.includes(keyword)
        );

        // Life transition patterns
        const transitionPatterns = [
            /just started/i, /just finished/i, /got accepted/i, /got rejected/i,
            /new job/i, /new relationship/i, /broke up/i, /moving to/i,
            /starting school/i, /graduating/i, /getting married/i
        ];

        const hasTransition = transitionPatterns.some(pattern =>
            pattern.test(message)
        );

        // Time-based life events
        const timeBasedEvents = [
            /last week/i, /yesterday/i, /this morning/i, /just happened/i,
            /few days ago/i, /recently/i, /just found out/i
        ];

        const hasTimeBasedEvent = timeBasedEvents.some(pattern =>
            pattern.test(message)
        ) && hasLifeEventKeyword;

        return hasLifeEventKeyword || hasTransition || hasTimeBasedEvent;
    }

    /**
     * Check if message contains preference declaration
     * @param {string} message - Message content
     * @returns {boolean}
     */
    isPreferenceDeclaration(message) {
        return this.preferencePatterns.some(pattern => pattern.test(message));
    }

    /**
     * Check if message contains goal setting
     * @param {string} message - Message content
     * @returns {boolean}
     */
    isGoalSetting(message) {
        return this.goalKeywords.some(keyword => message.includes(keyword));
    }

    /**
     * Check if message is small talk
     * @param {string} message - Message content
     * @returns {boolean}
     */
    isSmallTalk(message) {
        return this.smallTalkPatterns.some(pattern => pattern.test(message));
    }

    /**
     * Check if message is repetitive content
     * @param {string} message - Message content
     * @param {Object} context - Conversation context
     * @returns {boolean}
     */
    isRepetitiveContent(message, context = {}) {
        const userId = context.userId || 'default';
        
        if (!this.messageHistory.has(userId)) {
            return false;
        }

        const userHistory = this.messageHistory.get(userId);
        const recentMessages = userHistory.slice(-10); // Check last 10 messages

        // Check for exact or very similar messages
        return recentMessages.some(historicalMessage => {
            const similarity = this._calculateSimilarity(message, historicalMessage.content);
            return similarity > this.similarityThreshold;
        });
    }

    /**
     * Check if context has emotional indicators
     * @param {Object} context - Conversation context
     * @returns {boolean}
     */
    hasEmotionalContext(context) {
        return context.mood && 
            !['neutral', 'casual', 'normal'].includes(context.mood);
    }

    /**
     * Check if this is the first mention of a topic
     * @param {string} message - Message content
     * @param {Object} context - Conversation context
     * @returns {boolean}
     */
    isFirstMention(message, context) {
        // Simplified check - in real implementation would check against user facts
        const newTopicPatterns = [
            /never told anyone/i, /first time/i, /haven't mentioned/i,
            /didn't tell you/i, /forgot to say/i, /should probably mention/i
        ];

        return newTopicPatterns.some(pattern => pattern.test(message));
    }

    /**
     * Check if message contains deep questions
     * @param {string} message - Message content
     * @returns {boolean}
     */
    isDeepQuestion(message) {
        const deepQuestionPatterns = [
            /what do you think about/i, /how do you feel about/i, /what would you do/i,
            /do you believe/i, /what's your opinion/i, /how should i/i,
            /what if/i, /why do you think/i, /what does it mean/i
        ];

        return deepQuestionPatterns.some(pattern => pattern.test(message));
    }

    /**
     * Get importance level from score
     * @param {number} score - Importance score
     * @returns {string} Importance level
     */
    getImportanceLevel(score) {
        if (score >= 0.7) return 'high';
        if (score >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * Get detailed analysis of importance factors
     * @param {string} message - User message
     * @param {string} response - AI response
     * @param {Object} context - Conversation context
     * @returns {Object} Detailed analysis
     */
    analyzeImportanceFactors(message, response = '', context = {}) {
        const messageContent = message.toLowerCase().trim();
        
        const factors = {
            emotionalMilestone: this.isEmotionalMilestone(messageContent, context),
            personalRevelation: this.isPersonalRevelation(messageContent, context),
            lifeEvent: this.isLifeEvent(messageContent, context),
            preferenceDeclaration: this.isPreferenceDeclaration(messageContent),
            goalSetting: this.isGoalSetting(messageContent),
            smallTalk: this.isSmallTalk(messageContent),
            repetitiveContent: this.isRepetitiveContent(messageContent, context),
            deepQuestion: this.isDeepQuestion(messageContent),
            hasEmotionalContext: this.hasEmotionalContext(context),
            isFirstMention: this.isFirstMention(messageContent, context)
        };

        const score = this.calculateImportance(message, response, context);
        
        return {
            score,
            level: this.getImportanceLevel(score),
            factors,
            reasoning: this._generateReasoning(factors, score)
        };
    }

    // Private helper methods

    /**
     * Calculate text similarity using simple character-based approach
     * @private
     */
    _calculateSimilarity(text1, text2) {
        const longer = text1.length > text2.length ? text1 : text2;
        const shorter = text1.length > text2.length ? text2 : text1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this._levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * @private
     */
    _levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Update message history for repetitive content detection
     * @private
     */
    _updateMessageHistory(message, score, context) {
        const userId = context.userId || 'default';
        
        if (!this.messageHistory.has(userId)) {
            this.messageHistory.set(userId, []);
        }
        
        const userHistory = this.messageHistory.get(userId);
        userHistory.push({
            content: message,
            score,
            timestamp: new Date()
        });
        
        // Keep only recent messages to prevent memory growth
        if (userHistory.length > 50) {
            userHistory.splice(0, userHistory.length - 50);
        }
    }

    /**
     * Generate human-readable reasoning for importance score
     * @private
     */
    _generateReasoning(factors, score) {
        const reasons = [];
        
        if (factors.emotionalMilestone) reasons.push('Contains emotional milestone');
        if (factors.personalRevelation) reasons.push('Personal revelation detected');
        if (factors.lifeEvent) reasons.push('Life event mentioned');
        if (factors.preferenceDeclaration) reasons.push('Preference declared');
        if (factors.goalSetting) reasons.push('Goal or aspiration mentioned');
        if (factors.deepQuestion) reasons.push('Thoughtful question asked');
        if (factors.hasEmotionalContext) reasons.push('Emotional context present');
        if (factors.isFirstMention) reasons.push('New topic introduced');
        
        if (factors.smallTalk) reasons.push('Small talk detected (reduces importance)');
        if (factors.repetitiveContent) reasons.push('Repetitive content (reduces importance)');
        
        if (reasons.length === 0) {
            reasons.push('Standard conversation content');
        }
        
        return reasons;
    }
}

module.exports = ImportanceScorer;