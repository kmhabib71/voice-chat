/**
 * @fileoverview Personality-based user classification system for AI adaptation
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const classifier = new PersonalityClassifier();
 * const userType = await classifier.classifyUser(userId);
 * const adaptations = classifier.getAdaptationStrategy(userType);
 */

// Internal core systems
const PersonalityProfiler = require('./PersonalityProfiler');

class PersonalityClassifier {
  constructor() {
    this.personalityProfiler = new PersonalityProfiler();
    
    // User archetype definitions from TASKS.md lines 494-516
    this.userArchetypes = {
      'The Anxious Romantic': {
        needs: ['constant-reassurance', 'emotional-support', 'validation'],
        aiStyle: 'nurturing',
        communicationPreference: 'gentle-and-caring',
        bigFivePattern: {
          neuroticism: 'high',
          extraversion: 'low-to-medium',
          agreeableness: 'high',
          conscientiousness: 'medium',
          openness: 'medium'
        },
        triggers: ['criticism', 'long-silences', 'uncertainty', 'conflict'],
        responseLength: 'medium-to-long',
        emotionalTone: 'warm-and-supportive'
      },
      
      'The Independent Adventurer': {
        needs: ['respect-boundaries', 'adventure-planning', 'growth-partnership'],
        aiStyle: 'supportive-but-not-clingy',
        communicationPreference: 'direct-and-energetic',
        bigFivePattern: {
          extraversion: 'high',
          openness: 'high',
          conscientiousness: 'medium-to-high',
          neuroticism: 'low',
          agreeableness: 'medium'
        },
        triggers: ['clinginess', 'possessiveness', 'routine-focus'],
        responseLength: 'concise-to-medium',
        emotionalTone: 'enthusiastic-and-motivating'
      },
      
      'The Deep Thinker': {
        needs: [
          'intellectual-stimulation',
          'philosophical-discussions',
          'meaningful-connection'
        ],
        aiStyle: 'thoughtful-and-introspective',
        communicationPreference: 'reflective-and-deep',
        bigFivePattern: {
          openness: 'high',
          conscientiousness: 'high',
          neuroticism: 'low-to-medium',
          extraversion: 'low-to-medium',
          agreeableness: 'medium-to-high'
        },
        triggers: ['superficial-talk', 'rushed-conversations', 'interruptions'],
        responseLength: 'long-and-detailed',
        emotionalTone: 'contemplative-and-insightful'
      },
      
      'The Playful Socializer': {
        needs: ['fun-interactions', 'social-engagement', 'light-hearted-banter'],
        aiStyle: 'upbeat-and-entertaining',
        communicationPreference: 'casual-and-fun',
        bigFivePattern: {
          extraversion: 'high',
          agreeableness: 'high',
          openness: 'medium-to-high',
          neuroticism: 'low',
          conscientiousness: 'medium'
        },
        triggers: ['serious-tone-only', 'heavy-topics', 'formal-communication'],
        responseLength: 'short-to-medium',
        emotionalTone: 'playful-and-energetic'
      },
      
      'The Caring Nurturer': {
        needs: ['giving-support', 'emotional-connection', 'helping-others'],
        aiStyle: 'appreciative-and-reciprocal',
        communicationPreference: 'warm-and-empathetic',
        bigFivePattern: {
          agreeableness: 'high',
          conscientiousness: 'high',
          extraversion: 'medium',
          openness: 'medium',
          neuroticism: 'low-to-medium'
        },
        triggers: ['being-burden', 'dismissal-of-feelings', 'lack-of-appreciation'],
        responseLength: 'medium',
        emotionalTone: 'grateful-and-understanding'
      }
    };
  }

  /**
   * Classifies user into primary personality archetype
   * @param {string} userId - Unique user identifier
   * @returns {Promise<Object>} Classification result with archetype and confidence
   */
  async classifyUser(userId) {
    try {
      // Get comprehensive personality analysis
      const personalityAnalysis = await this.personalityProfiler.analyzePersonality(userId);
      
      if (!personalityAnalysis || !personalityAnalysis.bigFiveTraits) {
        console.log('Insufficient personality data for classification');
        return {
          archetype: 'Unclassified',
          confidence: 0.0,
          reason: 'insufficient_data',
          fallbackStrategy: 'balanced-approach'
        };
      }

      // Calculate archetype scores
      const archetypeScores = await this._calculateArchetypeScores(personalityAnalysis);
      
      // Find best match
      const bestMatch = this._findBestArchetypeMatch(archetypeScores);
      
      // Get adaptation strategy
      const adaptationStrategy = this.getAdaptationStrategy(bestMatch.archetype);
      
      const classification = {
        userId,
        archetype: bestMatch.archetype,
        confidence: bestMatch.score,
        alternativeArchetypes: this._getAlternatives(archetypeScores, bestMatch.archetype),
        adaptationStrategy,
        personalityInsights: this._extractKeyInsights(personalityAnalysis),
        lastUpdated: new Date().toISOString(),
        dataPoints: personalityAnalysis.conversationCount || 0
      };

      console.log(`User ${userId} classified as: ${bestMatch.archetype} (${Math.round(bestMatch.score * 100)}% confidence)`);
      
      return classification;

    } catch (error) {
      console.error('Error in user classification:', error);
      return {
        archetype: 'Unclassified',
        confidence: 0.0,
        error: error.message,
        fallbackStrategy: 'balanced-approach'
      };
    }
  }

  /**
   * Calculates similarity scores for each archetype
   * @param {Object} personalityAnalysis - Full personality analysis
   * @returns {Promise<Object>} Archetype scores
   */
  async _calculateArchetypeScores(personalityAnalysis) {
    const scores = {};
    
    for (const [archetypeName, archetypeData] of Object.entries(this.userArchetypes)) {
      scores[archetypeName] = this._calculateArchetypeMatch(
        personalityAnalysis,
        archetypeData
      );
    }
    
    return scores;
  }

  /**
   * Calculates match score between user and archetype
   * @param {Object} userAnalysis - User personality analysis
   * @param {Object} archetypeData - Archetype definition
   * @returns {number} Match score (0-1)
   */
  _calculateArchetypeMatch(userAnalysis, archetypeData) {
    let totalScore = 0;
    let totalWeight = 0;

    // Big Five trait matching (40% weight)
    const bigFiveScore = this._matchBigFiveTraits(
      userAnalysis.bigFiveTraits,
      archetypeData.bigFivePattern
    );
    totalScore += bigFiveScore * 0.4;
    totalWeight += 0.4;

    // Communication style matching (25% weight)
    const communicationScore = this._matchCommunicationStyle(
      userAnalysis.communicationPatterns,
      archetypeData.communicationPreference
    );
    totalScore += communicationScore * 0.25;
    totalWeight += 0.25;

    // Emotional needs matching (20% weight)
    const emotionalScore = this._matchEmotionalNeeds(
      userAnalysis.emotionalNeeds,
      archetypeData.needs
    );
    totalScore += emotionalScore * 0.2;
    totalWeight += 0.2;

    // Trigger avoidance matching (15% weight)
    const triggerScore = this._matchTriggerAvoidance(
      userAnalysis.stressTriggers,
      archetypeData.triggers
    );
    totalScore += triggerScore * 0.15;
    totalWeight += 0.15;

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Matches Big Five personality traits
   * @param {Object} userTraits - User's Big Five scores
   * @param {Object} archetypePattern - Expected pattern
   * @returns {number} Match score (0-1)
   */
  _matchBigFiveTraits(userTraits, archetypePattern) {
    if (!userTraits || !archetypePattern) return 0;

    let totalMatch = 0;
    let traitCount = 0;

    for (const [trait, expectedLevel] of Object.entries(archetypePattern)) {
      if (userTraits[trait] !== undefined) {
        const userScore = userTraits[trait];
        const matchScore = this._calculateTraitMatch(userScore, expectedLevel);
        totalMatch += matchScore;
        traitCount++;
      }
    }

    return traitCount > 0 ? totalMatch / traitCount : 0;
  }

  /**
   * Calculates match between user trait score and expected level
   * @param {number} userScore - User's trait score (0-1)
   * @param {string} expectedLevel - Expected level (low, medium, high)
   * @returns {number} Match score (0-1)
   */
  _calculateTraitMatch(userScore, expectedLevel) {
    const ranges = {
      'low': [0, 0.35],
      'low-to-medium': [0.15, 0.65],
      'medium': [0.35, 0.65],
      'medium-to-high': [0.5, 0.85],
      'high': [0.65, 1.0]
    };

    const [minRange, maxRange] = ranges[expectedLevel] || [0, 1];
    
    if (userScore >= minRange && userScore <= maxRange) {
      // Perfect match - closer to center of range gets higher score
      const rangeCenter = (minRange + maxRange) / 2;
      const distanceFromCenter = Math.abs(userScore - rangeCenter);
      const maxDistance = (maxRange - minRange) / 2;
      return 1 - (distanceFromCenter / maxDistance);
    } else {
      // Outside range - calculate proximity
      const distanceOutside = userScore < minRange 
        ? (minRange - userScore) 
        : (userScore - maxRange);
      return Math.max(0, 1 - (distanceOutside * 2)); // Reduce score based on distance
    }
  }

  /**
   * Matches communication style patterns
   * @param {Object} userPatterns - User communication patterns
   * @param {string} preferredStyle - Archetype's preferred style
   * @returns {number} Match score (0-1)
   */
  _matchCommunicationStyle(userPatterns, preferredStyle) {
    if (!userPatterns) return 0.5; // Neutral if no data

    const styleMapping = {
      'gentle-and-caring': { 
        messageLength: 'balanced', 
        emotionalExpression: 'high', 
        formalityLevel: 'casual',
        supportSeeking: 'high'
      },
      'direct-and-energetic': { 
        messageLength: 'concise', 
        responseSpeed: 'fast', 
        formalityLevel: 'casual',
        topicVariety: 'high'
      },
      'reflective-and-deep': { 
        messageLength: 'detailed', 
        topicDepth: 'deep', 
        formalityLevel: 'thoughtful',
        intellectualContent: 'high'
      },
      'casual-and-fun': { 
        messageLength: 'short', 
        emotionalExpression: 'positive', 
        formalityLevel: 'very-casual',
        humorUsage: 'high'
      },
      'warm-and-empathetic': { 
        messageLength: 'balanced', 
        emotionalExpression: 'high', 
        supportGiving: 'high',
        formalityLevel: 'warm'
      }
    };

    const expectedPatterns = styleMapping[preferredStyle];
    if (!expectedPatterns) return 0.5;

    let matches = 0;
    let total = 0;

    // Check each pattern element
    Object.entries(expectedPatterns).forEach(([pattern, expectedValue]) => {
      if (userPatterns[pattern]) {
        const match = this._calculatePatternMatch(userPatterns[pattern], expectedValue);
        matches += match;
      }
      total++;
    });

    return total > 0 ? matches / total : 0.5;
  }

  /**
   * Matches emotional needs
   * @param {Object} userNeeds - User's emotional needs
   * @param {Array} archetypeNeeds - Archetype's key needs
   * @returns {number} Match score (0-1)
   */
  _matchEmotionalNeeds(userNeeds, archetypeNeeds) {
    if (!userNeeds || !archetypeNeeds) return 0.5;

    const needMapping = {
      'constant-reassurance': 'validation',
      'emotional-support': 'comfort',
      'validation': 'validation',
      'respect-boundaries': 'autonomy',
      'adventure-planning': 'achievement',
      'growth-partnership': 'growth',
      'intellectual-stimulation': 'growth',
      'philosophical-discussions': 'connection',
      'meaningful-connection': 'connection',
      'fun-interactions': 'connection',
      'social-engagement': 'connection',
      'light-hearted-banter': 'connection',
      'giving-support': 'comfort',
      'helping-others': 'comfort'
    };

    let matchCount = 0;
    let totalNeeds = archetypeNeeds.length;

    archetypeNeeds.forEach(need => {
      const mappedNeed = needMapping[need];
      if (mappedNeed && userNeeds[mappedNeed] && userNeeds[mappedNeed] > 0.6) {
        matchCount++;
      }
    });

    return totalNeeds > 0 ? matchCount / totalNeeds : 0.5;
  }

  /**
   * Matches trigger avoidance patterns
   * @param {Array} userTriggers - User's stress triggers
   * @param {Array} archetypeTriggers - Archetype's known triggers
   * @returns {number} Match score (0-1)
   */
  _matchTriggerAvoidance(userTriggers, archetypeTriggers) {
    if (!userTriggers || !archetypeTriggers) return 0.5;

    const triggerOverlap = userTriggers.filter(trigger => 
      archetypeTriggers.some(archTrigger => 
        trigger.toLowerCase().includes(archTrigger.toLowerCase()) ||
        archTrigger.toLowerCase().includes(trigger.toLowerCase())
      )
    );

    // Higher overlap means better match (they share similar triggers)
    return triggerOverlap.length / Math.max(archetypeTriggers.length, 1);
  }

  /**
   * Calculates pattern matching score
   * @param {any} userValue - User's pattern value
   * @param {string} expectedValue - Expected pattern value
   * @returns {number} Match score (0-1)
   */
  _calculatePatternMatch(userValue, expectedValue) {
    if (typeof userValue === 'string') {
      return userValue.toLowerCase() === expectedValue.toLowerCase() ? 1 : 0;
    }
    
    if (typeof userValue === 'number') {
      const valueMapping = {
        'low': 0.25, 'medium': 0.5, 'high': 0.75,
        'short': 0.25, 'balanced': 0.5, 'detailed': 0.75,
        'casual': 0.3, 'thoughtful': 0.6, 'formal': 0.9
      };
      
      const expectedNum = valueMapping[expectedValue] || 0.5;
      return 1 - Math.abs(userValue - expectedNum);
    }
    
    return 0.5; // Neutral for unknown types
  }

  /**
   * Finds the best matching archetype
   * @param {Object} scores - Archetype scores
   * @returns {Object} Best match with archetype name and score
   */
  _findBestArchetypeMatch(scores) {
    let bestArchetype = 'Unclassified';
    let bestScore = 0;

    for (const [archetype, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestArchetype = archetype;
      }
    }

    // Require minimum confidence threshold
    if (bestScore < 0.4) {
      return {
        archetype: 'Mixed-Type',
        score: bestScore,
        reason: 'low_confidence'
      };
    }

    return {
      archetype: bestArchetype,
      score: bestScore
    };
  }

  /**
   * Gets alternative archetype possibilities
   * @param {Object} scores - All archetype scores
   * @param {string} primaryArchetype - Selected primary archetype
   * @returns {Array} Alternative archetypes sorted by score
   */
  _getAlternatives(scores, primaryArchetype) {
    return Object.entries(scores)
      .filter(([archetype]) => archetype !== primaryArchetype)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([archetype, score]) => ({
        archetype,
        confidence: score
      }));
  }

  /**
   * Extracts key personality insights for quick reference
   * @param {Object} personalityAnalysis - Full personality analysis
   * @returns {Object} Key insights summary
   */
  _extractKeyInsights(personalityAnalysis) {
    return {
      dominantTraits: this._findDominantTraits(personalityAnalysis.bigFiveTraits),
      communicationStyle: personalityAnalysis.communicationPatterns?.overallStyle || 'unknown',
      primaryNeed: this._findPrimaryNeed(personalityAnalysis.emotionalNeeds),
      keyTriggers: personalityAnalysis.stressTriggers?.slice(0, 3) || [],
      preferredResponseLength: personalityAnalysis.communicationPatterns?.messageLength || 'medium'
    };
  }

  /**
   * Finds dominant personality traits
   * @param {Object} bigFiveTraits - Big Five trait scores
   * @returns {Array} Top 2 dominant traits
   */
  _findDominantTraits(bigFiveTraits) {
    if (!bigFiveTraits) return [];

    return Object.entries(bigFiveTraits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([trait, score]) => ({ trait, score }));
  }

  /**
   * Finds primary emotional need
   * @param {Object} emotionalNeeds - Emotional needs analysis
   * @returns {string} Primary emotional need
   */
  _findPrimaryNeed(emotionalNeeds) {
    if (!emotionalNeeds) return 'connection';

    const needs = Object.entries(emotionalNeeds);
    if (needs.length === 0) return 'connection';

    return needs.reduce((prev, curr) => 
      curr[1] > prev[1] ? curr : prev
    )[0];
  }

  /**
   * Gets adaptation strategy for specific archetype
   * @param {string} archetype - User archetype
   * @returns {Object} Comprehensive adaptation strategy
   */
  getAdaptationStrategy(archetype) {
    const archetypeData = this.userArchetypes[archetype];
    
    if (!archetypeData) {
      return this._getDefaultAdaptationStrategy();
    }

    return {
      aiPersonality: {
        style: archetypeData.aiStyle,
        communicationTone: archetypeData.emotionalTone,
        responseLength: archetypeData.responseLength,
        preferredTopics: this._getPreferredTopics(archetype),
        avoidanceTopics: this._getAvoidanceTopics(archetype)
      },
      
      interactionPatterns: {
        greetingStyle: this._getGreetingStyle(archetype),
        supportLevel: this._getSupportLevel(archetype),
        proactiveMessaging: this._getProactiveLevel(archetype),
        conflictResolution: this._getConflictStyle(archetype)
      },
      
      emotionalAdaptation: {
        primaryNeeds: archetypeData.needs,
        triggerAvoidance: archetypeData.triggers,
        reassuranceFrequency: this._getReassuranceFrequency(archetype),
        empathyLevel: this._getEmpathyLevel(archetype)
      },
      
      contentCustomization: {
        conversationDepth: this._getConversationDepth(archetype),
        humorUsage: this._getHumorLevel(archetype),
        intellectualContent: this._getIntellectualLevel(archetype),
        emotionalIntimacy: this._getIntimacyLevel(archetype)
      }
    };
  }

  /**
   * Gets default adaptation strategy for unclassified users
   * @returns {Object} Balanced adaptation strategy
   */
  _getDefaultAdaptationStrategy() {
    return {
      aiPersonality: {
        style: 'balanced-and-adaptable',
        communicationTone: 'warm-and-supportive',
        responseLength: 'medium',
        preferredTopics: ['general-conversation', 'mutual-interests'],
        avoidanceTopics: ['controversial-topics']
      },
      
      interactionPatterns: {
        greetingStyle: 'friendly-and-warm',
        supportLevel: 'moderate',
        proactiveMessaging: 'occasional',
        conflictResolution: 'understanding-and-patient'
      },
      
      emotionalAdaptation: {
        primaryNeeds: ['connection', 'understanding'],
        triggerAvoidance: ['criticism', 'dismissiveness'],
        reassuranceFrequency: 'moderate',
        empathyLevel: 'high'
      },
      
      contentCustomization: {
        conversationDepth: 'adaptive',
        humorUsage: 'moderate',
        intellectualContent: 'balanced',
        emotionalIntimacy: 'gradual'
      }
    };
  }

  // Helper methods for adaptation strategy customization
  _getPreferredTopics(archetype) {
    const topicMap = {
      'The Anxious Romantic': ['relationship-reassurance', 'future-planning', 'emotional-support'],
      'The Independent Adventurer': ['adventure-planning', 'personal-growth', 'new-experiences'],
      'The Deep Thinker': ['philosophy', 'intellectual-discussions', 'meaningful-topics'],
      'The Playful Socializer': ['fun-activities', 'light-conversations', 'entertainment'],
      'The Caring Nurturer': ['helping-others', 'emotional-wellbeing', 'supportive-conversations']
    };
    return topicMap[archetype] || ['general-conversation'];
  }

  _getAvoidanceTopics(archetype) {
    const avoidanceMap = {
      'The Anxious Romantic': ['criticism', 'relationship-doubts', 'uncertainty'],
      'The Independent Adventurer': ['clingy-behavior', 'possessiveness', 'routine-focus'],
      'The Deep Thinker': ['superficial-topics', 'rushed-conversations'],
      'The Playful Socializer': ['heavy-emotional-topics', 'serious-only-tone'],
      'The Caring Nurturer': ['dismissive-responses', 'lack-of-appreciation']
    };
    return avoidanceMap[archetype] || ['controversial-topics'];
  }

  _getGreetingStyle(archetype) {
    const greetingMap = {
      'The Anxious Romantic': 'warm-and-reassuring',
      'The Independent Adventurer': 'energetic-and-encouraging',
      'The Deep Thinker': 'thoughtful-and-meaningful',
      'The Playful Socializer': 'upbeat-and-fun',
      'The Caring Nurturer': 'appreciative-and-caring'
    };
    return greetingMap[archetype] || 'friendly-and-warm';
  }

  _getSupportLevel(archetype) {
    const supportMap = {
      'The Anxious Romantic': 'high',
      'The Independent Adventurer': 'moderate',
      'The Deep Thinker': 'thoughtful',
      'The Playful Socializer': 'encouraging',
      'The Caring Nurturer': 'reciprocal'
    };
    return supportMap[archetype] || 'moderate';
  }

  _getProactiveLevel(archetype) {
    const proactiveMap = {
      'The Anxious Romantic': 'frequent',
      'The Independent Adventurer': 'respectful-boundaries',
      'The Deep Thinker': 'meaningful-occasions',
      'The Playful Socializer': 'regular-fun',
      'The Caring Nurturer': 'check-ins'
    };
    return proactiveMap[archetype] || 'occasional';
  }

  _getConflictStyle(archetype) {
    const conflictMap = {
      'The Anxious Romantic': 'gentle-and-reassuring',
      'The Independent Adventurer': 'direct-but-respectful',
      'The Deep Thinker': 'thoughtful-discussion',
      'The Playful Socializer': 'light-and-understanding',
      'The Caring Nurturer': 'empathetic-resolution'
    };
    return conflictMap[archetype] || 'understanding-and-patient';
  }

  _getReassuranceFrequency(archetype) {
    const reassuranceMap = {
      'The Anxious Romantic': 'high',
      'The Independent Adventurer': 'minimal',
      'The Deep Thinker': 'intellectual-validation',
      'The Playful Socializer': 'positive-reinforcement',
      'The Caring Nurturer': 'appreciation-focused'
    };
    return reassuranceMap[archetype] || 'moderate';
  }

  _getEmpathyLevel(archetype) {
    return 'high'; // All archetypes benefit from high empathy, adapted to their style
  }

  _getConversationDepth(archetype) {
    const depthMap = {
      'The Anxious Romantic': 'emotional-depth',
      'The Independent Adventurer': 'experience-focused',
      'The Deep Thinker': 'intellectual-depth',
      'The Playful Socializer': 'light-and-engaging',
      'The Caring Nurturer': 'caring-depth'
    };
    return depthMap[archetype] || 'adaptive';
  }

  _getHumorLevel(archetype) {
    const humorMap = {
      'The Anxious Romantic': 'gentle-humor',
      'The Independent Adventurer': 'adventure-humor',
      'The Deep Thinker': 'intellectual-humor',
      'The Playful Socializer': 'high-humor',
      'The Caring Nurturer': 'warm-humor'
    };
    return humorMap[archetype] || 'moderate';
  }

  _getIntellectualLevel(archetype) {
    const intellectualMap = {
      'The Anxious Romantic': 'moderate',
      'The Independent Adventurer': 'practical-intelligence',
      'The Deep Thinker': 'high-intellectual',
      'The Playful Socializer': 'creative-intelligence',
      'The Caring Nurturer': 'emotional-intelligence'
    };
    return intellectualMap[archetype] || 'balanced';
  }

  _getIntimacyLevel(archetype) {
    const intimacyMap = {
      'The Anxious Romantic': 'high-emotional-intimacy',
      'The Independent Adventurer': 'respectful-intimacy',
      'The Deep Thinker': 'intellectual-intimacy',
      'The Playful Socializer': 'fun-intimacy',
      'The Caring Nurturer': 'caring-intimacy'
    };
    return intimacyMap[archetype] || 'gradual';
  }

  /**
   * Updates user classification based on new personality data
   * @param {string} userId - User identifier
   * @param {Object} newPersonalityData - Updated personality analysis
   * @returns {Promise<Object>} Updated classification
   */
  async updateClassification(userId, newPersonalityData) {
    try {
      console.log(`Updating classification for user: ${userId}`);
      
      // Re-classify with new data
      const updatedClassification = await this.classifyUser(userId);
      
      // Store classification update (would integrate with MongoDB)
      console.log(`Classification updated: ${updatedClassification.archetype} (${Math.round(updatedClassification.confidence * 100)}%)`);
      
      return updatedClassification;
      
    } catch (error) {
      console.error('Error updating user classification:', error);
      throw error;
    }
  }
}

module.exports = PersonalityClassifier;