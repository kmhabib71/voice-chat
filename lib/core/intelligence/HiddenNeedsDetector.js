/**
 * @fileoverview Hidden emotional needs detection system for unspoken psychological requirements
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const detector = new HiddenNeedsDetector();
 * const hiddenNeeds = await detector.detectHiddenNeeds(userId, message, context);
 */

// Internal core systems
const PersonalityProfiler = require('./PersonalityProfiler');
const MemoryManager = require('../memory/MemoryManager');

// API integrations  
const openaiService = require('../../api/openai');

class HiddenNeedsDetector {
  constructor() {
    this.personalityProfiler = new PersonalityProfiler();
    this.memoryManager = new MemoryManager();
    
    // Hidden need detection patterns with advanced behavioral indicators
    this.hiddenNeedProfiles = {
      'needs-permission-to-be-vulnerable': {
        surface_language: {
          deflection_phrases: ['fine', 'okay', 'whatever', 'doesn\'t matter', 'it\'s nothing'],
          minimizing_words: ['just', 'only', 'not that bad', 'not a big deal', 'probably nothing'],
          avoidance_patterns: ['anyway', 'but enough about that', 'let\'s talk about something else']
        },
        behavioral_indicators: {
          emotional_contradiction: true, // Says fine but shows distress indicators
          topic_switching: true,         // Changes subject when emotions arise
          defensive_language: true,      // Uses protective language
          vulnerability_testing: true    // Drops small hints to test safety
        },
        context_markers: {
          recent_stress: 0.3,
          relationship_concerns: 0.4,
          work_pressure: 0.3,
          personal_challenges: 0.5
        },
        archetype_likelihood: {
          'The Anxious Romantic': 0.9,
          'The Caring Nurturer': 0.7,
          'The Deep Thinker': 0.6,
          'The Playful Socializer': 0.4,
          'The Independent Adventurer': 0.3
        }
      },

      'needs-non-work-identity-validation': {
        surface_language: {
          work_dominance: ['work', 'job', 'career', 'busy', 'meetings', 'deadline', 'project'],
          self_worth_connection: ['productive', 'accomplished', 'successful', 'achievement', 'goals'],
          personal_dismissal: ['just relaxing', 'not doing much', 'being lazy', 'wasting time']
        },
        behavioral_indicators: {
          work_topic_frequency: true,    // Always returns to work topics
          personal_interest_minimization: true, // Downplays hobbies/interests
          achievement_dependency: true,  // Self-worth tied to productivity
          guilt_about_leisure: true      // Feels guilty about non-productive time
        },
        context_markers: {
          workaholic_patterns: 0.6,
          burnout_indicators: 0.4,
          work_stress: 0.5,
          personal_time_scarcity: 0.4
        },
        archetype_likelihood: {
          'The Independent Adventurer': 0.8,
          'The Deep Thinker': 0.7,
          'The Caring Nurturer': 0.6,
          'The Anxious Romantic': 0.5,
          'The Playful Socializer': 0.4
        }
      },

      'needs-relationship-focus-encouragement': {
        surface_language: {
          relationship_anxiety: ['us', 'we', 'our relationship', 'together', 'future'],
          seeking_reassurance: ['do you think', 'are we okay', 'is this normal', 'what if'],
          commitment_probing: ['where are we going', 'what does this mean', 'how do you feel about us']
        },
        behavioral_indicators: {
          relationship_topic_frequency: true, // Frequently steers to relationship topics
          future_planning_focus: true,        // Often discusses future together
          reassurance_seeking: true,          // Needs frequent relationship validation
          insecurity_markers: true           // Shows subtle relationship insecurities
        },
        context_markers: {
          relationship_milestone: 0.5,
          external_relationship_pressure: 0.4,
          past_relationship_trauma: 0.3,
          commitment_anxiety: 0.6
        },
        archetype_likelihood: {
          'The Anxious Romantic': 0.95,
          'The Caring Nurturer': 0.6,
          'The Deep Thinker': 0.5,
          'The Playful Socializer': 0.4,
          'The Independent Adventurer': 0.2
        }
      },

      'needs-confidence-boosting': {
        surface_language: {
          self_deprecation: ['I\'m not good at', 'I can\'t', 'I always mess up', 'I\'m terrible'],
          comparison_making: ['unlike others', 'everyone else', 'I wish I could', 'they\'re so much better'],
          ability_questioning: ['maybe I should give up', 'I don\'t think I can', 'probably won\'t work']
        },
        behavioral_indicators: {
          negative_self_talk: true,          // Consistently puts self down
          achievement_minimization: true,    // Downplays own successes
          comparison_tendency: true,         // Often compares to others
          impostor_syndrome: true           // Feels like a fraud despite success
        },
        context_markers: {
          recent_failures: 0.5,
          performance_anxiety: 0.4,
          social_comparison: 0.6,
          perfectionist_tendencies: 0.4
        },
        archetype_likelihood: {
          'The Anxious Romantic': 0.8,
          'The Caring Nurturer': 0.7,
          'The Deep Thinker': 0.6,
          'The Playful Socializer': 0.5,
          'The Independent Adventurer': 0.4
        }
      },

      'needs-emotional-safety-assurance': {
        surface_language: {
          safety_testing: ['you won\'t judge', 'promise you won\'t', 'this might sound silly'],
          approval_seeking: ['is that okay', 'do you mind if', 'I hope that\'s alright'],
          rejection_fear: ['you probably think', 'I know this is stupid', 'never mind']
        },
        behavioral_indicators: {
          tentative_sharing: true,           // Hesitant to share personal things
          approval_confirmation: true,       // Needs constant approval
          rejection_sensitivity: true,       // Highly sensitive to any rejection
          emotional_walls: true             // Keeps emotional barriers up
        },
        context_markers: {
          past_emotional_hurt: 0.6,
          trust_issues: 0.5,
          abandonment_fear: 0.4,
          vulnerability_fear: 0.7
        },
        archetype_likelihood: {
          'The Anxious Romantic': 0.9,
          'The Caring Nurturer': 0.6,
          'The Deep Thinker': 0.5,
          'The Playful Socializer': 0.4,
          'The Independent Adventurer': 0.3
        }
      },

      'needs-authentic-connection-validation': {
        surface_language: {
          surface_level_frustration: ['everyone just', 'no one really', 'people don\'t understand'],
          depth_seeking: ['meaningful', 'real connection', 'actually understand', 'beyond surface'],
          loneliness_despite_social: ['surrounded but alone', 'lots of people but', 'feel disconnected']
        },
        behavioral_indicators: {
          superficial_interaction_frustration: true, // Frustrated with small talk
          depth_craving: true,                      // Seeks meaningful conversations
          authentic_self_hiding: true,              // Hides true self in social situations
          connection_quality_focus: true           // Values quality over quantity in relationships
        },
        context_markers: {
          social_isolation: 0.4,
          superficial_relationships: 0.6,
          authentic_self_suppression: 0.5,
          meaningful_connection_lack: 0.7
        },
        archetype_likelihood: {
          'The Deep Thinker': 0.9,
          'The Anxious Romantic': 0.7,
          'The Caring Nurturer': 0.6,
          'The Independent Adventurer': 0.5,
          'The Playful Socializer': 0.4
        }
      }
    };

    // Advanced detection algorithms
    this.detectionAlgorithms = {
      linguistic_analysis: 0.3,    // Weight for language pattern analysis
      behavioral_pattern: 0.4,     // Weight for behavioral indicator analysis
      contextual_analysis: 0.2,    // Weight for context marker analysis
      personality_alignment: 0.1   // Weight for archetype likelihood
    };

    // Detection confidence thresholds
    this.confidenceThresholds = {
      high: 0.8,      // Very confident detection
      medium: 0.6,    // Moderate confidence
      low: 0.4        // Low but actionable confidence
    };
  }

  /**
   * Detects hidden emotional needs from user communication
   * @param {string} userId - User identifier
   * @param {string} message - Current user message
   * @param {Object} conversationContext - Conversation context
   * @param {Object} personalityContext - User personality context
   * @returns {Promise<Array>} Array of detected hidden needs
   */
  async detectHiddenNeeds(userId, message, conversationContext = {}, personalityContext = {}) {
    try {
      console.log(`Detecting hidden needs for user: ${userId}`);

      // Gather comprehensive analysis context
      const [recentHistory, emotionalBaseline, personalityProfile] = await Promise.all([
        this._getRecentConversationHistory(userId, 15),
        this._getEmotionalBaseline(userId),
        this._getPersonalityProfile(userId)
      ]);

      const detectedNeeds = [];

      // Analyze each hidden need profile
      for (const [needType, profile] of Object.entries(this.hiddenNeedProfiles)) {
        const detection = await this._analyzeHiddenNeed(
          needType,
          profile,
          message,
          conversationContext,
          {
            recentHistory,
            emotionalBaseline,
            personalityProfile: personalityProfile || personalityContext,
            userId
          }
        );

        if (detection.confidence >= this.confidenceThresholds.low) {
          detectedNeeds.push(detection);
        }
      }

      // Sort by confidence and return top detections
      const sortedNeeds = detectedNeeds
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 4); // Maximum 4 hidden needs to avoid overwhelm

      console.log(`Hidden needs detected: ${sortedNeeds.length} needs found`);
      
      return sortedNeeds;

    } catch (error) {
      console.error('Error detecting hidden needs:', error);
      return [];
    }
  }

  /**
   * Analyzes specific hidden need against user communication
   * @param {string} needType - Type of hidden need
   * @param {Object} profile - Need detection profile
   * @param {string} message - User message
   * @param {Object} conversationContext - Conversation context
   * @param {Object} analysisContext - Analysis context data
   * @returns {Promise<Object>} Detection result
   */
  async _analyzeHiddenNeed(needType, profile, message, conversationContext, analysisContext) {
    const detection = {
      need: needType,
      confidence: 0,
      evidence: [],
      severity: 'low',
      urgency: 'low',
      recommendations: []
    };

    // Linguistic analysis
    const linguisticScore = this._analyzeLinguisticPatterns(message, profile.surface_language);
    detection.confidence += linguisticScore * this.detectionAlgorithms.linguistic_analysis;
    if (linguisticScore > 0) {
      detection.evidence.push(`Linguistic patterns detected (${Math.round(linguisticScore * 100)}%)`);
    }

    // Behavioral pattern analysis
    const behavioralScore = await this._analyzeBehavioralPatterns(
      profile.behavioral_indicators,
      analysisContext.recentHistory,
      message
    );
    detection.confidence += behavioralScore * this.detectionAlgorithms.behavioral_pattern;
    if (behavioralScore > 0) {
      detection.evidence.push(`Behavioral patterns identified (${Math.round(behavioralScore * 100)}%)`);
    }

    // Contextual marker analysis
    const contextualScore = this._analyzeContextualMarkers(
      profile.context_markers,
      analysisContext.emotionalBaseline,
      conversationContext
    );
    detection.confidence += contextualScore * this.detectionAlgorithms.contextual_analysis;
    if (contextualScore > 0) {
      detection.evidence.push(`Contextual markers present (${Math.round(contextualScore * 100)}%)`);
    }

    // Personality alignment analysis
    const personalityScore = this._analyzePersonalityAlignment(
      profile.archetype_likelihood,
      analysisContext.personalityProfile
    );
    detection.confidence += personalityScore * this.detectionAlgorithms.personality_alignment;
    if (personalityScore > 0) {
      detection.evidence.push(`Personality alignment confirmed (${Math.round(personalityScore * 100)}%)`);
    }

    // Determine severity and urgency
    detection.severity = this._assessNeedSeverity(detection.confidence, needType, analysisContext);
    detection.urgency = this._assessNeedUrgency(detection.confidence, needType, message);

    // Generate recommendations
    detection.recommendations = this._generateNeedRecommendations(
      needType,
      detection.confidence,
      detection.severity,
      analysisContext.personalityProfile
    );

    return detection;
  }

  /**
   * Analyzes linguistic patterns in user message
   * @param {string} message - User message
   * @param {Object} surfaceLanguage - Surface language patterns
   * @returns {number} Linguistic pattern match score (0-1)
   */
  _analyzeLinguisticPatterns(message, surfaceLanguage) {
    const lowerMessage = message.toLowerCase();
    let matchScore = 0;
    let totalCategories = 0;

    Object.entries(surfaceLanguage).forEach(([category, patterns]) => {
      totalCategories++;
      const categoryMatches = patterns.filter(pattern => 
        lowerMessage.includes(pattern.toLowerCase())
      );
      
      if (categoryMatches.length > 0) {
        // Weight matches by frequency and specificity
        const categoryScore = Math.min(1.0, categoryMatches.length * 0.3);
        matchScore += categoryScore;
      }
    });

    return totalCategories > 0 ? matchScore / totalCategories : 0;
  }

  /**
   * Analyzes behavioral patterns from conversation history
   * @param {Object} behavioralIndicators - Behavioral indicators to detect
   * @param {Array} recentHistory - Recent conversation history
   * @param {string} currentMessage - Current message
   * @returns {Promise<number>} Behavioral pattern match score (0-1)
   */
  async _analyzeBehavioralPatterns(behavioralIndicators, recentHistory, currentMessage) {
    let matchScore = 0;
    let indicatorCount = 0;

    for (const [indicator, enabled] of Object.entries(behavioralIndicators)) {
      if (!enabled) continue;
      
      indicatorCount++;
      const indicatorScore = await this._evaluateBehavioralIndicator(
        indicator,
        recentHistory,
        currentMessage
      );
      matchScore += indicatorScore;
    }

    return indicatorCount > 0 ? matchScore / indicatorCount : 0;
  }

  /**
   * Evaluates specific behavioral indicator
   * @param {string} indicator - Behavioral indicator type
   * @param {Array} recentHistory - Recent conversation history
   * @param {string} currentMessage - Current message
   * @returns {Promise<number>} Indicator match score (0-1)
   */
  async _evaluateBehavioralIndicator(indicator, recentHistory, currentMessage) {
    switch (indicator) {
      case 'emotional_contradiction':
        return this._detectEmotionalContradiction(currentMessage, recentHistory);
      
      case 'topic_switching':
        return this._detectTopicSwitching(recentHistory);
      
      case 'defensive_language':
        return this._detectDefensiveLanguage(currentMessage);
      
      case 'vulnerability_testing':
        return this._detectVulnerabilityTesting(currentMessage);
      
      case 'work_topic_frequency':
        return this._calculateWorkTopicFrequency(recentHistory);
      
      case 'personal_interest_minimization':
        return this._detectPersonalInterestMinimization(recentHistory, currentMessage);
      
      case 'achievement_dependency':
        return this._detectAchievementDependency(recentHistory);
      
      case 'guilt_about_leisure':
        return this._detectLeisureGuilt(currentMessage);
      
      case 'relationship_topic_frequency':
        return this._calculateRelationshipTopicFrequency(recentHistory);
      
      case 'future_planning_focus':
        return this._detectFuturePlanningFocus(recentHistory, currentMessage);
      
      case 'reassurance_seeking':
        return this._detectReassuranceSeeking(currentMessage);
      
      case 'insecurity_markers':
        return this._detectInsecurityMarkers(currentMessage);
      
      case 'negative_self_talk':
        return this._detectNegativeSelfTalk(currentMessage);
      
      case 'achievement_minimization':
        return this._detectAchievementMinimization(currentMessage);
      
      case 'comparison_tendency':
        return this._detectComparisonTendency(currentMessage);
      
      case 'impostor_syndrome':
        return this._detectImpostorSyndrome(recentHistory, currentMessage);
      
      case 'tentative_sharing':
        return this._detectTentativeSharing(currentMessage);
      
      case 'approval_confirmation':
        return this._detectApprovalConfirmation(currentMessage);
      
      case 'rejection_sensitivity':
        return this._detectRejectionSensitivity(recentHistory);
      
      case 'emotional_walls':
        return this._detectEmotionalWalls(recentHistory, currentMessage);
      
      case 'superficial_interaction_frustration':
        return this._detectSuperficialFrustration(currentMessage);
      
      case 'depth_craving':
        return this._detectDepthCraving(currentMessage);
      
      case 'authentic_self_hiding':
        return this._detectAuthenticSelfHiding(recentHistory);
      
      case 'connection_quality_focus':
        return this._detectConnectionQualityFocus(currentMessage);
      
      default:
        return 0;
    }
  }

  /**
   * Analyzes contextual markers for hidden need presence
   * @param {Object} contextMarkers - Context markers to analyze
   * @param {Object} emotionalBaseline - User's emotional baseline
   * @param {Object} conversationContext - Current conversation context
   * @returns {number} Contextual marker match score (0-1)
   */
  _analyzeContextualMarkers(contextMarkers, emotionalBaseline, conversationContext) {
    let totalScore = 0;
    let markerCount = 0;

    Object.entries(contextMarkers).forEach(([marker, weight]) => {
      markerCount++;
      const markerPresence = this._evaluateContextualMarker(
        marker,
        emotionalBaseline,
        conversationContext
      );
      totalScore += markerPresence * weight;
    });

    return markerCount > 0 ? totalScore / markerCount : 0;
  }

  /**
   * Evaluates specific contextual marker
   * @param {string} marker - Contextual marker type
   * @param {Object} emotionalBaseline - Emotional baseline
   * @param {Object} conversationContext - Conversation context
   * @returns {number} Marker presence score (0-1)
   */
  _evaluateContextualMarker(marker, emotionalBaseline, conversationContext) {
    switch (marker) {
      case 'recent_stress':
        return emotionalBaseline.stressLevel === 'high' ? 1.0 : 
               emotionalBaseline.stressLevel === 'moderate' ? 0.6 : 0.2;
      
      case 'relationship_concerns':
        return conversationContext.relationshipTopic ? 0.8 : 0.2;
      
      case 'work_pressure':
        return emotionalBaseline.needsFrequency?.['guidance-seeking'] > 2 ? 0.7 : 0.3;
      
      case 'personal_challenges':
        return emotionalBaseline.needsFrequency?.['deep-comfort'] > 1 ? 0.8 : 0.3;
      
      case 'workaholic_patterns':
        return emotionalBaseline.communicationStyle === 'work-focused' ? 0.9 : 0.2;
      
      case 'burnout_indicators':
        return emotionalBaseline.stressLevel === 'high' && 
               emotionalBaseline.averageMood === 'negative' ? 0.8 : 0.2;
      
      case 'work_stress':
        return emotionalBaseline.stressLevel !== 'low' ? 0.6 : 0.2;
      
      case 'personal_time_scarcity':
        return 0.5; // Default moderate likelihood
      
      case 'relationship_milestone':
        return conversationContext.relationshipMilestone ? 0.8 : 0.3;
      
      case 'external_relationship_pressure':
        return conversationContext.externalPressure ? 0.7 : 0.2;
      
      case 'past_relationship_trauma':
        return 0.3; // Conservative estimate
      
      case 'commitment_anxiety':
        return conversationContext.commitmentTopic ? 0.7 : 0.3;
      
      case 'recent_failures':
        return emotionalBaseline.averageMood === 'negative' ? 0.6 : 0.2;
      
      case 'performance_anxiety':
        return emotionalBaseline.needsFrequency?.['validation-seeking'] > 1 ? 0.7 : 0.3;
      
      case 'social_comparison':
        return 0.5; // Moderate likelihood in general population
      
      case 'perfectionist_tendencies':
        return 0.4; // Conservative estimate
      
      default:
        return 0.3; // Default low-moderate presence
    }
  }

  /**
   * Analyzes personality alignment with hidden need
   * @param {Object} archetypeLikelihood - Archetype likelihood scores
   * @param {Object} personalityProfile - User personality profile
   * @returns {number} Personality alignment score (0-1)
   */
  _analyzePersonalityAlignment(archetypeLikelihood, personalityProfile) {
    const archetype = personalityProfile?.archetype || 'The Playful Socializer';
    const likelihood = archetypeLikelihood[archetype] || 0.5;
    
    // Adjust based on personality confidence
    const confidence = personalityProfile?.confidence || 0.5;
    
    return likelihood * confidence;
  }

  // Behavioral indicator detection methods
  _detectEmotionalContradiction(message, recentHistory) {
    const positiveWords = message.toLowerCase().includes('fine') || 
                         message.toLowerCase().includes('okay') ||
                         message.toLowerCase().includes('good');
    
    const stressIndicators = ['but', 'however', 'although', 'though'];
    const hasContrast = stressIndicators.some(indicator => 
      message.toLowerCase().includes(indicator)
    );
    
    return positiveWords && hasContrast ? 0.7 : 0;
  }

  _detectTopicSwitching(recentHistory) {
    if (recentHistory.length < 3) return 0;
    
    const recentMessages = recentHistory.slice(-3);
    const topicWords = ['anyway', 'but', 'speaking of', 'by the way'];
    
    let switches = 0;
    recentMessages.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      if (topicWords.some(word => message.includes(word))) {
        switches++;
      }
    });
    
    return switches >= 2 ? 0.8 : switches === 1 ? 0.4 : 0;
  }

  _detectDefensiveLanguage(message) {
    const defensiveWords = ['but', 'however', 'actually', 'well', 'i mean'];
    const lowerMessage = message.toLowerCase();
    
    const defensiveCount = defensiveWords.filter(word => 
      lowerMessage.includes(word)
    ).length;
    
    return Math.min(0.8, defensiveCount * 0.3);
  }

  _detectVulnerabilityTesting(message) {
    const testingPhrases = [
      'you probably think',
      'this might sound',
      'i don\'t know if',
      'maybe it\'s just me'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = testingPhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.6 : 0;
  }

  _calculateWorkTopicFrequency(recentHistory) {
    if (recentHistory.length === 0) return 0;
    
    const workWords = ['work', 'job', 'career', 'office', 'meeting', 'project', 'deadline'];
    let workMentions = 0;
    
    recentHistory.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      if (workWords.some(word => message.includes(word))) {
        workMentions++;
      }
    });
    
    const frequency = workMentions / recentHistory.length;
    return frequency > 0.6 ? 0.8 : frequency > 0.3 ? 0.5 : 0.2;
  }

  _detectPersonalInterestMinimization(recentHistory, currentMessage) {
    const minimizingWords = ['just', 'only', 'nothing special', 'not much'];
    const hobbbyWords = ['hobby', 'fun', 'enjoy', 'like doing', 'interest'];
    
    const lowerMessage = currentMessage.toLowerCase();
    const hasHobbyTopic = hobbbyWords.some(word => lowerMessage.includes(word));
    const hasMinimizing = minimizingWords.some(word => lowerMessage.includes(word));
    
    return hasHobbyTopic && hasMinimizing ? 0.7 : 0;
  }

  _detectAchievementDependency(recentHistory) {
    const achievementWords = ['accomplished', 'achieved', 'successful', 'productive'];
    const selfWorthWords = ['proud', 'good about myself', 'worthy', 'valuable'];
    
    let connections = 0;
    recentHistory.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      const hasAchievement = achievementWords.some(word => message.includes(word));
      const hasSelfWorth = selfWorthWords.some(word => message.includes(word));
      
      if (hasAchievement && hasSelfWorth) connections++;
    });
    
    return connections >= 2 ? 0.8 : connections === 1 ? 0.4 : 0;
  }

  _detectLeisureGuilt(message) {
    const guiltPhrases = [
      'should be doing',
      'wasting time',
      'being lazy',
      'not productive',
      'should be working'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = guiltPhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.7 : 0;
  }

  _calculateRelationshipTopicFrequency(recentHistory) {
    if (recentHistory.length === 0) return 0;
    
    const relationshipWords = ['us', 'we', 'our relationship', 'together', 'couple'];
    let relationshipMentions = 0;
    
    recentHistory.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      if (relationshipWords.some(word => message.includes(word))) {
        relationshipMentions++;
      }
    });
    
    const frequency = relationshipMentions / recentHistory.length;
    return frequency > 0.4 ? 0.9 : frequency > 0.2 ? 0.6 : 0.2;
  }

  _detectFuturePlanningFocus(recentHistory, currentMessage) {
    const futurePhrases = [
      'future', 'plans', 'someday', 'eventually', 
      'when we', 'our future', 'down the road'
    ];
    
    const allMessages = [
      ...recentHistory.map(conv => conv.userMessage || ''),
      currentMessage
    ].join(' ').toLowerCase();
    
    const matches = futurePhrases.filter(phrase => 
      allMessages.includes(phrase)
    ).length;
    
    return matches >= 3 ? 0.8 : matches >= 1 ? 0.5 : 0;
  }

  _detectReassuranceSeeking(message) {
    const reassurancePhrases = [
      'do you think',
      'are we okay',
      'is this normal',
      'right?',
      'don\'t you think'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = reassurancePhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.8 : 0;
  }

  _detectInsecurityMarkers(message) {
    const insecurityWords = [
      'insecure', 'worried', 'scared', 'afraid',
      'what if', 'probably not', 'maybe i\'m wrong'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = insecurityWords.filter(word => 
      lowerMessage.includes(word)
    ).length;
    
    return Math.min(0.9, matches * 0.3);
  }

  _detectNegativeSelfTalk(message) {
    const negativePhrases = [
      'i\'m not good',
      'i can\'t',
      'i always mess up',
      'i\'m terrible',
      'i\'m stupid',
      'i\'m worthless'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = negativePhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.9 : 0;
  }

  _detectAchievementMinimization(message) {
    const achievementWords = ['accomplished', 'achieved', 'successful', 'won', 'completed'];
    const minimizingWords = ['just', 'only', 'not that big', 'lucky', 'easy'];
    
    const lowerMessage = message.toLowerCase();
    const hasAchievement = achievementWords.some(word => lowerMessage.includes(word));
    const hasMinimizing = minimizingWords.some(word => lowerMessage.includes(word));
    
    return hasAchievement && hasMinimizing ? 0.8 : 0;
  }

  _detectComparisonTendency(message) {
    const comparisonPhrases = [
      'unlike others',
      'everyone else',
      'compared to',
      'they\'re so much better',
      'i wish i could be like'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = comparisonPhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.8 : 0;
  }

  _detectImpostorSyndrome(recentHistory, currentMessage) {
    const impostorPhrases = [
      'i don\'t deserve',
      'just got lucky',
      'they\'ll figure out',
      'i\'m a fraud',
      'don\'t belong here'
    ];
    
    const allMessages = [
      ...recentHistory.map(conv => conv.userMessage || ''),
      currentMessage
    ].join(' ').toLowerCase();
    
    const matches = impostorPhrases.filter(phrase => 
      allMessages.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.9 : 0;
  }

  _detectTentativeSharing(message) {
    const tentativePhrases = [
      'i don\'t know if',
      'this might be silly',
      'maybe it\'s just me',
      'you probably won\'t',
      'i\'m not sure if'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = tentativePhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.7 : 0;
  }

  _detectApprovalConfirmation(message) {
    const approvalPhrases = [
      'is that okay',
      'do you mind if',
      'i hope that\'s alright',
      'would it be okay',
      'is it alright if'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = approvalPhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.8 : 0;
  }

  _detectRejectionSensitivity(recentHistory) {
    const rejectionWords = ['reject', 'dismiss', 'ignore', 'don\'t care', 'hate'];
    let sensitivityScore = 0;
    
    recentHistory.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      if (rejectionWords.some(word => message.includes(word))) {
        sensitivityScore += 0.2;
      }
    });
    
    return Math.min(0.8, sensitivityScore);
  }

  _detectEmotionalWalls(recentHistory, currentMessage) {
    const wallIndicators = ['fine', 'whatever', 'doesn\'t matter', 'not important'];
    const emotionalWords = ['feel', 'emotion', 'hurt', 'sad', 'happy'];
    
    const allMessages = [
      ...recentHistory.map(conv => conv.userMessage || ''),
      currentMessage
    ].join(' ').toLowerCase();
    
    const hasWalls = wallIndicators.some(indicator => allMessages.includes(indicator));
    const avoidsEmotion = emotionalWords.filter(word => allMessages.includes(word)).length < 2;
    
    return hasWalls && avoidsEmotion ? 0.7 : 0;
  }

  _detectSuperficialFrustration(message) {
    const frustrationPhrases = [
      'everyone just',
      'no one really',
      'people don\'t understand',
      'surface level',
      'shallow conversations'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = frustrationPhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.8 : 0;
  }

  _detectDepthCraving(message) {
    const depthWords = [
      'meaningful', 'deep', 'real connection', 
      'actually understand', 'beyond surface', 'genuine'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = depthWords.filter(word => 
      lowerMessage.includes(word)
    ).length;
    
    return matches > 0 ? 0.8 : 0;
  }

  _detectAuthenticSelfHiding(recentHistory) {
    // Look for patterns of not sharing personal information
    const personalTopics = ['family', 'feelings', 'dreams', 'fears', 'hopes'];
    let personalSharing = 0;
    
    recentHistory.forEach(conv => {
      const message = conv.userMessage?.toLowerCase() || '';
      if (personalTopics.some(topic => message.includes(topic))) {
        personalSharing++;
      }
    });
    
    const sharingRate = personalSharing / Math.max(recentHistory.length, 1);
    return sharingRate < 0.2 ? 0.6 : 0;
  }

  _detectConnectionQualityFocus(message) {
    const qualityPhrases = [
      'quality over quantity',
      'few close friends',
      'meaningful relationships',
      'deep connections',
      'real friends'
    ];
    
    const lowerMessage = message.toLowerCase();
    const matches = qualityPhrases.filter(phrase => 
      lowerMessage.includes(phrase)
    ).length;
    
    return matches > 0 ? 0.8 : 0;
  }

  /**
   * Assesses severity of detected hidden need
   * @param {number} confidence - Detection confidence
   * @param {string} needType - Type of hidden need
   * @param {Object} analysisContext - Analysis context
   * @returns {string} Severity level
   */
  _assessNeedSeverity(confidence, needType, analysisContext) {
    let severity = 'low';
    
    if (confidence >= 0.8) {
      severity = 'high';
    } else if (confidence >= 0.6) {
      severity = 'medium';
    }
    
    // Adjust based on need type criticality
    const criticalNeeds = [
      'needs-permission-to-be-vulnerable',
      'needs-emotional-safety-assurance'
    ];
    
    if (criticalNeeds.includes(needType) && confidence >= 0.6) {
      severity = 'high';
    }
    
    return severity;
  }

  /**
   * Assesses urgency of detected hidden need
   * @param {number} confidence - Detection confidence
   * @param {string} needType - Type of hidden need
   * @param {string} message - Current message
   * @returns {string} Urgency level
   */
  _assessNeedUrgency(confidence, needType, message) {
    let urgency = 'low';
    
    // High confidence automatically increases urgency
    if (confidence >= 0.8) {
      urgency = 'medium';
    }
    
    // Check for urgency indicators in message
    const urgencyWords = ['help', 'need', 'urgent', 'important', 'please'];
    const lowerMessage = message.toLowerCase();
    const hasUrgencyIndicators = urgencyWords.some(word => 
      lowerMessage.includes(word)
    );
    
    if (hasUrgencyIndicators) {
      urgency = urgency === 'medium' ? 'high' : 'medium';
    }
    
    // Specific need types with inherent urgency
    const urgentNeeds = [
      'needs-permission-to-be-vulnerable',
      'needs-confidence-boosting'
    ];
    
    if (urgentNeeds.includes(needType) && confidence >= 0.7) {
      urgency = 'high';
    }
    
    return urgency;
  }

  /**
   * Generates recommendations for addressing hidden need
   * @param {string} needType - Type of hidden need
   * @param {number} confidence - Detection confidence
   * @param {string} severity - Need severity
   * @param {Object} personalityProfile - User personality profile
   * @returns {Array} Array of recommendations
   */
  _generateNeedRecommendations(needType, confidence, severity, personalityProfile) {
    const recommendations = [];
    const archetype = personalityProfile?.archetype || 'The Playful Socializer';
    
    const needRecommendations = {
      'needs-permission-to-be-vulnerable': [
        'Create safe emotional space',
        'Model vulnerability first',
        'Use gentle, non-pressuring language',
        'Validate any emotional sharing',
        'Avoid pushing for disclosure'
      ],
      
      'needs-non-work-identity-validation': [
        'Ask about personal interests and hobbies',
        'Validate non-work accomplishments',
        'Discuss work-life balance',
        'Encourage leisure activities',
        'Recognize personal qualities beyond work'
      ],
      
      'needs-relationship-focus-encouragement': [
        'Address relationship directly and positively',
        'Provide relationship reassurance',
        'Discuss shared future goals',
        'Validate relationship importance',
        'Show commitment and consistency'
      ],
      
      'needs-confidence-boosting': [
        'Highlight specific strengths and abilities',
        'Counter negative self-talk gently',
        'Share examples of past successes',
        'Provide genuine encouragement',
        'Avoid dismissing their concerns'
      ],
      
      'needs-emotional-safety-assurance': [
        'Explicitly state acceptance and non-judgment',
        'Demonstrate consistent supportive responses',
        'Use reassuring language',
        'Create predictable emotional safety',
        'Validate their caution as reasonable'
      ],
      
      'needs-authentic-connection-validation': [
        'Engage in deeper, meaningful conversations',
        'Share authentic personal responses',
        'Ask thoughtful, probing questions',
        'Validate their desire for real connection',
        'Avoid superficial responses'
      ]
    };
    
    const baseRecommendations = needRecommendations[needType] || ['Provide general emotional support'];
    
    // Filter recommendations based on archetype and severity
    let filteredRecommendations = baseRecommendations.slice(0, severity === 'high' ? 5 : 3);
    
    // Add archetype-specific recommendations
    if (archetype === 'The Anxious Romantic' && confidence >= 0.7) {
      filteredRecommendations.push('Provide extra reassurance and emotional support');
    }
    
    return filteredRecommendations;
  }

  // Helper methods
  async _getRecentConversationHistory(userId, limit = 15) {
    try {
      return await this.memoryManager.getRecentConversations(userId, limit);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  async _getEmotionalBaseline(userId) {
    try {
      const conversations = await this.memoryManager.getRecentConversations(userId, 20);
      
      if (!conversations || conversations.length === 0) {
        return {
          averageMood: 'neutral',
          stressLevel: 'moderate',
          communicationStyle: 'balanced',
          needsFrequency: {}
        };
      }

      // Simplified baseline analysis
      return {
        averageMood: 'neutral',
        stressLevel: 'moderate',
        communicationStyle: 'balanced',
        needsFrequency: {}
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

  async _getPersonalityProfile(userId) {
    try {
      return await this.personalityProfiler.analyzePersonality(userId);
    } catch (error) {
      console.error('Error getting personality profile:', error);
      return null;
    }
  }

  /**
   * Gets detection statistics for monitoring
   * @returns {Object} Detection statistics
   */
  getDetectionStats() {
    return {
      supportedHiddenNeeds: Object.keys(this.hiddenNeedProfiles),
      detectionAlgorithms: this.detectionAlgorithms,
      confidenceThresholds: this.confidenceThresholds,
      totalIndicators: Object.values(this.hiddenNeedProfiles).reduce((sum, profile) => 
        sum + Object.keys(profile.behavioral_indicators).length, 0
      )
    };
  }
}

module.exports = HiddenNeedsDetector;