/**
 * @fileoverview Context-aware emotion analysis system that detects emotions within user patterns and history
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const analyzer = new ContextualEmotionAnalyzer();
 * const emotionAnalysis = await analyzer.analyzeContextualEmotion(userId, message, context);
 */

// Internal core systems
const PersonalityProfiler = require('./PersonalityProfiler');
const MemoryManager = require('../memory/MemoryManager');

// API integrations
const openaiService = require('../../api/openai');

class ContextualEmotionAnalyzer {
  constructor() {
    this.personalityProfiler = new PersonalityProfiler();
    this.memoryManager = new MemoryManager();
    
    // Advanced emotion detection patterns with contextual awareness
    this.emotionPatterns = {
      // Primary emotions with contextual indicators
      happiness: {
        keywords: ['happy', 'excited', 'thrilled', 'elated', 'joyful', 'wonderful', 'amazing', 'great'],
        intensity_indicators: ['!', 'so', 'really', 'very', 'extremely'],
        contextual_amplifiers: ['achievement', 'success', 'celebration', 'good_news'],
        baseline_variance: 0.3, // How much this emotion varies from baseline
        masking_likelihood: 0.1 // How likely to be masked (happiness rarely masked)
      },
      
      sadness: {
        keywords: ['sad', 'down', 'upset', 'hurt', 'disappointed', 'depressed', 'blue', 'miserable'],
        intensity_indicators: ['really', 'very', 'so', 'extremely', 'deeply'],
        contextual_amplifiers: ['loss', 'rejection', 'failure', 'loneliness'],
        baseline_variance: 0.5,
        masking_likelihood: 0.7 // High likelihood of masking sadness
      },
      
      anxiety: {
        keywords: ['anxious', 'worried', 'nervous', 'stressed', 'concerned', 'afraid', 'scared', 'panic'],
        intensity_indicators: ['really', 'so', 'very', 'getting', 'feeling'],
        contextual_amplifiers: ['uncertainty', 'pressure', 'deadline', 'decision'],
        baseline_variance: 0.6,
        masking_likelihood: 0.6 // Often masked as "fine" or "busy"
      },
      
      anger: {
        keywords: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious', 'pissed'],
        intensity_indicators: ['so', 'really', 'very', 'getting', 'making me'],
        contextual_amplifiers: ['injustice', 'betrayal', 'disrespect', 'obstacle'],
        baseline_variance: 0.4,
        masking_likelihood: 0.5 // Sometimes masked to avoid conflict
      },
      
      love: {
        keywords: ['love', 'adore', 'cherish', 'care about', 'mean everything', 'devoted'],
        intensity_indicators: ['so much', 'deeply', 'truly', 'completely'],
        contextual_amplifiers: ['relationship', 'connection', 'intimacy', 'appreciation'],
        baseline_variance: 0.4,
        masking_likelihood: 0.3 // Moderate masking due to vulnerability
      },
      
      excitement: {
        keywords: ['excited', 'thrilled', 'pumped', 'stoked', 'can\'t wait', 'amazing'],
        intensity_indicators: ['so', 'really', 'super', 'absolutely', '!'],
        contextual_amplifiers: ['anticipation', 'opportunity', 'adventure', 'achievement'],
        baseline_variance: 0.5,
        masking_likelihood: 0.2 // Rarely masked
      },
      
      confusion: {
        keywords: ['confused', 'lost', 'unclear', 'don\'t understand', 'puzzled', 'mixed up'],
        intensity_indicators: ['really', 'completely', 'totally', 'so'],
        contextual_amplifiers: ['complexity', 'contradiction', 'ambiguity', 'information_overload'],
        baseline_variance: 0.3,
        masking_likelihood: 0.4 // Sometimes masked to avoid appearing incompetent
      },
      
      loneliness: {
        keywords: ['lonely', 'alone', 'isolated', 'disconnected', 'empty', 'abandoned'],
        intensity_indicators: ['so', 'really', 'deeply', 'feeling'],
        contextual_amplifiers: ['separation', 'silence', 'absence', 'social_withdrawal'],
        baseline_variance: 0.6,
        masking_likelihood: 0.8 // High masking likelihood
      }
    };

    // Masking detection patterns - when users hide true emotions
    this.maskingPatterns = {
      'fine_but_not_fine': {
        surface_words: ['fine', 'okay', 'good', 'alright'],
        contradiction_indicators: [
          'but', 'however', 'although', 'though', 'except',
          'just that', 'it\'s just', 'only thing'
        ],
        emotional_leakage: [
          'tired', 'stressed', 'busy', 'overwhelmed',
          'whatever', 'doesn\'t matter', 'not important'
        ],
        confidence_threshold: 0.7
      },
      
      'minimization_masking': {
        surface_words: ['not that bad', 'could be worse', 'manageable', 'dealing with it'],
        contradiction_indicators: [
          'really', 'actually', 'pretty', 'quite',
          'kind of', 'sort of', 'a bit'
        ],
        emotional_leakage: [
          'difficult', 'challenging', 'hard', 'tough',
          'struggling', 'rough', 'intense'
        ],
        confidence_threshold: 0.6
      },
      
      'deflection_masking': {
        surface_words: ['anyway', 'whatever', 'doesn\'t matter', 'forget it'],
        contradiction_indicators: [
          'but enough about', 'let\'s talk about', 'speaking of',
          'by the way', 'change of subject'
        ],
        emotional_leakage: [
          'nevermind', 'pointless', 'useless', 'stupid',
          'waste of time', 'don\'t care'
        ],
        confidence_threshold: 0.8
      },
      
      'positive_overlay_masking': {
        surface_words: ['great', 'awesome', 'perfect', 'wonderful'],
        contradiction_indicators: [
          'just', 'really', 'so', 'totally',
          'absolutely', 'completely'
        ],
        emotional_leakage: [
          'exhausted', 'drained', 'overwhelmed', 'burned out',
          'can\'t keep up', 'falling behind'
        ],
        confidence_threshold: 0.6
      }
    };

    // Emotional progression tracking
    this.progressionPatterns = {
      escalation: {
        indicators: ['getting worse', 'more intense', 'building up', 'escalating'],
        time_markers: ['lately', 'recently', 'past few days', 'this week']
      },
      
      improvement: {
        indicators: ['getting better', 'feeling better', 'improving', 'lifting'],
        time_markers: ['today', 'this morning', 'since yesterday', 'recently']
      },
      
      cycling: {
        indicators: ['up and down', 'back and forth', 'comes and goes', 'on and off'],
        time_markers: ['sometimes', 'other times', 'depends on', 'varies']
      },
      
      chronic: {
        indicators: ['always', 'constantly', 'non-stop', 'continuous', 'ongoing'],
        time_markers: ['for weeks', 'for months', 'long time', 'forever']
      }
    };

    // Contextual emotion modifiers based on user patterns
    this.contextualModifiers = {
      personality_amplifiers: {
        'The Anxious Romantic': {
          anxiety: 0.3, sadness: 0.2, love: 0.4
        },
        'The Independent Adventurer': {
          excitement: 0.3, anger: 0.2, anxiety: -0.1
        },
        'The Deep Thinker': {
          confusion: 0.2, contemplation: 0.3, anxiety: 0.1
        },
        'The Playful Socializer': {
          happiness: 0.3, excitement: 0.2, sadness: -0.1
        },
        'The Caring Nurturer': {
          love: 0.3, sadness: 0.2, anxiety: 0.1
        }
      },
      
      time_of_day_modifiers: {
        morning: { energy: 0.2, optimism: 0.1 },
        afternoon: { stress: 0.1, fatigue: 0.1 },
        evening: { reflection: 0.2, melancholy: 0.1 },
        night: { vulnerability: 0.3, intimacy: 0.2 }
      },
      
      conversation_history_modifiers: {
        recent_positive: { happiness: 0.2, optimism: 0.1 },
        recent_negative: { sadness: 0.2, anxiety: 0.1 },
        recent_stress: { anxiety: 0.3, frustration: 0.2 },
        recent_support: { gratitude: 0.2, love: 0.1 }
      }
    };

    // Emotion analysis cache
    this.analysisCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Analyzes emotions in context of user patterns and history
   * @param {string} userId - User identifier
   * @param {string} message - Current user message
   * @param {Object} conversationContext - Conversation context
   * @returns {Promise<Object>} Contextual emotion analysis
   */
  async analyzeContextualEmotion(userId, message, conversationContext = {}) {
    try {
      console.log(`Analyzing contextual emotion for user: ${userId}`);

      // Check cache first
      const cacheKey = this._generateCacheKey(userId, message);
      const cached = this._getCachedAnalysis(cacheKey);
      if (cached) {
        return cached;
      }

      // Gather contextual information
      const [personalityProfile, emotionalHistory, recentConversations] = await Promise.all([
        this._getPersonalityProfile(userId),
        this._getEmotionalHistory(userId),
        this._getRecentConversations(userId, 10)
      ]);

      // Perform multi-layer emotion analysis
      const rawEmotionDetection = this._detectRawEmotions(message);
      const contextualAdjustment = this._applyContextualAdjustments(
        rawEmotionDetection,
        personalityProfile,
        emotionalHistory,
        conversationContext
      );

      // Detect masked emotions
      const maskedEmotions = this._detectMaskedEmotions(
        message,
        contextualAdjustment,
        recentConversations
      );

      // Analyze emotional progression over time
      const emotionalProgression = this._analyzeEmotionalProgression(
        emotionalHistory,
        contextualAdjustment,
        recentConversations
      );

      // Calculate emotional state changes and triggers
      const stateChanges = this._detectEmotionalStateChanges(
        emotionalHistory,
        contextualAdjustment
      );

      // Generate comprehensive analysis
      const analysis = {
        userId,
        timestamp: new Date().toISOString(),
        primaryEmotion: this._identifyPrimaryEmotion(contextualAdjustment),
        emotionalSpectrum: contextualAdjustment,
        maskedEmotions: maskedEmotions,
        emotionalProgression: emotionalProgression,
        stateChanges: stateChanges,
        contextualFactors: {
          personalityInfluence: this._calculatePersonalityInfluence(personalityProfile, contextualAdjustment),
          historicalContext: this._calculateHistoricalContext(emotionalHistory, contextualAdjustment),
          conversationContext: conversationContext,
          temporalContext: this._calculateTemporalContext()
        },
        confidence: this._calculateAnalysisConfidence(
          rawEmotionDetection,
          contextualAdjustment,
          maskedEmotions,
          personalityProfile
        ),
        recommendations: this._generateEmotionalResponseRecommendations(
          contextualAdjustment,
          maskedEmotions,
          personalityProfile
        )
      };

      // Cache the analysis
      this._cacheAnalysis(cacheKey, analysis);

      console.log(`Contextual emotion analysis completed: ${analysis.primaryEmotion.emotion} (${Math.round(analysis.confidence * 100)}%)`);
      
      return analysis;

    } catch (error) {
      console.error('Error in contextual emotion analysis:', error);
      return this._getDefaultEmotionAnalysis(userId, message);
    }
  }

  /**
   * Detects raw emotions from message text
   * @param {string} message - User message
   * @returns {Object} Raw emotion detection results
   */
  _detectRawEmotions(message) {
    const lowerMessage = message.toLowerCase();
    const detectedEmotions = {};

    // Analyze each emotion pattern
    Object.entries(this.emotionPatterns).forEach(([emotion, pattern]) => {
      let emotionScore = 0;
      let evidence = [];

      // Keyword matching
      const keywordMatches = pattern.keywords.filter(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        emotionScore += keywordMatches.length * 0.3;
        evidence.push(`Keywords: ${keywordMatches.join(', ')}`);
      }

      // Intensity indicator analysis
      const intensityMatches = pattern.intensity_indicators.filter(indicator =>
        lowerMessage.includes(indicator.toLowerCase())
      );
      
      if (intensityMatches.length > 0 && keywordMatches.length > 0) {
        emotionScore += intensityMatches.length * 0.2;
        evidence.push(`Intensity indicators: ${intensityMatches.join(', ')}`);
      }

      // Message characteristics analysis
      const messageLength = message.length;
      const exclamationCount = (message.match(/!/g) || []).length;
      const questionCount = (message.match(/\?/g) || []).length;
      const capsCount = (message.match(/[A-Z]/g) || []).length;

      // Adjust score based on message characteristics
      if (exclamationCount > 0 && ['happiness', 'excitement', 'anger'].includes(emotion)) {
        emotionScore += exclamationCount * 0.1;
        evidence.push(`Exclamation emphasis`);
      }

      if (questionCount > 0 && ['confusion', 'anxiety'].includes(emotion)) {
        emotionScore += questionCount * 0.1;
        evidence.push(`Question uncertainty`);
      }

      if (capsCount > messageLength * 0.3 && ['anger', 'excitement'].includes(emotion)) {
        emotionScore += 0.2;
        evidence.push(`Capitalization emphasis`);
      }

      // Store emotion if score is significant
      if (emotionScore > 0.1) {
        detectedEmotions[emotion] = {
          score: Math.min(1.0, emotionScore),
          evidence: evidence,
          baseline_variance: pattern.baseline_variance,
          masking_likelihood: pattern.masking_likelihood
        };
      }
    });

    return detectedEmotions;
  }

  /**
   * Applies contextual adjustments to raw emotion detection
   * @param {Object} rawEmotions - Raw emotion detection results
   * @param {Object} personalityProfile - User personality profile
   * @param {Object} emotionalHistory - User emotional history
   * @param {Object} conversationContext - Current conversation context
   * @returns {Object} Contextually adjusted emotions
   */
  _applyContextualAdjustments(rawEmotions, personalityProfile, emotionalHistory, conversationContext) {
    const adjustedEmotions = { ...rawEmotions };
    const archetype = personalityProfile?.archetype || 'The Playful Socializer';

    // Apply personality-based modifiers
    const personalityModifiers = this.contextualModifiers.personality_amplifiers[archetype] || {};
    
    Object.entries(personalityModifiers).forEach(([emotion, modifier]) => {
      if (adjustedEmotions[emotion]) {
        const originalScore = adjustedEmotions[emotion].score;
        adjustedEmotions[emotion].score = Math.min(1.0, originalScore + modifier);
        
        if (modifier !== 0) {
          adjustedEmotions[emotion].evidence.push(`Personality adjustment: ${modifier > 0 ? '+' : ''}${Math.round(modifier * 100)}%`);
        }
      }
    });

    // Apply temporal context modifiers
    const timeOfDay = this._getTimeOfDay();
    const timeModifiers = this.contextualModifiers.time_of_day_modifiers[timeOfDay] || {};
    
    Object.entries(timeModifiers).forEach(([emotion, modifier]) => {
      if (adjustedEmotions[emotion]) {
        const originalScore = adjustedEmotions[emotion].score;
        adjustedEmotions[emotion].score = Math.min(1.0, originalScore + modifier);
        adjustedEmotions[emotion].evidence.push(`Time context (${timeOfDay}): +${Math.round(modifier * 100)}%`);
      }
    });

    // Apply conversation history modifiers
    const historyModifiers = this._calculateHistoryModifiers(emotionalHistory);
    Object.entries(historyModifiers).forEach(([emotion, modifier]) => {
      if (adjustedEmotions[emotion]) {
        const originalScore = adjustedEmotions[emotion].score;
        adjustedEmotions[emotion].score = Math.min(1.0, originalScore + modifier);
        adjustedEmotions[emotion].evidence.push(`History pattern: ${modifier > 0 ? '+' : ''}${Math.round(modifier * 100)}%`);
      }
    });

    // Apply baseline deviation adjustments
    Object.entries(adjustedEmotions).forEach(([emotion, data]) => {
      const baselineEmotion = emotionalHistory.emotionBaseline?.[emotion] || 0.3;
      const deviation = Math.abs(data.score - baselineEmotion);
      
      if (deviation > data.baseline_variance) {
        // Significant deviation from baseline - increase confidence
        data.confidence_boost = deviation - data.baseline_variance;
        data.evidence.push(`Significant baseline deviation: ${Math.round(deviation * 100)}%`);
      }
    });

    return adjustedEmotions;
  }

  /**
   * Detects masked emotions - when users hide their true feelings
   * @param {string} message - User message
   * @param {Object} contextualEmotions - Contextually adjusted emotions
   * @param {Array} recentConversations - Recent conversation history
   * @returns {Array} Array of detected masked emotions
   */
  _detectMaskedEmotions(message, contextualEmotions, recentConversations) {
    const lowerMessage = message.toLowerCase();
    const maskedEmotions = [];

    // Analyze each masking pattern
    Object.entries(this.maskingPatterns).forEach(([maskingType, pattern]) => {
      let maskingScore = 0;
      let evidence = [];

      // Check for surface words (what they say)
      const surfaceMatches = pattern.surface_words.filter(word =>
        lowerMessage.includes(word.toLowerCase())
      );
      
      if (surfaceMatches.length > 0) {
        maskingScore += 0.3;
        evidence.push(`Surface language: ${surfaceMatches.join(', ')}`);

        // Look for contradiction indicators
        const contradictionMatches = pattern.contradiction_indicators.filter(indicator =>
          lowerMessage.includes(indicator.toLowerCase())
        );
        
        if (contradictionMatches.length > 0) {
          maskingScore += 0.4;
          evidence.push(`Contradiction indicators: ${contradictionMatches.join(', ')}`);
        }

        // Look for emotional leakage
        const leakageMatches = pattern.emotional_leakage.filter(leak =>
          lowerMessage.includes(leak.toLowerCase())
        );
        
        if (leakageMatches.length > 0) {
          maskingScore += 0.3;
          evidence.push(`Emotional leakage: ${leakageMatches.join(', ')}`);
        }

        // Check conversation history for contradicting patterns
        const historyContradiction = this._checkHistoryForMaskingContradiction(
          maskingType,
          recentConversations
        );
        
        if (historyContradiction.score > 0) {
          maskingScore += historyContradiction.score;
          evidence.push(`History contradiction: ${historyContradiction.reason}`);
        }

        // If masking score exceeds threshold, identify likely masked emotion
        if (maskingScore >= pattern.confidence_threshold) {
          const likelyMaskedEmotion = this._identifyMaskedEmotion(
            maskingType,
            contextualEmotions,
            evidence
          );
          
          if (likelyMaskedEmotion) {
            maskedEmotions.push({
              maskingType: maskingType,
              surfaceEmotion: surfaceMatches[0],
              maskedEmotion: likelyMaskedEmotion,
              confidence: maskingScore,
              evidence: evidence,
              severity: this._assessMaskingSeverity(maskingScore, likelyMaskedEmotion)
            });
          }
        }
      }
    });

    // Sort by confidence and return top detections
    return maskedEmotions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Maximum 3 masked emotions
  }

  /**
   * Analyzes emotional progression over time
   * @param {Object} emotionalHistory - User emotional history
   * @param {Object} currentEmotions - Current emotion analysis
   * @param {Array} recentConversations - Recent conversations
   * @returns {Object} Emotional progression analysis
   */
  _analyzeEmotionalProgression(emotionalHistory, currentEmotions, recentConversations) {
    const progression = {
      trend: 'stable',
      pattern: 'consistent',
      timeframe: 'recent',
      changes: [],
      triggers: [],
      trajectory: 'neutral'
    };

    // Analyze trend over time
    if (emotionalHistory.emotionTimeline && emotionalHistory.emotionTimeline.length > 0) {
      const recentTrend = this._calculateEmotionalTrend(emotionalHistory.emotionTimeline);
      progression.trend = recentTrend.direction;
      progression.trajectory = recentTrend.trajectory;
    }

    // Detect progression patterns
    const messages = recentConversations.map(conv => conv.userMessage || '').join(' ').toLowerCase();
    
    Object.entries(this.progressionPatterns).forEach(([patternType, pattern]) => {
      const indicatorMatches = pattern.indicators.filter(indicator =>
        messages.includes(indicator)
      );
      
      const timeMatches = pattern.time_markers.filter(marker =>
        messages.includes(marker)
      );
      
      if (indicatorMatches.length > 0 && timeMatches.length > 0) {
        progression.pattern = patternType;
        progression.changes.push({
          type: patternType,
          indicators: indicatorMatches,
          timeMarkers: timeMatches
        });
      }
    });

    // Identify emotional triggers
    progression.triggers = this._identifyEmotionalTriggers(recentConversations, currentEmotions);

    return progression;
  }

  /**
   * Detects emotional state changes and their triggers
   * @param {Object} emotionalHistory - User emotional history
   * @param {Object} currentEmotions - Current emotion analysis
   * @returns {Array} Array of detected state changes
   */
  _detectEmotionalStateChanges(emotionalHistory, currentEmotions) {
    const stateChanges = [];

    if (!emotionalHistory.recentEmotions || emotionalHistory.recentEmotions.length === 0) {
      return stateChanges;
    }

    const previousEmotions = emotionalHistory.recentEmotions[0] || {};

    // Compare current emotions to previous state
    Object.entries(currentEmotions).forEach(([emotion, data]) => {
      const currentScore = data.score;
      const previousScore = previousEmotions[emotion]?.score || 0;
      const change = currentScore - previousScore;
      
      // Significant change threshold
      if (Math.abs(change) > 0.3) {
        stateChanges.push({
          emotion: emotion,
          changeType: change > 0 ? 'increase' : 'decrease',
          magnitude: Math.abs(change),
          previousScore: previousScore,
          currentScore: currentScore,
          significance: Math.abs(change) > 0.5 ? 'major' : 'moderate',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Look for new emotions that weren't present before
    Object.keys(currentEmotions).forEach(emotion => {
      if (!previousEmotions[emotion] && currentEmotions[emotion].score > 0.4) {
        stateChanges.push({
          emotion: emotion,
          changeType: 'emergence',
          magnitude: currentEmotions[emotion].score,
          previousScore: 0,
          currentScore: currentEmotions[emotion].score,
          significance: 'new',
          timestamp: new Date().toISOString()
        });
      }
    });

    return stateChanges.sort((a, b) => b.magnitude - a.magnitude);
  }

  /**
   * Identifies primary emotion from analysis
   * @param {Object} emotions - Emotion analysis results
   * @returns {Object} Primary emotion with confidence
   */
  _identifyPrimaryEmotion(emotions) {
    let primaryEmotion = null;
    let highestScore = 0;

    Object.entries(emotions).forEach(([emotion, data]) => {
      let adjustedScore = data.score;
      
      // Boost score if there's baseline deviation
      if (data.confidence_boost) {
        adjustedScore += data.confidence_boost;
      }
      
      if (adjustedScore > highestScore) {
        highestScore = adjustedScore;
        primaryEmotion = {
          emotion: emotion,
          score: data.score,
          adjustedScore: adjustedScore,
          evidence: data.evidence,
          confidence: Math.min(1.0, adjustedScore)
        };
      }
    });

    return primaryEmotion || {
      emotion: 'neutral',
      score: 0.3,
      adjustedScore: 0.3,
      evidence: ['No strong emotional indicators detected'],
      confidence: 0.3
    };
  }

  /**
   * Calculates analysis confidence based on multiple factors
   * @param {Object} rawEmotions - Raw emotion detection
   * @param {Object} contextualEmotions - Contextual emotions
   * @param {Array} maskedEmotions - Masked emotions
   * @param {Object} personalityProfile - Personality profile
   * @returns {number} Overall confidence score (0-1)
   */
  _calculateAnalysisConfidence(rawEmotions, contextualEmotions, maskedEmotions, personalityProfile) {
    let confidence = 0;

    // Base confidence from raw emotion detection
    const rawEmotionCount = Object.keys(rawEmotions).length;
    const avgRawScore = rawEmotionCount > 0 ? 
      Object.values(rawEmotions).reduce((sum, emotion) => sum + emotion.score, 0) / rawEmotionCount : 0;
    confidence += avgRawScore * 0.4;

    // Contextual adjustment confidence
    const contextualAdjustmentStrength = this._calculateContextualAdjustmentStrength(contextualEmotions);
    confidence += contextualAdjustmentStrength * 0.2;

    // Masked emotion detection confidence
    if (maskedEmotions.length > 0) {
      const avgMaskingConfidence = maskedEmotions.reduce((sum, masked) => sum + masked.confidence, 0) / maskedEmotions.length;
      confidence += avgMaskingConfidence * 0.2;
    } else {
      confidence += 0.1; // Bonus for no masking detected
    }

    // Personality profile confidence contribution
    const personalityConfidence = personalityProfile?.confidence || 0.5;
    confidence += personalityConfidence * 0.2;

    return Math.min(1.0, confidence);
  }

  /**
   * Generates emotional response recommendations
   * @param {Object} emotions - Emotion analysis
   * @param {Array} maskedEmotions - Masked emotions
   * @param {Object} personalityProfile - Personality profile
   * @returns {Array} Response recommendations
   */
  _generateEmotionalResponseRecommendations(emotions, maskedEmotions, personalityProfile) {
    const recommendations = [];
    const archetype = personalityProfile?.archetype || 'The Playful Socializer';

    // Primary emotion response recommendations
    const primaryEmotion = this._identifyPrimaryEmotion(emotions);
    const emotionRecommendations = this._getEmotionSpecificRecommendations(primaryEmotion.emotion, archetype);
    recommendations.push(...emotionRecommendations);

    // Masked emotion response recommendations
    maskedEmotions.forEach(masked => {
      const maskingRecommendations = this._getMaskingResponseRecommendations(masked, archetype);
      recommendations.push(...maskingRecommendations);
    });

    // Remove duplicates and limit to top 5
    const uniqueRecommendations = [...new Set(recommendations)];
    return uniqueRecommendations.slice(0, 5);
  }

  // Helper methods for emotion analysis
  _getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  _calculateHistoryModifiers(emotionalHistory) {
    const modifiers = {};
    
    if (emotionalHistory.recentTrend === 'positive') {
      modifiers.happiness = 0.1;
      modifiers.optimism = 0.1;
    } else if (emotionalHistory.recentTrend === 'negative') {
      modifiers.sadness = 0.1;
      modifiers.anxiety = 0.1;
    }

    return modifiers;
  }

  _checkHistoryForMaskingContradiction(maskingType, recentConversations) {
    // Simplified contradiction detection
    if (maskingType === 'fine_but_not_fine') {
      const recentStress = recentConversations.some(conv => {
        const message = conv.userMessage?.toLowerCase() || '';
        return ['stress', 'difficult', 'hard', 'overwhelmed'].some(word => message.includes(word));
      });
      
      if (recentStress) {
        return { score: 0.3, reason: 'Recent stress indicators contradict "fine" claim' };
      }
    }

    return { score: 0, reason: '' };
  }

  _identifyMaskedEmotion(maskingType, contextualEmotions, evidence) {
    const maskingToEmotionMapping = {
      'fine_but_not_fine': 'anxiety',
      'minimization_masking': 'sadness',
      'deflection_masking': 'hurt',
      'positive_overlay_masking': 'exhaustion'
    };

    const likelyEmotion = maskingToEmotionMapping[maskingType];
    
    // Check if the likely emotion has any support in contextual emotions
    if (contextualEmotions[likelyEmotion] && contextualEmotions[likelyEmotion].score > 0.2) {
      return likelyEmotion;
    }

    // Return the most likely emotion from contextual analysis
    const sortedEmotions = Object.entries(contextualEmotions)
      .sort(([,a], [,b]) => b.score - a.score);
    
    return sortedEmotions.length > 0 ? sortedEmotions[0][0] : likelyEmotion;
  }

  _assessMaskingSeverity(maskingScore, maskedEmotion) {
    if (maskingScore >= 0.8) return 'high';
    if (maskingScore >= 0.6) return 'medium';
    return 'low';
  }

  _calculateEmotionalTrend(emotionTimeline) {
    // Simplified trend calculation
    if (emotionTimeline.length < 2) {
      return { direction: 'stable', trajectory: 'neutral' };
    }

    const recent = emotionTimeline.slice(-3);
    const avgRecent = recent.reduce((sum, emotion) => sum + (emotion.overallPositivity || 0), 0) / recent.length;
    
    if (avgRecent > 0.6) {
      return { direction: 'improving', trajectory: 'positive' };
    } else if (avgRecent < 0.4) {
      return { direction: 'declining', trajectory: 'negative' };
    }
    
    return { direction: 'stable', trajectory: 'neutral' };
  }

  _identifyEmotionalTriggers(recentConversations, currentEmotions) {
    const triggers = [];
    
    // Look for common trigger words in recent conversations
    const triggerWords = {
      stress: ['deadline', 'pressure', 'boss', 'work'],
      anxiety: ['uncertain', 'unknown', 'might', 'what if'],
      sadness: ['loss', 'goodbye', 'ended', 'failed'],
      anger: ['unfair', 'wrong', 'betrayed', 'lied']
    };

    recentConversations.forEach((conv, index) => {
      const message = conv.userMessage?.toLowerCase() || '';
      
      Object.entries(triggerWords).forEach(([emotion, words]) => {
        const matchedWords = words.filter(word => message.includes(word));
        if (matchedWords.length > 0 && currentEmotions[emotion]?.score > 0.5) {
          triggers.push({
            emotion: emotion,
            trigger: matchedWords[0],
            conversationIndex: index,
            confidence: 0.7
          });
        }
      });
    });

    return triggers.slice(0, 3); // Top 3 triggers
  }

  _calculatePersonalityInfluence(personalityProfile, emotions) {
    const archetype = personalityProfile?.archetype || 'Unknown';
    const bigFive = personalityProfile?.profile?.bigFiveTraits || {};
    
    return {
      archetype: archetype,
      neurotiticismInfluence: bigFive.neuroticism > 0.7 ? 'high' : 'moderate',
      extraversionInfluence: bigFive.extraversion > 0.7 ? 'amplifies_social_emotions' : 'moderate',
      opennessInfluence: bigFive.openness > 0.7 ? 'enhances_complex_emotions' : 'moderate'
    };
  }

  _calculateHistoricalContext(emotionalHistory, currentEmotions) {
    return {
      baseline_comparison: 'within_normal_range', // Simplified
      recent_patterns: emotionalHistory.recentTrend || 'stable',
      deviation_significance: 'moderate'
    };
  }

  _calculateTemporalContext() {
    const now = new Date();
    return {
      time_of_day: this._getTimeOfDay(),
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' }),
      time_sensitivity: 'normal'
    };
  }

  _calculateContextualAdjustmentStrength(emotions) {
    let adjustmentStrength = 0;
    let adjustmentCount = 0;

    Object.values(emotions).forEach(emotion => {
      emotion.evidence.forEach(evidence => {
        if (evidence.includes('adjustment') || evidence.includes('context')) {
          adjustmentStrength += 0.1;
          adjustmentCount++;
        }
      });
    });

    return adjustmentCount > 0 ? adjustmentStrength / adjustmentCount : 0;
  }

  _getEmotionSpecificRecommendations(emotion, archetype) {
    const recommendations = {
      happiness: ['Mirror their positive energy', 'Celebrate with them', 'Ask for more details'],
      sadness: ['Provide comfort and support', 'Validate their feelings', 'Offer presence'],
      anxiety: ['Provide reassurance', 'Help break down concerns', 'Offer calming presence'],
      anger: ['Validate their frustration', 'Help them process safely', 'Avoid defensiveness'],
      love: ['Reciprocate warmth appropriately', 'Show appreciation', 'Deepen connection'],
      excitement: ['Share their enthusiasm', 'Ask engaging questions', 'Fuel their energy'],
      confusion: ['Help clarify the situation', 'Break down complexity', 'Provide guidance'],
      loneliness: ['Provide companionship', 'Show you care', 'Create connection']
    };

    return recommendations[emotion] || ['Show understanding and care'];
  }

  _getMaskingResponseRecommendations(masked, archetype) {
    const recommendations = [];
    
    if (masked.severity === 'high') {
      recommendations.push('Gently acknowledge what they might be feeling');
      recommendations.push('Create safe space for authentic expression');
    }
    
    if (masked.maskingType === 'fine_but_not_fine') {
      recommendations.push('Look beyond "fine" and show genuine concern');
    }
    
    return recommendations;
  }

  _getDefaultEmotionAnalysis(userId, message) {
    return {
      userId,
      timestamp: new Date().toISOString(),
      primaryEmotion: {
        emotion: 'neutral',
        score: 0.5,
        adjustedScore: 0.5,
        evidence: ['Default analysis due to error'],
        confidence: 0.3
      },
      emotionalSpectrum: {},
      maskedEmotions: [],
      emotionalProgression: { trend: 'stable', pattern: 'unknown' },
      stateChanges: [],
      contextualFactors: {},
      confidence: 0.3,
      recommendations: ['Show care and understanding']
    };
  }

  // Cache management methods
  _generateCacheKey(userId, message) {
    const messageHash = this._simpleHash(message.substring(0, 50));
    return `${userId}_${messageHash}`;
  }

  _getCachedAnalysis(cacheKey) {
    const cached = this.analysisCache.get(cacheKey);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.analysisCache.delete(cacheKey);
      return null;
    }
    
    return cached.analysis;
  }

  _cacheAnalysis(cacheKey, analysis) {
    this.analysisCache.set(cacheKey, {
      analysis,
      timestamp: Date.now()
    });

    // Cleanup old entries
    if (this.analysisCache.size > 50) {
      const oldestKeys = Array.from(this.analysisCache.keys()).slice(0, 10);
      oldestKeys.forEach(key => this.analysisCache.delete(key));
    }
  }

  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Helper methods to get context data
  async _getPersonalityProfile(userId) {
    try {
      return await this.personalityProfiler.analyzePersonality(userId);
    } catch (error) {
      console.error('Error getting personality profile:', error);
      return null;
    }
  }

  async _getEmotionalHistory(userId) {
    // Simplified emotional history - would integrate with memory system
    return {
      emotionBaseline: {},
      recentEmotions: [],
      emotionTimeline: [],
      recentTrend: 'stable'
    };
  }

  async _getRecentConversations(userId, limit = 10) {
    try {
      return await this.memoryManager.getRecentConversations(userId, limit);
    } catch (error) {
      console.error('Error getting recent conversations:', error);
      return [];
    }
  }

  /**
   * Gets analysis statistics for monitoring
   * @returns {Object} Analysis statistics
   */
  getAnalysisStats() {
    return {
      supportedEmotions: Object.keys(this.emotionPatterns),
      maskingPatterns: Object.keys(this.maskingPatterns),
      progressionPatterns: Object.keys(this.progressionPatterns),
      cacheSize: this.analysisCache.size,
      cacheTimeout: this.cacheTimeout
    };
  }
}

module.exports = ContextualEmotionAnalyzer;