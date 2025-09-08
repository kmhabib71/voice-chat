/**
 * @fileoverview Emotional Needs Analyzer - Identifies user emotional needs and support requirements
 * @author AI Girlfriend Project
 * @created 2025-09-08
 * 
 * @example
 * const analyzer = new EmotionalNeedsAnalyzer();
 * const needs = await analyzer.analyzeNeeds(conversationData);
 */

// Utilities
const { logError } = require('../../utils/helpers');

/**
 * Emotional Needs Analyzer
 * Identifies patterns in emotional support needs, stress triggers, and comfort preferences
 */
class EmotionalNeedsAnalyzer {
  constructor() {
    // Emotional need categories
    this.needCategories = {
      validation: {
        keywords: ['understand', 'right', 'correct', 'agree', 'support', 'validate'],
        phrases: ['am i right', 'do you think', 'does that make sense', 'understand me'],
        indicators: ['seeking agreement', 'asking for confirmation', 'looking for understanding']
      },
      comfort: {
        keywords: ['comfort', 'better', 'okay', 'fine', 'help', 'support', 'care'],
        phrases: ['feel better', 'make it okay', 'help me', 'need comfort', 'feeling down'],
        indicators: ['seeking reassurance', 'requesting emotional support', 'expressing vulnerability']
      },
      connection: {
        keywords: ['lonely', 'alone', 'connect', 'understand', 'close', 'bond', 'friend'],
        phrases: ['feel alone', 'want to connect', 'understand each other', 'feel close'],
        indicators: ['expressing loneliness', 'seeking companionship', 'desire for intimacy']
      },
      achievement: {
        keywords: ['proud', 'accomplish', 'achieve', 'success', 'goal', 'win', 'complete'],
        phrases: ['did well', 'accomplished', 'achieved', 'proud of', 'successful'],
        indicators: ['sharing achievements', 'seeking recognition', 'celebrating success']
      },
      growth: {
        keywords: ['learn', 'grow', 'improve', 'better', 'develop', 'change', 'progress'],
        phrases: ['want to learn', 'get better', 'improve myself', 'grow as person'],
        indicators: ['self-improvement desires', 'learning motivation', 'personal development']
      }
    };
    
    // Stress trigger categories
    this.stressTriggers = {
      work: ['job', 'work', 'boss', 'colleague', 'deadline', 'project', 'office', 'career'],
      relationship: ['partner', 'boyfriend', 'girlfriend', 'friend', 'family', 'relationship', 'dating'],
      health: ['sick', 'doctor', 'hospital', 'pain', 'tired', 'exhausted', 'health', 'medical'],
      financial: ['money', 'bills', 'rent', 'expensive', 'broke', 'financial', 'cost', 'budget'],
      social: ['people', 'social', 'party', 'group', 'awkward', 'shy', 'embarrassed', 'judged'],
      academic: ['school', 'exam', 'test', 'study', 'grade', 'homework', 'university', 'college'],
      existential: ['meaning', 'purpose', 'life', 'death', 'existence', 'future', 'direction', 'lost']
    };
    
    // Comfort-seeking patterns
    this.comfortSeekers = {
      affirmation: ['tell me', 'say that', 'reassure', 'promise', 'everything okay', 'will be fine'],
      distraction: ['talk about', 'something else', 'distract me', 'change subject', 'think about'],
      advice: ['what should', 'how can', 'help me', 'what do you think', 'advice', 'suggest'],
      presence: ['stay with', 'here for me', 'talk to me', 'keep me company', 'don\'t leave'],
      understanding: ['understand', 'get it', 'know how', 'relate', 'been there', 'feel that way']
    };
    
    // Joy and positivity triggers
    this.joyTriggers = {
      achievements: ['success', 'won', 'completed', 'achieved', 'accomplished', 'proud', 'excited'],
      relationships: ['love', 'happy', 'together', 'friend', 'family', 'connected', 'close'],
      experiences: ['fun', 'enjoy', 'amazing', 'beautiful', 'wonderful', 'incredible', 'awesome'],
      personal: ['confident', 'strong', 'capable', 'growth', 'learning', 'improving', 'better'],
      simple_pleasures: ['music', 'food', 'nature', 'sunshine', 'pets', 'hobby', 'relax']
    };
  }

  /**
   * Analyzes emotional needs from conversation data
   * @param {Object} conversationData - User conversation history
   * @returns {Promise<Object>} Emotional needs analysis
   */
  async analyzeNeeds(conversationData) {
    try {
      console.log('💝 Analyzing emotional needs...');
      
      if (!conversationData?.messages || conversationData.messages.length === 0) {
        return this._getDefaultNeeds();
      }
      
      // Filter messages for emotional analysis
      const emotionalMessages = conversationData.messages.filter(msg => 
        msg.content && 
        msg.content.length > 10 && 
        (msg.emotion || this._hasEmotionalContent(msg.content))
      );
      
      if (emotionalMessages.length < 2) {
        return this._getDefaultNeeds();
      }
      
      console.log(`💭 Analyzing ${emotionalMessages.length} emotionally relevant messages...`);
      
      // Parallel analysis of different emotional aspects
      const [
        primaryNeeds,
        stressPatterns,
        comfortPreferences,
        joyPatterns,
        supportStyle,
        emotionalIntensity
      ] = await Promise.all([
        this._identifyPrimaryNeeds(emotionalMessages),
        this._analyzeStressTriggers(emotionalMessages),
        this._analyzeComfortSeeking(emotionalMessages),
        this._analyzeJoyTriggers(emotionalMessages),
        this._analyzeSupportStyle(emotionalMessages),
        this._analyzeEmotionalIntensity(emotionalMessages)
      ]);
      
      // Calculate overall emotional need level
      const overallNeedLevel = this._calculateOverallNeedLevel({
        primaryNeeds,
        stressPatterns,
        emotionalIntensity
      });
      
      // Calculate confidence based on data quality
      const confidence = this._calculateNeedsConfidence(emotionalMessages);
      
      const analysis = {
        // Overall emotional need level (0.0-1.0)
        overallLevel: overallNeedLevel,
        
        // Primary emotional needs (ranked by frequency)
        primaryNeeds: primaryNeeds.ranking,
        needsDistribution: primaryNeeds.distribution,
        
        // Stress and trigger analysis
        stressTriggers: stressPatterns.triggers,
        stressIntensity: stressPatterns.intensity,
        stressFrequency: stressPatterns.frequency,
        
        // Comfort and support preferences
        comfortSeekers: comfortPreferences.preferences,
        supportStyle: supportStyle.preferredStyle,
        supportEffectiveness: supportStyle.effectiveness,
        
        // Joy and positivity patterns
        joyTriggers: joyPatterns.triggers,
        positivityLevel: joyPatterns.baseline,
        resilience: joyPatterns.resilience,
        
        // Emotional patterns and intensity
        emotionalRange: emotionalIntensity.range,
        emotionalVolatility: emotionalIntensity.volatility,
        emotionalDepth: emotionalIntensity.depth,
        
        // Analysis metadata
        confidence,
        analysisDate: new Date().toISOString(),
        messageCount: emotionalMessages.length,
        emotionalMessageRatio: emotionalMessages.length / conversationData.messages.length
      };
      
      console.log(`✅ Emotional needs analysis completed (confidence: ${confidence.toFixed(2)})`);
      console.log(`🎯 Overall need level: ${overallNeedLevel.toFixed(2)}`);
      
      return analysis;
      
    } catch (error) {
      logError('EmotionalNeedsAnalyzer.analyzeNeeds', error);
      return this._getDefaultNeeds();
    }
  }

  /**
   * Checks if message content has emotional indicators
   * @private
   * @param {string} content - Message content
   * @returns {boolean} True if content appears emotional
   */
  _hasEmotionalContent(content) {
    const emotionalIndicators = [
      'feel', 'feeling', 'felt', 'emotion', 'heart', 'sad', 'happy', 'angry',
      'worried', 'excited', 'scared', 'nervous', 'anxious', 'depressed',
      'love', 'hate', 'miss', 'hurt', 'pain', 'joy', 'fear', '!', '?'
    ];
    
    const lowerContent = content.toLowerCase();
    return emotionalIndicators.some(indicator => lowerContent.includes(indicator));
  }

  /**
   * Identifies primary emotional needs from messages
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {Object} Primary needs analysis
   */
  _identifyPrimaryNeeds(messages) {
    const needScores = {};
    
    // Initialize scores
    Object.keys(this.needCategories).forEach(need => {
      needScores[need] = 0;
    });
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Score each need category
      Object.entries(this.needCategories).forEach(([needType, patterns]) => {
        let score = 0;
        
        // Check keywords
        patterns.keywords.forEach(keyword => {
          if (content.includes(keyword)) score += 1;
        });
        
        // Check phrases (higher weight)
        patterns.phrases.forEach(phrase => {
          if (content.includes(phrase)) score += 2;
        });
        
        needScores[needType] += score;
      });
    });
    
    // Calculate distribution
    const totalScore = Object.values(needScores).reduce((sum, score) => sum + score, 0);
    const distribution = {};
    
    if (totalScore > 0) {
      Object.entries(needScores).forEach(([need, score]) => {
        distribution[need] = score / totalScore;
      });
    } else {
      // Default distribution if no patterns found
      Object.keys(this.needCategories).forEach(need => {
        distribution[need] = 1 / Object.keys(this.needCategories).length;
      });
    }
    
    // Rank needs by frequency
    const ranking = Object.entries(needScores)
      .sort(([,a], [,b]) => b - a)
      .map(([need]) => need);
    
    return {
      ranking,
      distribution,
      scores: needScores
    };
  }

  /**
   * Analyzes stress triggers from messages
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {Object} Stress trigger analysis
   */
  _analyzeStressTriggers(messages) {
    const triggerScores = {};
    let totalStressMessages = 0;
    let stressIntensitySum = 0;
    
    // Initialize trigger scores
    Object.keys(this.stressTriggers).forEach(trigger => {
      triggerScores[trigger] = 0;
    });
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      const isStressMessage = msg.emotion && 
        ['anxiety', 'stress', 'worry', 'anger', 'sadness', 'frustration'].includes(msg.emotion);
      
      if (isStressMessage) {
        totalStressMessages++;
        
        // Estimate stress intensity based on content
        const stressWords = ['very', 'really', 'extremely', 'so', 'totally', '!', 'terrible', 'awful', 'horrible'];
        let intensity = 0.5; // baseline
        stressWords.forEach(word => {
          if (content.includes(word)) intensity += 0.1;
        });
        stressIntensitySum += Math.min(1.0, intensity);
      }
      
      // Check for trigger categories
      Object.entries(this.stressTriggers).forEach(([triggerType, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            triggerScores[triggerType] += isStressMessage ? 2 : 1; // Higher weight if in stress context
          }
        });
      });
    });
    
    // Identify primary triggers
    const triggers = Object.entries(triggerScores)
      .filter(([, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([trigger]) => trigger);
    
    return {
      triggers,
      intensity: totalStressMessages > 0 ? stressIntensitySum / totalStressMessages : 0.3,
      frequency: totalStressMessages / messages.length,
      triggerDistribution: this._normalizeScores(triggerScores)
    };
  }

  /**
   * Analyzes comfort-seeking patterns
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {Object} Comfort-seeking analysis
   */
  _analyzeComfortSeeking(messages) {
    const comfortScores = {};
    
    // Initialize comfort scores
    Object.keys(this.comfortSeekers).forEach(comfort => {
      comfortScores[comfort] = 0;
    });
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Look for comfort-seeking patterns
      Object.entries(this.comfortSeekers).forEach(([comfortType, patterns]) => {
        patterns.forEach(pattern => {
          if (content.includes(pattern)) {
            comfortScores[comfortType] += 1;
          }
        });
      });
    });
    
    // Rank comfort preferences
    const preferences = Object.entries(comfortScores)
      .filter(([, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([comfort]) => comfort);
    
    return {
      preferences,
      distribution: this._normalizeScores(comfortScores)
    };
  }

  /**
   * Analyzes joy and positivity triggers
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {Object} Joy trigger analysis
   */
  _analyzeJoyTriggers(messages) {
    const joyScores = {};
    let positiveMessages = 0;
    let totalEmotionalMessages = 0;
    
    // Initialize joy scores
    Object.keys(this.joyTriggers).forEach(joy => {
      joyScores[joy] = 0;
    });
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      const isPositive = msg.emotion && 
        ['joy', 'happiness', 'excitement', 'contentment', 'love'].includes(msg.emotion);
      
      if (msg.emotion) totalEmotionalMessages++;
      if (isPositive) positiveMessages++;
      
      // Check for joy triggers
      Object.entries(this.joyTriggers).forEach(([joyType, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            joyScores[joyType] += isPositive ? 2 : 1; // Higher weight in positive context
          }
        });
      });
    });
    
    // Calculate positivity baseline
    const positivityLevel = totalEmotionalMessages > 0 ? 
      positiveMessages / totalEmotionalMessages : 0.5;
    
    // Calculate resilience (ability to bounce back)
    const resilience = this._calculateResilience(messages);
    
    // Rank joy triggers
    const triggers = Object.entries(joyScores)
      .filter(([, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([joy]) => joy);
    
    return {
      triggers,
      baseline: positivityLevel,
      resilience,
      triggerDistribution: this._normalizeScores(joyScores)
    };
  }

  /**
   * Analyzes preferred support style
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {Object} Support style analysis
   */
  _analyzeSupportStyle(messages) {
    const supportPatterns = {
      directive: ['tell me what to do', 'should i', 'what should', 'advice', 'recommend'],
      empathetic: ['understand', 'feel', 'relate', 'know how', 'been there'],
      solution_focused: ['how to', 'fix', 'solve', 'resolve', 'handle', 'deal with'],
      validating: ['right', 'correct', 'normal', 'okay', 'understandable', 'makes sense'],
      encouraging: ['can do', 'strong', 'capable', 'believe in', 'support', 'proud']
    };
    
    const styleScores = {};
    Object.keys(supportPatterns).forEach(style => {
      styleScores[style] = 0;
    });
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      Object.entries(supportPatterns).forEach(([style, patterns]) => {
        patterns.forEach(pattern => {
          if (content.includes(pattern)) {
            styleScores[style] += 1;
          }
        });
      });
    });
    
    // Determine preferred style
    const preferredStyle = Object.entries(styleScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'empathetic';
    
    // Calculate effectiveness (subjective estimate based on patterns)
    const totalSupportSeeking = Object.values(styleScores).reduce((sum, score) => sum + score, 0);
    const effectiveness = totalSupportSeeking > 0 ? 
      styleScores[preferredStyle] / totalSupportSeeking : 0.5;
    
    return {
      preferredStyle,
      effectiveness,
      styleDistribution: this._normalizeScores(styleScores)
    };
  }

  /**
   * Analyzes emotional intensity patterns
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {Object} Emotional intensity analysis
   */
  _analyzeEmotionalIntensity(messages) {
    const intensityScores = messages.map(msg => {
      const content = msg.content.toLowerCase();
      
      // Base intensity from emotion if available
      let intensity = 0.5;
      
      if (msg.emotion) {
        const highIntensity = ['rage', 'ecstasy', 'terror', 'despair', 'elation'];
        const mediumIntensity = ['anger', 'joy', 'fear', 'sadness', 'excitement'];
        const lowIntensity = ['irritation', 'contentment', 'worry', 'melancholy', 'calm'];
        
        if (highIntensity.includes(msg.emotion)) intensity = 0.9;
        else if (mediumIntensity.includes(msg.emotion)) intensity = 0.7;
        else if (lowIntensity.includes(msg.emotion)) intensity = 0.3;
      }
      
      // Adjust based on content indicators
      const intensifiers = ['very', 'extremely', 'so', 'really', 'totally', '!', '!!', '!!!'];
      intensifiers.forEach(intensifier => {
        if (content.includes(intensifier)) intensity += 0.1;
      });
      
      return Math.min(1.0, intensity);
    });
    
    if (intensityScores.length === 0) {
      return { range: 0.4, volatility: 0.3, depth: 0.5 };
    }
    
    const avgIntensity = intensityScores.reduce((sum, score) => sum + score, 0) / intensityScores.length;
    const maxIntensity = Math.max(...intensityScores);
    const minIntensity = Math.min(...intensityScores);
    
    // Calculate emotional volatility (variance in intensity)
    const variance = intensityScores.reduce((sum, score) => 
      sum + Math.pow(score - avgIntensity, 2), 0) / intensityScores.length;
    const volatility = Math.sqrt(variance);
    
    return {
      range: maxIntensity - minIntensity,
      volatility: Math.min(1.0, volatility),
      depth: avgIntensity
    };
  }

  /**
   * Calculates overall emotional need level
   * @private
   * @param {Object} analyses - Combined analysis results
   * @returns {number} Overall need level (0.0-1.0)
   */
  _calculateOverallNeedLevel(analyses) {
    const { primaryNeeds, stressPatterns, emotionalIntensity } = analyses;
    
    // Factors contributing to emotional need level
    const needIntensity = primaryNeeds.distribution.validation * 0.3 +
                         primaryNeeds.distribution.comfort * 0.3 +
                         primaryNeeds.distribution.connection * 0.2;
    
    const stressLevel = stressPatterns.frequency * 0.6 + stressPatterns.intensity * 0.4;
    const emotionalLevel = emotionalIntensity.depth * 0.5 + emotionalIntensity.volatility * 0.3;
    
    // Weighted combination
    const overallLevel = needIntensity * 0.4 + stressLevel * 0.4 + emotionalLevel * 0.2;
    
    return Math.min(1.0, Math.max(0.0, overallLevel));
  }

  /**
   * Calculates resilience score from emotional patterns
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {number} Resilience score (0.0-1.0)
   */
  _calculateResilience(messages) {
    let recoveryPatterns = 0;
    let totalNegativeEmotions = 0;
    
    const negativeEmotions = ['sadness', 'anger', 'fear', 'anxiety', 'frustration', 'despair'];
    const recoveryIndicators = ['better', 'improving', 'feeling good', 'moving on', 'learned', 'grew'];
    
    messages.forEach((msg, index) => {
      if (msg.emotion && negativeEmotions.includes(msg.emotion)) {
        totalNegativeEmotions++;
        
        // Check subsequent messages for recovery indicators
        for (let i = index + 1; i < Math.min(index + 5, messages.length); i++) {
          const laterMsg = messages[i];
          const content = laterMsg.content.toLowerCase();
          
          if (recoveryIndicators.some(indicator => content.includes(indicator))) {
            recoveryPatterns++;
            break;
          }
        }
      }
    });
    
    // Calculate resilience ratio
    return totalNegativeEmotions > 0 ? 
      Math.min(1.0, recoveryPatterns / totalNegativeEmotions) : 0.7;
  }

  /**
   * Normalizes scores to create distribution
   * @private
   * @param {Object} scores - Score object
   * @returns {Object} Normalized distribution
   */
  _normalizeScores(scores) {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (total === 0) {
      const keys = Object.keys(scores);
      const equalWeight = 1 / keys.length;
      const distribution = {};
      keys.forEach(key => { distribution[key] = equalWeight; });
      return distribution;
    }
    
    const distribution = {};
    Object.entries(scores).forEach(([key, score]) => {
      distribution[key] = score / total;
    });
    
    return distribution;
  }

  /**
   * Calculates analysis confidence based on data quality
   * @private
   * @param {Array} messages - Emotionally relevant messages
   * @returns {number} Confidence score (0.0-1.0)
   */
  _calculateNeedsConfidence(messages) {
    let confidence = 0.0;
    
    // Message quantity factor
    if (messages.length >= 20) confidence += 0.4;
    else if (messages.length >= 10) confidence += 0.3;
    else if (messages.length >= 5) confidence += 0.2;
    else if (messages.length >= 2) confidence += 0.1;
    
    // Emotional diversity factor
    const emotions = new Set(messages.filter(msg => msg.emotion).map(msg => msg.emotion));
    if (emotions.size >= 5) confidence += 0.3;
    else if (emotions.size >= 3) confidence += 0.2;
    else if (emotions.size >= 1) confidence += 0.1;
    
    // Content richness factor
    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    if (avgLength > 50) confidence += 0.3;
    else if (avgLength > 20) confidence += 0.2;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Returns default emotional needs when analysis is not possible
   * @private
   * @returns {Object} Default emotional needs
   */
  _getDefaultNeeds() {
    return {
      overallLevel: 0.5,
      primaryNeeds: ['validation', 'comfort', 'connection'],
      needsDistribution: {
        validation: 0.25,
        comfort: 0.25,
        connection: 0.2,
        achievement: 0.15,
        growth: 0.15
      },
      stressTriggers: ['work', 'relationship'],
      stressIntensity: 0.4,
      stressFrequency: 0.2,
      comfortSeekers: ['understanding', 'affirmation'],
      supportStyle: 'empathetic',
      supportEffectiveness: 0.6,
      joyTriggers: ['relationships', 'achievements'],
      positivityLevel: 0.6,
      resilience: 0.7,
      emotionalRange: 0.4,
      emotionalVolatility: 0.3,
      emotionalDepth: 0.5,
      confidence: 0.3,
      analysisDate: new Date().toISOString(),
      messageCount: 0,
      emotionalMessageRatio: 0.0
    };
  }
}

module.exports = EmotionalNeedsAnalyzer;