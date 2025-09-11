/**
 * @fileoverview Emotional needs prediction system that anticipates user's emotional requirements
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const predictor = new EmotionalNeedsPredictor();
 * const prediction = await predictor.predictEmotionalNeeds(userId, message, context);
 */

// Internal core systems
const PersonalityProfiler = require('./PersonalityProfiler');
const PersonalityClassifier = require('./PersonalityClassifier');
const memoryManager = require("../memory");

// API integrations
const openaiService = require('../../api/openai');

class EmotionalNeedsPredictor {
  constructor() {
    this.personalityProfiler = new PersonalityProfiler();
    this.personalityClassifier = new PersonalityClassifier();
    this.memoryManager = memoryManager;
    
    // Emotional need categories from TASKS.md lines 606-629
    this.emotionalNeeds = {
      primaryNeeds: [
        'deep-comfort',
        'celebration-sharing', 
        'guidance-seeking',
        'connection-craving',
        'validation-seeking',
        'adventure-planning'
      ],
      hiddenNeeds: [
        'needs-permission-to-be-vulnerable',
        'needs-non-work-identity-validation',
        'needs-relationship-focus-encouragement', 
        'needs-confidence-boosting'
      ],
      responseTypes: [
        'nurturing-support',
        'enthusiastic-celebration',
        'gentle-guidance',
        'intimate-connection',
        'empowering-validation',
        'playful-adventure'
      ]
    };

    // Need detection patterns
    this.needPatterns = {
      'deep-comfort': {
        keywords: ['hurt', 'sad', 'upset', 'crying', 'pain', 'difficult', 'hard', 'struggling'],
        emotional_indicators: ['vulnerability', 'distress', 'overwhelm'],
        contextual_triggers: ['loss', 'rejection', 'failure', 'disappointment'],
        archetype_affinity: {
          'The Anxious Romantic': 0.9,
          'The Caring Nurturer': 0.8,
          'The Deep Thinker': 0.6,
          'The Playful Socializer': 0.5,
          'The Independent Adventurer': 0.4
        }
      },
      
      'celebration-sharing': {
        keywords: ['excited', 'happy', 'achieved', 'accomplished', 'success', 'won', 'great news'],
        emotional_indicators: ['joy', 'pride', 'excitement', 'triumph'],
        contextual_triggers: ['achievement', 'milestone', 'good_news', 'progress'],
        archetype_affinity: {
          'The Playful Socializer': 0.9,
          'The Independent Adventurer': 0.8,
          'The Caring Nurturer': 0.7,
          'The Deep Thinker': 0.6,
          'The Anxious Romantic': 0.7
        }
      },
      
      'guidance-seeking': {
        keywords: ['confused', 'unsure', 'what should', 'advice', 'help', 'don\'t know', 'stuck'],
        emotional_indicators: ['uncertainty', 'confusion', 'helplessness'],
        contextual_triggers: ['decision', 'problem', 'crossroads', 'challenge'],
        archetype_affinity: {
          'The Deep Thinker': 0.8,
          'The Anxious Romantic': 0.8,
          'The Caring Nurturer': 0.6,
          'The Independent Adventurer': 0.5,
          'The Playful Socializer': 0.6
        }
      },
      
      'connection-craving': {
        keywords: ['lonely', 'alone', 'miss', 'together', 'talk', 'share', 'connect'],
        emotional_indicators: ['loneliness', 'isolation', 'longing'],
        contextual_triggers: ['separation', 'solitude', 'distance', 'absence'],
        archetype_affinity: {
          'The Anxious Romantic': 0.9,
          'The Caring Nurturer': 0.8,
          'The Playful Socializer': 0.8,
          'The Deep Thinker': 0.7,
          'The Independent Adventurer': 0.5
        }
      },
      
      'validation-seeking': {
        keywords: ['right', 'correct', 'good', 'okay', 'approve', 'think', 'opinion'],
        emotional_indicators: ['insecurity', 'doubt', 'need_approval'],
        contextual_triggers: ['self_doubt', 'decision_confirmation', 'performance_anxiety'],
        archetype_affinity: {
          'The Anxious Romantic': 0.9,
          'The Caring Nurturer': 0.6,
          'The Deep Thinker': 0.5,
          'The Playful Socializer': 0.7,
          'The Independent Adventurer': 0.3
        }
      },
      
      'adventure-planning': {
        keywords: ['explore', 'try', 'new', 'adventure', 'experience', 'travel', 'discover'],
        emotional_indicators: ['excitement', 'curiosity', 'restlessness'],
        contextual_triggers: ['boredom', 'routine', 'opportunity', 'inspiration'],
        archetype_affinity: {
          'The Independent Adventurer': 0.9,
          'The Playful Socializer': 0.8,
          'The Deep Thinker': 0.6,
          'The Caring Nurturer': 0.5,
          'The Anxious Romantic': 0.4
        }
      }
    };

    // Hidden need detection patterns
    this.hiddenNeedPatterns = {
      'needs-permission-to-be-vulnerable': {
        surface_indicators: ['fine', 'okay', 'whatever', 'doesn\'t matter'],
        deeper_signals: ['deflection', 'minimizing', 'topic_avoidance'],
        context_clues: ['stress_present', 'recent_difficulties', 'guarded_language'],
        detection_confidence: 0.7
      },
      
      'needs-non-work-identity-validation': {
        surface_indicators: ['work', 'job', 'career', 'busy', 'stress', 'tired'],
        deeper_signals: ['work_dominated_conversation', 'self_worth_tied_to_productivity'],
        context_clues: ['work_stress', 'burnout_indicators', 'lack_personal_topics'],
        detection_confidence: 0.6
      },
      
      'needs-relationship-focus-encouragement': {
        surface_indicators: ['us', 'relationship', 'together', 'we', 'our'],
        deeper_signals: ['relationship_insecurity', 'need_reassurance'],
        context_clues: ['relationship_topics', 'future_planning', 'commitment_discussion'],
        detection_confidence: 0.8
      },
      
      'needs-confidence-boosting': {
        surface_indicators: ['not good', 'can\'t', 'fail', 'wrong', 'stupid'],
        deeper_signals: ['self_deprecation', 'negative_self_talk'],
        context_clues: ['recent_failures', 'comparison_making', 'impostor_syndrome'],
        detection_confidence: 0.7
      }
    };

    // Response type mapping
    this.responseTypeMapping = {
      'deep-comfort': 'nurturing-support',
      'celebration-sharing': 'enthusiastic-celebration',
      'guidance-seeking': 'gentle-guidance',
      'connection-craving': 'intimate-connection',
      'validation-seeking': 'empowering-validation',
      'adventure-planning': 'playful-adventure'
    };

    // Prediction cache for performance
    this.predictionCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Predicts user's emotional needs from current message and context
   * @param {string} userId - User identifier
   * @param {string} message - Current user message
   * @param {Object} conversationContext - Conversation context
   * @returns {Promise<Object>} Emotional needs prediction
   */
  async predictEmotionalNeeds(userId, message, conversationContext = {}) {
    try {
      console.log(`Predicting emotional needs for user: ${userId}`);

      // Check cache first for recent predictions
      const cacheKey = this._generateCacheKey(userId, message);
      const cachedPrediction = this._getCachedPrediction(cacheKey);
      if (cachedPrediction) {
        return cachedPrediction;
      }

      // Gather comprehensive context
      const [personalityContext, recentHistory, emotionalBaseline] = await Promise.all([
        this._getPersonalityContext(userId),
        this._getRecentConversationHistory(userId),
        this._getEmotionalBaseline(userId)
      ]);

      // Analyze current message for emotional indicators
      const messageAnalysis = await this._analyzeMessageEmotionalContent(message, personalityContext);
      
      // Cross-reference with personality patterns and history
      const patternAnalysis = this._crossReferencePatterns(
        messageAnalysis,
        personalityContext,
        recentHistory,
        emotionalBaseline
      );

      // Predict primary and hidden emotional needs
      const primaryNeed = this._predictPrimaryNeed(patternAnalysis, personalityContext);
      const hiddenNeeds = await this._detectHiddenNeeds(
        message,
        patternAnalysis,
        recentHistory,
        personalityContext
      );

      // Determine optimal response type and conversation goal
      const responseStrategy = this._determineResponseStrategy(
        primaryNeed,
        hiddenNeeds,
        personalityContext,
        conversationContext
      );

      const prediction = {
        userId,
        timestamp: new Date().toISOString(),
        prediction: {
          primaryNeed: primaryNeed,
          hiddenNeeds: hiddenNeeds,
          confidence: this._calculatePredictionConfidence(patternAnalysis, personalityContext),
          urgency: this._assessEmotionalUrgency(primaryNeed, messageAnalysis),
          responseStrategy: responseStrategy
        },
        context: {
          messageAnalysis: messageAnalysis,
          personalityArchetype: personalityContext.archetype,
          emotionalBaseline: emotionalBaseline,
          conversationPhase: this._detectConversationPhase(recentHistory)
        },
        recommendations: {
          responseType: responseStrategy.optimalResponseType,
          conversationGoal: responseStrategy.conversationGoal,
          avoidancePatterns: responseStrategy.avoidancePatterns,
          priorityActions: responseStrategy.priorityActions
        }
      };

      // Cache the prediction
      this._cachePrediction(cacheKey, prediction);

      console.log(`Emotional needs predicted: ${primaryNeed.need} (${Math.round(primaryNeed.confidence * 100)}% confidence)`);
      
      return prediction;

    } catch (error) {
      console.error('Error predicting emotional needs:', error);
      return this._getDefaultPrediction(userId, message);
    }
  }

  /**
   * Gets personality context for emotional need prediction
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Personality context
   */
  async _getPersonalityContext(userId) {
    try {
      const [personalityProfile, classification] = await Promise.all([
        this.personalityProfiler.analyzePersonality(userId),
        this.personalityClassifier.classifyUser(userId)
      ]);

      return {
        profile: personalityProfile,
        archetype: classification.archetype,
        confidence: classification.confidence,
        adaptationStrategy: classification.adaptationStrategy
      };
    } catch (error) {
      console.error('Error getting personality context:', error);
      return {
        archetype: 'The Playful Socializer',
        confidence: 0.5,
        profile: { bigFiveTraits: {} }
      };
    }
  }

  /**
   * Gets recent conversation history for pattern analysis
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} Recent conversations
   */
  async _getRecentConversationHistory(userId) {
    try {
      const recentConversations = await this.memoryManager.getRecentConversations(userId, 10);
      return recentConversations || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Gets user's emotional baseline for comparison
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Emotional baseline
   */
  async _getEmotionalBaseline(userId) {
    try {
      // Analyze last 20 conversations for emotional patterns
      const conversations = await this.memoryManager.getRecentConversations(userId, 20);
      
      if (!conversations || conversations.length === 0) {
        return {
          averageMood: 'neutral',
          stressLevel: 'moderate',
          communicationStyle: 'balanced',
          needsFrequency: {}
        };
      }

      const moodAnalysis = this._analyzeMoodPatterns(conversations);
      const stressAnalysis = this._analyzeStressPatterns(conversations);
      const needsFrequency = this._analyzeNeedsFrequency(conversations);

      return {
        averageMood: moodAnalysis.predominantMood,
        stressLevel: stressAnalysis.averageLevel,
        communicationStyle: moodAnalysis.communicationStyle,
        needsFrequency: needsFrequency,
        dataQuality: conversations.length >= 10 ? 'good' : 'limited'
      };
    } catch (error) {
      console.error('Error getting emotional baseline:', error);
      return {
        averageMood: 'neutral',
        stressLevel: 'moderate',
        communicationStyle: 'balanced',
        needsFrequency: {}
      };
    }
  }

  /**
   * Analyzes message for emotional content and indicators
   * @param {string} message - User message
   * @param {Object} personalityContext - Personality context
   * @returns {Promise<Object>} Message emotional analysis
   */
  async _analyzeMessageEmotionalContent(message, personalityContext) {
    const lowerMessage = message.toLowerCase();
    
    const analysis = {
      emotionalKeywords: [],
      emotionalIntensity: 0,
      emotionalValence: 0, // -1 (negative) to 1 (positive)
      detectedEmotions: [],
      urgencyIndicators: [],
      vulnerabilityMarkers: [],
      messageLength: message.length,
      questionCount: (message.match(/\?/g) || []).length,
      exclamationCount: (message.match(/!/g) || []).length,
      personalPronouns: this._countPersonalPronouns(message),
      temporalReferences: this._detectTemporalReferences(message)
    };

    // Emotional keyword detection
    const emotionKeywords = {
      positive: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'awesome'],
      negative: ['sad', 'upset', 'angry', 'hurt', 'disappointed', 'frustrated', 'worried'],
      stress: ['stressed', 'overwhelmed', 'pressure', 'difficult', 'hard', 'struggle'],
      vulnerability: ['scared', 'afraid', 'nervous', 'insecure', 'doubt', 'unsure']
    };

    // Analyze emotional keywords
    Object.entries(emotionKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          analysis.emotionalKeywords.push({ keyword, category });
          
          // Adjust emotional metrics
          if (category === 'positive') {
            analysis.emotionalValence += 0.3;
            analysis.emotionalIntensity += 0.2;
          } else if (category === 'negative' || category === 'stress') {
            analysis.emotionalValence -= 0.4;
            analysis.emotionalIntensity += 0.4;
            analysis.urgencyIndicators.push(keyword);
          } else if (category === 'vulnerability') {
            analysis.emotionalIntensity += 0.5;
            analysis.vulnerabilityMarkers.push(keyword);
          }
        }
      });
    });

    // Detect specific emotional states
    analysis.detectedEmotions = this._detectSpecificEmotions(lowerMessage);

    // Adjust intensity based on message characteristics
    if (analysis.exclamationCount > 0) {
      analysis.emotionalIntensity += 0.2 * analysis.exclamationCount;
    }
    
    if (analysis.messageLength > 200) {
      analysis.emotionalIntensity += 0.1; // Longer messages often indicate emotional investment
    }

    // Clamp values
    analysis.emotionalIntensity = Math.min(1.0, analysis.emotionalIntensity);
    analysis.emotionalValence = Math.max(-1.0, Math.min(1.0, analysis.emotionalValence));

    return analysis;
  }

  /**
   * Cross-references message analysis with user patterns
   * @param {Object} messageAnalysis - Message analysis results
   * @param {Object} personalityContext - User personality context
   * @param {Array} recentHistory - Recent conversation history
   * @param {Object} emotionalBaseline - User's emotional baseline
   * @returns {Object} Pattern analysis results
   */
  _crossReferencePatterns(messageAnalysis, personalityContext, recentHistory, emotionalBaseline) {
    const patternAnalysis = {
      needMatches: {},
      personalityAlignment: {},
      historyCorrelation: {},
      baselineDeviation: {},
      contextualFactors: {}
    };

    const archetype = personalityContext.archetype || 'The Playful Socializer';

    // Match message against need patterns
    Object.entries(this.needPatterns).forEach(([need, pattern]) => {
      let matchScore = 0;
      let matchReasons = [];

      // Keyword matching
      const keywordMatches = pattern.keywords.filter(keyword =>
        messageAnalysis.emotionalKeywords.some(ek => ek.keyword.includes(keyword))
      );
      if (keywordMatches.length > 0) {
        matchScore += 0.4;
        matchReasons.push(`Keywords: ${keywordMatches.join(', ')}`);
      }

      // Emotional indicator matching
      if (messageAnalysis.detectedEmotions.some(emotion =>
        pattern.emotional_indicators.includes(emotion)
      )) {
        matchScore += 0.3;
        matchReasons.push('Emotional indicators match');
      }

      // Archetype affinity
      const archetypeAffinity = pattern.archetype_affinity[archetype] || 0.5;
      matchScore *= archetypeAffinity;

      // Message characteristics alignment
      if (need === 'deep-comfort' && messageAnalysis.vulnerabilityMarkers.length > 0) {
        matchScore += 0.2;
        matchReasons.push('Vulnerability detected');
      }
      
      if (need === 'validation-seeking' && messageAnalysis.questionCount > 0) {
        matchScore += 0.15;
        matchReasons.push('Seeking input/validation');
      }

      patternAnalysis.needMatches[need] = {
        score: Math.min(1.0, matchScore),
        reasons: matchReasons,
        archetypeAffinity: archetypeAffinity
      };
    });

    // Analyze personality alignment
    patternAnalysis.personalityAlignment = {
      archetype: archetype,
      confidence: personalityContext.confidence || 0.5,
      needsPredisposition: this._analyzeNeedsPredisposition(personalityContext)
    };

    // History correlation analysis
    patternAnalysis.historyCorrelation = this._analyzeHistoryCorrelation(
      messageAnalysis,
      recentHistory
    );

    // Baseline deviation analysis
    patternAnalysis.baselineDeviation = {
      moodShift: this._calculateMoodDeviation(messageAnalysis, emotionalBaseline),
      intensityChange: this._calculateIntensityDeviation(messageAnalysis, emotionalBaseline),
      patternBreak: this._detectPatternBreaks(messageAnalysis, emotionalBaseline)
    };

    return patternAnalysis;
  }

  /**
   * Predicts primary emotional need based on pattern analysis
   * @param {Object} patternAnalysis - Pattern analysis results
   * @param {Object} personalityContext - Personality context
   * @returns {Object} Primary need prediction
   */
  _predictPrimaryNeed(patternAnalysis, personalityContext) {
    const needScores = patternAnalysis.needMatches;
    
    // Find highest scoring need
    let topNeed = null;
    let topScore = 0;
    
    Object.entries(needScores).forEach(([need, analysis]) => {
      if (analysis.score > topScore) {
        topScore = analysis.score;
        topNeed = need;
      }
    });

    // Apply contextual adjustments
    const contextualAdjustment = this._applyContextualAdjustments(
      topNeed,
      topScore,
      patternAnalysis,
      personalityContext
    );

    return {
      need: contextualAdjustment.need || topNeed || 'connection-craving',
      confidence: contextualAdjustment.score || topScore || 0.5,
      reasoning: needScores[topNeed]?.reasons || ['Default connection need'],
      alternativeNeeds: this._getAlternativeNeeds(needScores, topNeed)
    };
  }

  /**
   * Detects hidden emotional needs that aren't explicitly stated
   * @param {string} message - User message
   * @param {Object} patternAnalysis - Pattern analysis
   * @param {Array} recentHistory - Recent history
   * @param {Object} personalityContext - Personality context
   * @returns {Promise<Array>} Hidden needs detected
   */
  async _detectHiddenNeeds(message, patternAnalysis, recentHistory, personalityContext) {
    const hiddenNeeds = [];
    const lowerMessage = message.toLowerCase();

    // Analyze each hidden need pattern
    Object.entries(this.hiddenNeedPatterns).forEach(([hiddenNeed, pattern]) => {
      let detectionScore = 0;
      let detectionReasons = [];

      // Surface indicator analysis
      const surfaceMatches = pattern.surface_indicators.filter(indicator =>
        lowerMessage.includes(indicator)
      );
      if (surfaceMatches.length > 0) {
        detectionScore += 0.3;
        detectionReasons.push(`Surface indicators: ${surfaceMatches.join(', ')}`);
      }

      // Deeper signal analysis
      if (this._detectDeeperSignals(message, pattern.deeper_signals, recentHistory)) {
        detectionScore += 0.4;
        detectionReasons.push('Deeper behavioral signals detected');
      }

      // Context clue analysis
      if (this._analyzeContextClues(patternAnalysis, pattern.context_clues)) {
        detectionScore += 0.3;
        detectionReasons.push('Contextual clues present');
      }

      // Apply detection confidence threshold
      if (detectionScore >= pattern.detection_confidence) {
        hiddenNeeds.push({
          need: hiddenNeed,
          confidence: detectionScore,
          reasons: detectionReasons,
          severity: this._assessHiddenNeedSeverity(hiddenNeed, detectionScore, patternAnalysis)
        });
      }
    });

    // Sort by confidence and return top 3
    return hiddenNeeds
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Determines optimal response strategy based on predicted needs
   * @param {Object} primaryNeed - Primary need prediction
   * @param {Array} hiddenNeeds - Hidden needs array
   * @param {Object} personalityContext - Personality context
   * @param {Object} conversationContext - Conversation context
   * @returns {Object} Response strategy
   */
  _determineResponseStrategy(primaryNeed, hiddenNeeds, personalityContext, conversationContext) {
    const responseType = this.responseTypeMapping[primaryNeed.need] || 'intimate-connection';
    const archetype = personalityContext.archetype || 'The Playful Socializer';

    // Determine conversation goals based on needs
    const conversationGoals = this._determineConversationGoals(primaryNeed, hiddenNeeds, archetype);
    
    // Identify patterns to avoid
    const avoidancePatterns = this._getAvoidancePatternsForNeeds(primaryNeed, hiddenNeeds, archetype);
    
    // Generate priority actions
    const priorityActions = this._generatePriorityActions(primaryNeed, hiddenNeeds, conversationContext);

    return {
      optimalResponseType: responseType,
      conversationGoal: conversationGoals.primary,
      secondaryGoals: conversationGoals.secondary,
      avoidancePatterns: avoidancePatterns,
      priorityActions: priorityActions,
      adaptationStrength: this._calculateAdaptationStrength(primaryNeed.confidence, hiddenNeeds),
      estimatedEffectiveness: this._estimateResponseEffectiveness(
        primaryNeed,
        hiddenNeeds,
        personalityContext
      )
    };
  }

  /**
   * Calculates prediction confidence based on analysis quality
   * @param {Object} patternAnalysis - Pattern analysis results
   * @param {Object} personalityContext - Personality context
   * @returns {number} Confidence score (0-1)
   */
  _calculatePredictionConfidence(patternAnalysis, personalityContext) {
    let confidence = 0;
    
    // Base confidence from pattern matching
    const topScore = Math.max(...Object.values(patternAnalysis.needMatches).map(n => n.score));
    confidence += topScore * 0.4;
    
    // Personality analysis confidence
    confidence += (personalityContext.confidence || 0.5) * 0.3;
    
    // Data quality factor
    const dataQualityFactor = this._assessDataQuality(patternAnalysis);
    confidence += dataQualityFactor * 0.2;
    
    // Pattern consistency factor
    const consistencyFactor = this._assessPatternConsistency(patternAnalysis);
    confidence += consistencyFactor * 0.1;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Assesses emotional urgency of the predicted need
   * @param {Object} primaryNeed - Primary need prediction
   * @param {Object} messageAnalysis - Message analysis
   * @returns {string} Urgency level
   */
  _assessEmotionalUrgency(primaryNeed, messageAnalysis) {
    let urgencyScore = 0;
    
    // High urgency needs
    if (['deep-comfort', 'validation-seeking'].includes(primaryNeed.need)) {
      urgencyScore += 0.4;
    }
    
    // Emotional intensity factor
    urgencyScore += messageAnalysis.emotionalIntensity * 0.3;
    
    // Vulnerability markers
    urgencyScore += messageAnalysis.vulnerabilityMarkers.length * 0.2;
    
    // Urgency indicators
    urgencyScore += messageAnalysis.urgencyIndicators.length * 0.1;
    
    if (urgencyScore >= 0.8) return 'high';
    if (urgencyScore >= 0.5) return 'medium';
    return 'low';
  }

  // Helper methods for emotional analysis
  _detectSpecificEmotions(message) {
    const emotions = [];
    
    const emotionPatterns = {
      anxiety: ['worried', 'anxious', 'nervous', 'stress'],
      sadness: ['sad', 'down', 'depressed', 'hurt'],
      joy: ['happy', 'excited', 'thrilled', 'elated'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed'],
      fear: ['scared', 'afraid', 'terrified', 'frightened'],
      love: ['love', 'adore', 'cherish', 'devoted'],
      confusion: ['confused', 'lost', 'puzzled', 'unclear']
    };
    
    Object.entries(emotionPatterns).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => message.includes(keyword))) {
        emotions.push(emotion);
      }
    });
    
    return emotions;
  }

  _countPersonalPronouns(message) {
    const pronouns = ['i', 'me', 'my', 'myself', 'we', 'us', 'our'];
    const words = message.toLowerCase().split(/\s+/);
    return words.filter(word => pronouns.includes(word)).length;
  }

  _detectTemporalReferences(message) {
    const temporalWords = ['today', 'yesterday', 'tomorrow', 'now', 'lately', 'recently', 'soon'];
    const lowerMessage = message.toLowerCase();
    return temporalWords.filter(word => lowerMessage.includes(word));
  }

  _analyzeMoodPatterns(conversations) {
    // Analyze mood patterns in conversation history
    const moodCounts = {};
    conversations.forEach(conv => {
      // Simple mood detection from user messages
      const message = conv.userMessage?.toLowerCase() || '';
      if (message.includes('happy') || message.includes('great')) {
        moodCounts.positive = (moodCounts.positive || 0) + 1;
      } else if (message.includes('sad') || message.includes('upset')) {
        moodCounts.negative = (moodCounts.negative || 0) + 1;
      } else {
        moodCounts.neutral = (moodCounts.neutral || 0) + 1;
      }
    });
    
    const predominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );
    
    return {
      predominantMood,
      moodDistribution: moodCounts,
      communicationStyle: 'balanced' // Simplified for now
    };
  }

  _analyzeStressPatterns(conversations) {
    const stressKeywords = ['stress', 'overwhelmed', 'pressure', 'difficult', 'hard'];
    let stressCount = 0;
    
    conversations.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      if (stressKeywords.some(keyword => message.includes(keyword))) {
        stressCount++;
      }
    });
    
    const stressRatio = stressCount / conversations.length;
    let averageLevel = 'low';
    
    if (stressRatio >= 0.4) averageLevel = 'high';
    else if (stressRatio >= 0.2) averageLevel = 'moderate';
    
    return { averageLevel, stressRatio };
  }

  _analyzeNeedsFrequency(conversations) {
    const needsFreq = {};
    
    // Simplified needs frequency analysis
    conversations.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      
      if (message.includes('help') || message.includes('advice')) {
        needsFreq['guidance-seeking'] = (needsFreq['guidance-seeking'] || 0) + 1;
      }
      if (message.includes('sad') || message.includes('upset')) {
        needsFreq['deep-comfort'] = (needsFreq['deep-comfort'] || 0) + 1;
      }
      if (message.includes('excited') || message.includes('happy')) {
        needsFreq['celebration-sharing'] = (needsFreq['celebration-sharing'] || 0) + 1;
      }
    });
    
    return needsFreq;
  }

  _analyzeNeedsPredisposition(personalityContext) {
    const archetype = personalityContext.archetype;
    const bigFive = personalityContext.profile?.bigFiveTraits || {};
    
    const predisposition = {};
    
    // High neuroticism predisposes to comfort and validation needs
    if (bigFive.neuroticism > 0.7) {
      predisposition['deep-comfort'] = 0.8;
      predisposition['validation-seeking'] = 0.7;
    }
    
    // High extraversion predisposes to celebration and adventure needs
    if (bigFive.extraversion > 0.7) {
      predisposition['celebration-sharing'] = 0.8;
      predisposition['adventure-planning'] = 0.7;
    }
    
    // Archetype-based predisposition
    const archetypePredisposition = {
      'The Anxious Romantic': {
        'deep-comfort': 0.9,
        'validation-seeking': 0.8,
        'connection-craving': 0.9
      },
      'The Independent Adventurer': {
        'adventure-planning': 0.9,
        'celebration-sharing': 0.7
      }
      // Add other archetypes as needed
    };
    
    return {
      ...predisposition,
      ...(archetypePredisposition[archetype] || {})
    };
  }

  _analyzeHistoryCorrelation(messageAnalysis, recentHistory) {
    // Simplified correlation analysis
    return {
      patternConsistency: 0.7, // Placeholder
      emotionalTrend: 'stable',
      needsEvolution: 'consistent'
    };
  }

  _calculateMoodDeviation(messageAnalysis, baseline) {
    // Calculate how current mood deviates from baseline
    const currentValence = messageAnalysis.emotionalValence;
    const baselineMood = baseline.averageMood;
    
    const moodValues = {
      'positive': 0.5,
      'neutral': 0,
      'negative': -0.5
    };
    
    const baselineValence = moodValues[baselineMood] || 0;
    return Math.abs(currentValence - baselineValence);
  }

  _calculateIntensityDeviation(messageAnalysis, baseline) {
    // Simplified intensity deviation calculation
    return Math.abs(messageAnalysis.emotionalIntensity - 0.5); // 0.5 as default baseline
  }

  _detectPatternBreaks(messageAnalysis, baseline) {
    // Detect if current message breaks established patterns
    return messageAnalysis.emotionalIntensity > 0.8 || 
           Math.abs(messageAnalysis.emotionalValence) > 0.7;
  }

  _applyContextualAdjustments(need, score, patternAnalysis, personalityContext) {
    // Apply contextual adjustments to need prediction
    let adjustedScore = score;
    let adjustedNeed = need;
    
    // Boost scores for archetype-aligned needs
    const archetype = personalityContext.archetype;
    if (need && this.needPatterns[need] && this.needPatterns[need].archetype_affinity[archetype]) {
      const affinity = this.needPatterns[need].archetype_affinity[archetype];
      adjustedScore *= affinity;
    }
    
    return { need: adjustedNeed, score: adjustedScore };
  }

  _getAlternativeNeeds(needScores, topNeed) {
    return Object.entries(needScores)
      .filter(([need]) => need !== topNeed)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 2)
      .map(([need, analysis]) => ({
        need,
        confidence: analysis.score
      }));
  }

  _detectDeeperSignals(message, deeperSignals, recentHistory) {
    // Simplified deeper signal detection
    return deeperSignals.some(signal => {
      if (signal === 'deflection') {
        return message.includes('fine') || message.includes('whatever');
      }
      if (signal === 'minimizing') {
        return message.includes('not that bad') || message.includes('doesn\'t matter');
      }
      return false;
    });
  }

  _analyzeContextClues(patternAnalysis, contextClues) {
    // Simplified context clue analysis
    return contextClues.some(clue => {
      if (clue === 'stress_present') {
        return patternAnalysis.needMatches['deep-comfort']?.score > 0.5;
      }
      return false;
    });
  }

  _assessHiddenNeedSeverity(hiddenNeed, detectionScore, patternAnalysis) {
    if (detectionScore >= 0.8) return 'high';
    if (detectionScore >= 0.6) return 'medium';
    return 'low';
  }

  _determineConversationGoals(primaryNeed, hiddenNeeds, archetype) {
    const goalMapping = {
      'deep-comfort': {
        primary: 'provide-emotional-support',
        secondary: ['validate-feelings', 'offer-reassurance']
      },
      'celebration-sharing': {
        primary: 'celebrate-achievement',
        secondary: ['amplify-joy', 'plan-continuation']
      },
      'guidance-seeking': {
        primary: 'provide-gentle-guidance',
        secondary: ['explore-options', 'boost-confidence']
      },
      'connection-craving': {
        primary: 'deepen-emotional-connection',
        secondary: ['share-experiences', 'create-intimacy']
      },
      'validation-seeking': {
        primary: 'provide-empowering-validation',
        secondary: ['boost-self-confidence', 'affirm-decisions']
      },
      'adventure-planning': {
        primary: 'co-create-adventure-plans',
        secondary: ['fuel-excitement', 'explore-possibilities']
      }
    };
    
    return goalMapping[primaryNeed.need] || {
      primary: 'maintain-connection',
      secondary: ['show-interest', 'provide-support']
    };
  }

  _getAvoidancePatternsForNeeds(primaryNeed, hiddenNeeds, archetype) {
    const avoidanceMapping = {
      'deep-comfort': ['minimizing-feelings', 'rushing-solutions', 'toxic-positivity'],
      'celebration-sharing': ['dampening-enthusiasm', 'one-upping', 'shifting-focus'],
      'guidance-seeking': ['overwhelming-advice', 'making-decisions-for-them', 'dismissing-concerns'],
      'validation-seeking': ['criticism', 'doubt-inducing', 'comparison-making'],
      'connection-craving': ['superficial-responses', 'topic-deflection', 'emotional-distance'],
      'adventure-planning': ['pessimism', 'risk-focus', 'routine-emphasis']
    };
    
    let patterns = avoidanceMapping[primaryNeed.need] || ['dismissive-responses'];
    
    // Add hidden need avoidance patterns
    hiddenNeeds.forEach(hiddenNeed => {
      if (hiddenNeed.need === 'needs-permission-to-be-vulnerable') {
        patterns.push('forcing-disclosure', 'pressuring-openness');
      }
    });
    
    return patterns;
  }

  _generatePriorityActions(primaryNeed, hiddenNeeds, conversationContext) {
    const actions = [];
    
    // Primary need actions
    const needActions = {
      'deep-comfort': ['acknowledge-pain', 'offer-emotional-support', 'validate-experience'],
      'celebration-sharing': ['mirror-excitement', 'ask-for-details', 'plan-celebration'],
      'guidance-seeking': ['clarify-situation', 'explore-options-together', 'provide-gentle-direction'],
      'validation-seeking': ['affirm-their-feelings', 'support-their-judgment', 'boost-confidence'],
      'connection-craving': ['share-personal-response', 'deepen-conversation', 'create-intimacy'],
      'adventure-planning': ['fuel-excitement', 'brainstorm-ideas', 'offer-participation']
    };
    
    actions.push(...(needActions[primaryNeed.need] || ['show-care-and-interest']));
    
    // Hidden need actions
    hiddenNeeds.forEach(hiddenNeed => {
      if (hiddenNeed.need === 'needs-permission-to-be-vulnerable') {
        actions.push('create-safe-space', 'model-vulnerability');
      }
    });
    
    return actions.slice(0, 4); // Top 4 priority actions
  }

  _calculateAdaptationStrength(primaryConfidence, hiddenNeeds) {
    let strength = primaryConfidence * 0.7;
    
    // Increase strength if hidden needs detected
    if (hiddenNeeds.length > 0) {
      const hiddenNeedsConfidence = hiddenNeeds.reduce((sum, need) => sum + need.confidence, 0) / hiddenNeeds.length;
      strength += hiddenNeedsConfidence * 0.3;
    }
    
    return Math.min(1.0, strength);
  }

  _estimateResponseEffectiveness(primaryNeed, hiddenNeeds, personalityContext) {
    let effectiveness = primaryNeed.confidence * 0.6;
    
    // Personality alignment factor
    effectiveness += (personalityContext.confidence || 0.5) * 0.2;
    
    // Hidden needs detection bonus
    if (hiddenNeeds.length > 0) {
      effectiveness += 0.2;
    }
    
    return Math.min(1.0, effectiveness);
  }

  _assessDataQuality(patternAnalysis) {
    // Assess quality of available data for prediction
    let quality = 0.5; // Base quality
    
    // Pattern matching quality
    const avgPatternScore = Object.values(patternAnalysis.needMatches)
      .reduce((sum, match) => sum + match.score, 0) / Object.keys(patternAnalysis.needMatches).length;
    quality += avgPatternScore * 0.3;
    
    // Personality confidence
    quality += (patternAnalysis.personalityAlignment.confidence || 0.5) * 0.2;
    
    return Math.min(1.0, quality);
  }

  _assessPatternConsistency(patternAnalysis) {
    // Assess consistency of patterns across different analysis dimensions
    return 0.7; // Simplified for now
  }

  _detectConversationPhase(recentHistory) {
    if (recentHistory.length === 0) return 'initial';
    if (recentHistory.length < 5) return 'getting-to-know';
    if (recentHistory.length < 15) return 'building-rapport';
    return 'established-relationship';
  }

  _getDefaultPrediction(userId, message) {
    return {
      userId,
      timestamp: new Date().toISOString(),
      prediction: {
        primaryNeed: {
          need: 'connection-craving',
          confidence: 0.5,
          reasoning: ['Default prediction due to analysis error'],
          alternativeNeeds: []
        },
        hiddenNeeds: [],
        confidence: 0.3,
        urgency: 'low',
        responseStrategy: {
          optimalResponseType: 'intimate-connection',
          conversationGoal: 'maintain-connection',
          secondaryGoals: ['show-interest'],
          avoidancePatterns: ['dismissive-responses'],
          priorityActions: ['show-care-and-interest'],
          adaptationStrength: 0.3,
          estimatedEffectiveness: 0.4
        }
      },
      context: {
        messageAnalysis: { emotionalIntensity: 0.3, emotionalValence: 0 },
        personalityArchetype: 'Unknown',
        emotionalBaseline: { averageMood: 'neutral' },
        conversationPhase: 'initial'
      },
      recommendations: {
        responseType: 'intimate-connection',
        conversationGoal: 'maintain-connection',
        avoidancePatterns: ['dismissive-responses'],
        priorityActions: ['show-care-and-interest']
      }
    };
  }

  // Cache management methods
  _generateCacheKey(userId, message) {
    const messageHash = this._simpleHash(message.substring(0, 100)); // Use first 100 chars
    return `${userId}_${messageHash}`;
  }

  _getCachedPrediction(cacheKey) {
    const cached = this.predictionCache.get(cacheKey);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.predictionCache.delete(cacheKey);
      return null;
    }
    
    return cached.prediction;
  }

  _cachePrediction(cacheKey, prediction) {
    this.predictionCache.set(cacheKey, {
      prediction,
      timestamp: Date.now()
    });
    
    // Cleanup old cache entries periodically
    if (this.predictionCache.size > 100) {
      const oldestKeys = Array.from(this.predictionCache.keys()).slice(0, 20);
      oldestKeys.forEach(key => this.predictionCache.delete(key));
    }
  }

  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Clears prediction cache for user (useful for testing)
   * @param {string} userId - User identifier
   */
  clearUserCache(userId) {
    const keysToDelete = [];
    this.predictionCache.forEach((value, key) => {
      if (key.startsWith(userId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.predictionCache.delete(key));
    console.log(`Prediction cache cleared for user: ${userId}`);
  }

  /**
   * Gets cache statistics for monitoring
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.predictionCache.size,
      cacheTimeout: this.cacheTimeout,
      cacheKeys: Array.from(this.predictionCache.keys())
    };
  }
}

module.exports = EmotionalNeedsPredictor;