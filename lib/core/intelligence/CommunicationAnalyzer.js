/**
 * @fileoverview Communication Pattern Analyzer - Analyzes user communication patterns and styles
 * @author AI Girlfriend Project
 * @created 2025-09-08
 * 
 * @example
 * const analyzer = new CommunicationAnalyzer();
 * const patterns = await analyzer.analyzePatterns(conversationData);
 */

// Utilities
const { logError } = require('../../utils/helpers');

/**
 * Communication Pattern Analyzer
 * Analyzes user communication styles, preferences, and behavioral patterns
 */
class CommunicationAnalyzer {
  constructor() {
    // Communication style indicators
    this.lengthCategories = {
      short: { min: 0, max: 50, label: 'Concise communicator' },
      medium: { min: 51, max: 150, label: 'Balanced communicator' },
      long: { min: 151, max: 500, label: 'Detailed communicator' },
      verbose: { min: 501, max: Infinity, label: 'Expressive communicator' }
    };
    
    // Topic depth indicators
    this.depthKeywords = {
      surface: ['hi', 'hello', 'how', 'good', 'fine', 'ok', 'thanks', 'bye'],
      moderate: ['think', 'feel', 'like', 'want', 'need', 'hope', 'wish', 'maybe'],
      deep: ['believe', 'philosophy', 'meaning', 'purpose', 'soul', 'essence', 'truth', 'existence', 'consciousness']
    };
    
    // Emotional expression patterns
    this.emotionalIndicators = {
      high: ['!', '!!!', 'amazing', 'incredible', 'terrible', 'awful', 'love', 'hate', 'devastated', 'ecstatic'],
      moderate: ['good', 'bad', 'nice', 'okay', 'fine', 'happy', 'sad', 'worried', 'excited'],
      low: ['is', 'was', 'will', 'can', 'should', 'could', 'would', 'might']
    };
    
    // Response timing patterns
    this.responsePatterns = {
      immediate: { min: 0, max: 60, label: 'Quick responder' },
      prompt: { min: 61, max: 300, label: 'Prompt responder' },
      thoughtful: { min: 301, max: 1800, label: 'Thoughtful responder' },
      delayed: { min: 1801, max: Infinity, label: 'Deliberate responder' }
    };
  }

  /**
   * Analyzes communication patterns from conversation data
   * @param {Object} conversationData - User conversation history
   * @returns {Promise<Object>} Communication pattern analysis
   */
  async analyzePatterns(conversationData) {
    try {
      console.log('📝 Analyzing communication patterns...');
      
      if (!conversationData?.messages || conversationData.messages.length === 0) {
        return this._getDefaultPatterns();
      }
      
      // Filter relevant messages for analysis
      const userMessages = conversationData.messages.filter(msg => 
        msg.content && 
        msg.content.length > 5 && 
        !msg.content.startsWith('AI responded:') &&
        msg.type !== 'fact'
      );
      
      if (userMessages.length < 3) {
        return this._getDefaultPatterns();
      }
      
      console.log(`📊 Analyzing ${userMessages.length} user messages...`);
      
      // Parallel analysis of different communication aspects
      const [
        lengthPatterns,
        depthAnalysis,
        emotionalExpression,
        timingPatterns,
        vocabularyAnalysis,
        interactionStyle
      ] = await Promise.all([
        this._analyzeMessageLength(userMessages),
        this._analyzeTopicDepth(userMessages),
        this._analyzeEmotionalExpression(userMessages),
        this._analyzeResponseTiming(userMessages),
        this._analyzeVocabulary(userMessages),
        this._analyzeInteractionStyle(userMessages)
      ]);
      
      // Calculate confidence based on data quality
      const confidence = this._calculateAnalysisConfidence(userMessages);
      
      const patterns = {
        // Message length preferences
        averageLength: lengthPatterns.category,
        lengthDistribution: lengthPatterns.distribution,
        
        // Topic and conversation depth
        depthPreference: depthAnalysis.primaryDepth,
        topicVariety: depthAnalysis.variety,
        abstractThinking: depthAnalysis.abstractScore,
        
        // Emotional expression style
        emotionalExpression: emotionalExpression.level,
        emotionalVocabulary: emotionalExpression.vocabulary,
        sentimentPolarity: emotionalExpression.polarity,
        
        // Response and interaction patterns
        responseStyle: timingPatterns.style,
        initiationFrequency: interactionStyle.initiation,
        questionAsking: interactionStyle.curiosity,
        
        // Language and vocabulary
        vocabularyComplexity: vocabularyAnalysis.complexity,
        communicationFormality: vocabularyAnalysis.formality,
        languageCreativity: vocabularyAnalysis.creativity,
        
        // Overall communication style
        overallStyle: this._determineOverallStyle({
          lengthPatterns,
          depthAnalysis,
          emotionalExpression,
          timingPatterns,
          vocabularyAnalysis
        }),
        
        // Metadata
        confidence,
        analysisDate: new Date().toISOString(),
        messageCount: userMessages.length
      };
      
      console.log(`✅ Communication analysis completed (confidence: ${confidence.toFixed(2)})`);
      return patterns;
      
    } catch (error) {
      logError('CommunicationAnalyzer.analyzePatterns', error);
      return this._getDefaultPatterns();
    }
  }

  /**
   * Analyzes message length patterns
   * @private
   * @param {Array} messages - User messages
   * @returns {Object} Length pattern analysis
   */
  _analyzeMessageLength(messages) {
    const lengths = messages.map(msg => msg.content.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    // Categorize length preference
    let category = 'medium';
    for (const [cat, range] of Object.entries(this.lengthCategories)) {
      if (avgLength >= range.min && avgLength <= range.max) {
        category = cat;
        break;
      }
    }
    
    // Calculate distribution across categories
    const distribution = {};
    Object.keys(this.lengthCategories).forEach(cat => distribution[cat] = 0);
    
    lengths.forEach(len => {
      for (const [cat, range] of Object.entries(this.lengthCategories)) {
        if (len >= range.min && len <= range.max) {
          distribution[cat]++;
          break;
        }
      }
    });
    
    // Normalize distribution
    Object.keys(distribution).forEach(cat => {
      distribution[cat] = distribution[cat] / lengths.length;
    });
    
    return {
      category,
      averageLength: Math.round(avgLength),
      distribution,
      consistency: this._calculateLengthConsistency(lengths)
    };
  }

  /**
   * Analyzes topic depth and conversation complexity
   * @private
   * @param {Array} messages - User messages
   * @returns {Object} Topic depth analysis
   */
  _analyzeTopicDepth(messages) {
    let depthScores = { surface: 0, moderate: 0, deep: 0 };
    let uniqueTopics = new Set();
    let abstractScore = 0;
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      const words = content.split(/\s+/);
      
      // Count depth indicators
      Object.entries(this.depthKeywords).forEach(([depth, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            depthScores[depth]++;
          }
        });
      });
      
      // Track topic variety
      if (msg.topics && Array.isArray(msg.topics)) {
        msg.topics.forEach(topic => uniqueTopics.add(topic.toLowerCase()));
      }
      
      // Analyze abstract thinking indicators
      const abstractIndicators = [
        'concept', 'idea', 'theory', 'philosophy', 'meaning', 'purpose',
        'essence', 'nature', 'reality', 'consciousness', 'existence'
      ];
      abstractIndicators.forEach(indicator => {
        if (content.includes(indicator)) abstractScore++;
      });
    });
    
    // Determine primary depth
    const totalDepthScores = Object.values(depthScores).reduce((sum, score) => sum + score, 0);
    let primaryDepth = 'moderate'; // default
    
    if (totalDepthScores > 0) {
      primaryDepth = Object.entries(depthScores)
        .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    return {
      primaryDepth,
      depthDistribution: totalDepthScores > 0 ? {
        surface: depthScores.surface / totalDepthScores,
        moderate: depthScores.moderate / totalDepthScores,
        deep: depthScores.deep / totalDepthScores
      } : { surface: 0.5, moderate: 0.4, deep: 0.1 },
      variety: uniqueTopics.size,
      abstractScore: abstractScore / messages.length
    };
  }

  /**
   * Analyzes emotional expression patterns
   * @private
   * @param {Array} messages - User messages
   * @returns {Object} Emotional expression analysis
   */
  _analyzeEmotionalExpression(messages) {
    let emotionScores = { high: 0, moderate: 0, low: 0 };
    let emotionalWords = new Set();
    let sentimentSum = 0;
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Count emotional expression levels
      Object.entries(this.emotionalIndicators).forEach(([level, indicators]) => {
        indicators.forEach(indicator => {
          if (content.includes(indicator)) {
            emotionScores[level]++;
            if (level !== 'low') {
              emotionalWords.add(indicator);
            }
          }
        });
      });
      
      // Analyze sentiment polarity
      if (msg.emotion) {
        const positiveEmotions = ['joy', 'happiness', 'love', 'excitement', 'contentment'];
        const negativeEmotions = ['sadness', 'anger', 'fear', 'anxiety', 'frustration'];
        
        if (positiveEmotions.includes(msg.emotion)) sentimentSum += 1;
        else if (negativeEmotions.includes(msg.emotion)) sentimentSum -= 1;
      }
    });
    
    // Determine emotional expression level
    const totalEmotionScores = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    let expressionLevel = 'moderate'; // default
    
    if (totalEmotionScores > 0) {
      expressionLevel = Object.entries(emotionScores)
        .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    return {
      level: expressionLevel,
      vocabulary: emotionalWords.size,
      polarity: sentimentSum / messages.length, // -1 to 1 scale
      expressionDistribution: totalEmotionScores > 0 ? {
        high: emotionScores.high / totalEmotionScores,
        moderate: emotionScores.moderate / totalEmotionScores,
        low: emotionScores.low / totalEmotionScores
      } : { high: 0.2, moderate: 0.6, low: 0.2 }
    };
  }

  /**
   * Analyzes response timing patterns
   * @private
   * @param {Array} messages - User messages
   * @returns {Object} Response timing analysis
   */
  _analyzeResponseTiming(messages) {
    // Since we don't have precise timing data in the current structure,
    // we'll analyze based on available metadata and make educated inferences
    
    // Look for timing clues in conversation flow
    let responseStyle = 'thoughtful'; // default assumption
    
    // If messages are very short, user might be quick responder
    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    if (avgLength < 30) {
      responseStyle = 'immediate';
    } else if (avgLength > 200) {
      responseStyle = 'deliberate';
    }
    
    // Analyze conversation patterns for timing clues
    const hasEllipses = messages.some(msg => msg.content.includes('...'));
    const hasTypingIndicators = messages.some(msg => 
      msg.content.includes('thinking') || 
      msg.content.includes('hmm') ||
      msg.content.includes('let me')
    );
    
    if (hasEllipses || hasTypingIndicators) {
      responseStyle = 'thoughtful';
    }
    
    return {
      style: responseStyle,
      averageDelay: this.responsePatterns[responseStyle]?.min || 300, // estimated
      consistency: 0.7 // estimated consistency
    };
  }

  /**
   * Analyzes vocabulary complexity and language patterns
   * @private
   * @param {Array} messages - User messages
   * @returns {Object} Vocabulary analysis
   */
  _analyzeVocabulary(messages) {
    let totalWords = 0;
    let uniqueWords = new Set();
    let complexWords = 0;
    let formalWords = 0;
    let creativeExpressions = 0;
    
    const complexWordPattern = /\w{7,}/; // 7+ letter words
    const formalIndicators = ['therefore', 'however', 'furthermore', 'consequently', 'nevertheless'];
    const creativeIndicators = ['!', 'haha', 'lol', 'wow', 'omg', '😊', '😍', '😭', '❤️'];
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      const words = content.split(/\s+/).filter(word => word.length > 2);
      
      totalWords += words.length;
      
      words.forEach(word => {
        uniqueWords.add(word);
        
        if (complexWordPattern.test(word)) {
          complexWords++;
        }
        
        if (formalIndicators.some(formal => content.includes(formal))) {
          formalWords++;
        }
      });
      
      // Count creative expressions
      creativeIndicators.forEach(indicator => {
        if (content.includes(indicator)) {
          creativeExpressions++;
        }
      });
    });
    
    const vocabularyDiversity = uniqueWords.size / totalWords;
    const complexityRatio = complexWords / totalWords;
    const formalityRatio = formalWords / messages.length;
    const creativityRatio = creativeExpressions / messages.length;
    
    return {
      complexity: complexityRatio > 0.3 ? 'high' : complexityRatio > 0.15 ? 'medium' : 'low',
      formality: formalityRatio > 0.2 ? 'formal' : formalityRatio > 0.1 ? 'semi-formal' : 'casual',
      creativity: creativityRatio > 0.5 ? 'high' : creativityRatio > 0.2 ? 'medium' : 'low',
      diversity: vocabularyDiversity,
      averageWordLength: totalWords > 0 ? Array.from(uniqueWords).reduce((sum, word) => sum + word.length, 0) / uniqueWords.size : 5
    };
  }

  /**
   * Analyzes interaction style and social patterns
   * @private
   * @param {Array} messages - User messages
   * @returns {Object} Interaction style analysis
   */
  _analyzeInteractionStyle(messages) {
    let questionCount = 0;
    let initiationPatterns = 0;
    let followUpResponses = 0;
    
    messages.forEach(msg => {
      const content = msg.content;
      
      // Count questions (curiosity indicator)
      if (content.includes('?') || 
          content.toLowerCase().startsWith('what') ||
          content.toLowerCase().startsWith('how') ||
          content.toLowerCase().startsWith('why') ||
          content.toLowerCase().startsWith('when') ||
          content.toLowerCase().startsWith('where')) {
        questionCount++;
      }
      
      // Identify conversation initiation patterns
      if (content.toLowerCase().includes('hi') ||
          content.toLowerCase().includes('hello') ||
          content.toLowerCase().includes('hey') ||
          content.toLowerCase().startsWith('so') ||
          content.toLowerCase().includes('by the way')) {
        initiationPatterns++;
      }
      
      // Identify follow-up response patterns
      if (content.toLowerCase().includes('yeah') ||
          content.toLowerCase().includes('yes') ||
          content.toLowerCase().includes('exactly') ||
          content.toLowerCase().includes('right') ||
          content.toLowerCase().includes('that\'s')) {
        followUpResponses++;
      }
    });
    
    const questionRatio = questionCount / messages.length;
    const initiationRatio = initiationPatterns / messages.length;
    const followUpRatio = followUpResponses / messages.length;
    
    return {
      curiosity: questionRatio > 0.3 ? 'high' : questionRatio > 0.1 ? 'medium' : 'low',
      initiation: initiationRatio > 0.2 ? 'frequent' : initiationRatio > 0.1 ? 'moderate' : 'responsive',
      engagement: followUpRatio > 0.3 ? 'highly_engaged' : followUpRatio > 0.1 ? 'engaged' : 'selective'
    };
  }

  /**
   * Determines overall communication style from all analyses
   * @private
   * @param {Object} analyses - Combined analysis results
   * @returns {string} Overall communication style
   */
  _determineOverallStyle(analyses) {
    const {
      lengthPatterns,
      depthAnalysis,
      emotionalExpression,
      timingPatterns,
      vocabularyAnalysis
    } = analyses;
    
    // Combine factors to determine overall style
    const factors = {
      concise: lengthPatterns.category === 'short' ? 1 : 0,
      expressive: emotionalExpression.level === 'high' ? 1 : 0,
      thoughtful: depthAnalysis.primaryDepth === 'deep' ? 1 : 0,
      casual: vocabularyAnalysis.formality === 'casual' ? 1 : 0,
      creative: vocabularyAnalysis.creativity === 'high' ? 1 : 0,
      deliberate: timingPatterns.style === 'thoughtful' || timingPatterns.style === 'deliberate' ? 1 : 0
    };
    
    // Determine primary style based on dominant factors
    const maxFactor = Object.entries(factors)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Map to communication styles
    const styleMap = {
      concise: 'direct_communicator',
      expressive: 'emotional_communicator',
      thoughtful: 'reflective_communicator',
      casual: 'friendly_communicator',
      creative: 'playful_communicator',
      deliberate: 'thoughtful_communicator'
    };
    
    return styleMap[maxFactor] || 'balanced_communicator';
  }

  /**
   * Calculates analysis confidence based on data quality
   * @private
   * @param {Array} messages - User messages
   * @returns {number} Confidence score (0.0-1.0)
   */
  _calculateAnalysisConfidence(messages) {
    let confidence = 0.0;
    
    // Message quantity factor
    if (messages.length >= 50) confidence += 0.4;
    else if (messages.length >= 25) confidence += 0.3;
    else if (messages.length >= 10) confidence += 0.2;
    else if (messages.length >= 5) confidence += 0.1;
    
    // Message diversity factor
    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    if (avgLength > 20) confidence += 0.2;
    
    // Content richness factor
    const hasEmotions = messages.some(msg => msg.emotion);
    const hasTopics = messages.some(msg => msg.topics && msg.topics.length > 0);
    
    if (hasEmotions) confidence += 0.2;
    if (hasTopics) confidence += 0.2;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Calculates length consistency score
   * @private
   * @param {Array} lengths - Message lengths
   * @returns {number} Consistency score (0.0-1.0)
   */
  _calculateLengthConsistency(lengths) {
    if (lengths.length < 2) return 1.0;
    
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize consistency score (lower standard deviation = higher consistency)
    return Math.max(0.0, 1.0 - (stdDev / mean));
  }

  /**
   * Returns default communication patterns when analysis is not possible
   * @private
   * @returns {Object} Default communication patterns
   */
  _getDefaultPatterns() {
    return {
      averageLength: 'medium',
      lengthDistribution: { short: 0.2, medium: 0.6, long: 0.2, verbose: 0.0 },
      depthPreference: 'moderate',
      topicVariety: 5,
      abstractThinking: 0.3,
      emotionalExpression: 'moderate',
      emotionalVocabulary: 10,
      sentimentPolarity: 0.1,
      responseStyle: 'thoughtful',
      initiationFrequency: 'moderate',
      questionAsking: 'medium',
      vocabularyComplexity: 'medium',
      communicationFormality: 'casual',
      languageCreativity: 'medium',
      overallStyle: 'balanced_communicator',
      confidence: 0.3,
      analysisDate: new Date().toISOString(),
      messageCount: 0
    };
  }
}

module.exports = CommunicationAnalyzer;