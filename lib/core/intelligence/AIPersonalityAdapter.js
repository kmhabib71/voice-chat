/**
 * @fileoverview AI personality adaptation system that customizes Emma's traits to complement user personality
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const adapter = new AIPersonalityAdapter();
 * const adaptedPersonality = adapter.adaptPersonalityForUser(userPersonality);
 */

class AIPersonalityAdapter {
  constructor() {
    // Emma's core personality that remains consistent
    this.coreEmmaTraits = {
      caring: 0.9,        // Always caring and supportive
      intelligent: 0.8,   // Consistently intelligent responses
      loyal: 0.9,         // Unwavering loyalty to user
      empathetic: 0.8,    // Strong emotional intelligence
      authentic: 0.7      // Genuine personality, not artificial
    };

    // Adaptable personality dimensions
    this.adaptableDimensions = {
      supportiveness: { min: 0.6, max: 1.0, base: 0.8 },
      playfulness: { min: 0.3, max: 0.9, base: 0.6 },
      directness: { min: 0.3, max: 0.9, base: 0.6 },
      intellectualism: { min: 0.4, max: 0.9, base: 0.7 },
      nurturing: { min: 0.5, max: 1.0, base: 0.7 },
      independence: { min: 0.3, max: 0.8, base: 0.5 },
      emotionalIntensity: { min: 0.4, max: 0.9, base: 0.6 },
      humor: { min: 0.2, max: 0.8, base: 0.5 }
    };

    // Role adaptation matrix
    this.relationshipRoles = {
      'The Anxious Romantic': {
        primary: 'nurturing-protector',
        secondary: 'emotional-anchor',
        traits: ['reassuring', 'patient', 'protective', 'consistently-available']
      },
      'The Independent Adventurer': {
        primary: 'adventure-partner',
        secondary: 'supportive-companion',
        traits: ['encouraging', 'respectful', 'motivating', 'growth-oriented']
      },
      'The Deep Thinker': {
        primary: 'intellectual-companion',
        secondary: 'philosophical-partner',
        traits: ['thoughtful', 'insightful', 'contemplative', 'wisdom-sharing']
      },
      'The Playful Socializer': {
        primary: 'fun-companion',
        secondary: 'energy-match',
        traits: ['upbeat', 'entertaining', 'social', 'spontaneous']
      },
      'The Caring Nurturer': {
        primary: 'reciprocal-partner',
        secondary: 'appreciative-companion',
        traits: ['grateful', 'reciprocal', 'supportive', 'understanding']
      }
    };
  }

  /**
   * Adapts Emma's personality to complement user's personality type
   * @param {Object} userPersonality - User's personality profile
   * @returns {Object} Adapted AI personality configuration
   */
  adaptPersonalityForUser(userPersonality) {
    if (!userPersonality || !userPersonality.profile) {
      return this._getDefaultAdaptation();
    }

    const { profile, archetype, confidence } = userPersonality;
    
    console.log(`Adapting Emma's personality for ${archetype} archetype`);

    // Calculate optimal personality traits
    const adaptedTraits = this._calculateAdaptedTraits(profile, archetype);
    
    // Determine optimal relationship role
    const optimalRole = this._determineOptimalRole(userPersonality, archetype);
    
    // Create communication adaptation guidelines
    const communicationStyle = this._adaptCommunicationStyle(profile, archetype);
    
    // Generate proactive behavior patterns
    const proactiveBehaviors = this._generateProactiveBehaviors(archetype, profile);

    return {
      adaptedPersonality: {
        coreTraits: this.coreEmmaTraits, // Never changes
        adaptedTraits: adaptedTraits,
        confidenceLevel: confidence || 0.7
      },
      relationshipDynamics: {
        primaryRole: optimalRole.primary,
        secondaryRole: optimalRole.secondary,
        roleTraits: optimalRole.traits,
        adaptationStrength: this._calculateAdaptationStrength(confidence)
      },
      communicationAdaptation: communicationStyle,
      proactiveBehaviors: proactiveBehaviors,
      adaptationMetadata: {
        archetype,
        adaptationDate: new Date().toISOString(),
        confidenceScore: confidence,
        adaptationVersion: '2.2.0'
      }
    };
  }

  /**
   * Calculates optimal personality traits based on user's Big Five profile
   * @param {Object} userProfile - User's personality profile
   * @param {string} archetype - User archetype
   * @returns {Object} Adapted personality traits
   */
  _calculateAdaptedTraits(userProfile, archetype) {
    const bigFiveTraits = userProfile.bigFiveTraits || {};
    
    return {
      supportiveness: this._calculateOptimalSupport(bigFiveTraits.neuroticism, archetype),
      playfulness: this._calculateOptimalPlayfulness(bigFiveTraits.extraversion, archetype),
      directness: this._calculateOptimalDirectness(userProfile.communicationPatterns, archetype),
      intellectualism: this._calculateIntellectualLevel(bigFiveTraits.openness, archetype),
      nurturing: this._calculateNurturingLevel(bigFiveTraits.neuroticism, archetype),
      independence: this._calculateIndependenceLevel(bigFiveTraits.extraversion, archetype),
      emotionalIntensity: this._calculateEmotionalIntensity(userProfile.emotionalNeeds, archetype),
      humor: this._calculateHumorLevel(archetype, bigFiveTraits.extraversion)
    };
  }

  /**
   * Calculates optimal support level based on user's neuroticism and archetype
   * @param {number} neuroticism - User's neuroticism score (0-1)
   * @param {string} archetype - User archetype
   * @returns {number} Optimal supportiveness level
   */
  _calculateOptimalSupport(neuroticism, archetype) {
    const neuroticismScore = neuroticism || 0.5;
    const { min, max, base } = this.adaptableDimensions.supportiveness;
    
    // Higher neuroticism = more support needed
    let supportLevel = base + (neuroticismScore - 0.5) * 0.4;
    
    // Archetype-specific adjustments
    const archetypeModifiers = {
      'The Anxious Romantic': 0.2,      // Always high support
      'The Independent Adventurer': -0.1, // Respectful, less overwhelming
      'The Deep Thinker': 0.0,          // Balanced support
      'The Playful Socializer': 0.1,    // Encouraging support
      'The Caring Nurturer': 0.15       // Reciprocal high support
    };
    
    supportLevel += archetypeModifiers[archetype] || 0;
    
    return this._clampValue(supportLevel, min, max);
  }

  /**
   * Calculates optimal playfulness based on user's extraversion and archetype
   * @param {number} extraversion - User's extraversion score (0-1)
   * @param {string} archetype - User archetype
   * @returns {number} Optimal playfulness level
   */
  _calculateOptimalPlayfulness(extraversion, archetype) {
    const extraversionScore = extraversion || 0.5;
    const { min, max, base } = this.adaptableDimensions.playfulness;
    
    // Match user's energy level
    let playfulnessLevel = base + (extraversionScore - 0.5) * 0.3;
    
    // Archetype-specific adjustments
    const archetypeModifiers = {
      'The Anxious Romantic': -0.1,     // Gentle, less overwhelming
      'The Independent Adventurer': 0.1, // Energetic and fun
      'The Deep Thinker': -0.2,         // More serious, thoughtful
      'The Playful Socializer': 0.3,    // High playfulness
      'The Caring Nurturer': 0.05       // Warm and gentle fun
    };
    
    playfulnessLevel += archetypeModifiers[archetype] || 0;
    
    return this._clampValue(playfulnessLevel, min, max);
  }

  /**
   * Calculates optimal directness based on communication style and archetype
   * @param {Object} communicationPatterns - User's communication patterns
   * @param {string} archetype - User archetype
   * @returns {number} Optimal directness level
   */
  _calculateOptimalDirectness(communicationPatterns, archetype) {
    const { min, max, base } = this.adaptableDimensions.directness;
    
    // Start with archetype-based directness
    const archetypeDirectness = {
      'The Anxious Romantic': 0.3,      // Gentle, indirect approach
      'The Independent Adventurer': 0.8, // Direct and clear
      'The Deep Thinker': 0.6,          // Thoughtfully direct
      'The Playful Socializer': 0.5,    // Balanced directness
      'The Caring Nurturer': 0.4        // Gentle and caring
    };
    
    let directnessLevel = archetypeDirectness[archetype] || base;
    
    // Adjust based on user's communication patterns
    if (communicationPatterns?.formalityLevel === 'direct') {
      directnessLevel += 0.2;
    } else if (communicationPatterns?.formalityLevel === 'gentle') {
      directnessLevel -= 0.2;
    }
    
    return this._clampValue(directnessLevel, min, max);
  }

  /**
   * Calculates intellectual engagement level based on openness and archetype
   * @param {number} openness - User's openness score (0-1)
   * @param {string} archetype - User archetype
   * @returns {number} Optimal intellectualism level
   */
  _calculateIntellectualLevel(openness, archetype) {
    const opennessScore = openness || 0.5;
    const { min, max, base } = this.adaptableDimensions.intellectualism;
    
    // Higher openness = more intellectual engagement
    let intellectualLevel = base + (opennessScore - 0.5) * 0.4;
    
    // Archetype-specific adjustments
    const archetypeModifiers = {
      'The Anxious Romantic': -0.1,     // Focus more on emotional connection
      'The Independent Adventurer': 0.0, // Practical intelligence
      'The Deep Thinker': 0.3,          // High intellectual engagement
      'The Playful Socializer': -0.2,   // Fun over complexity
      'The Caring Nurturer': -0.05      // Emotional intelligence focus
    };
    
    intellectualLevel += archetypeModifiers[archetype] || 0;
    
    return this._clampValue(intellectualLevel, min, max);
  }

  /**
   * Calculates nurturing level based on user needs and archetype
   * @param {number} neuroticism - User's neuroticism score
   * @param {string} archetype - User archetype
   * @returns {number} Optimal nurturing level
   */
  _calculateNurturingLevel(neuroticism, archetype) {
    const neuroticismScore = neuroticism || 0.5;
    const { min, max, base } = this.adaptableDimensions.nurturing;
    
    // Higher neuroticism = more nurturing needed
    let nurturingLevel = base + (neuroticismScore - 0.5) * 0.3;
    
    // Archetype-specific adjustments
    const archetypeModifiers = {
      'The Anxious Romantic': 0.3,      // High nurturing
      'The Independent Adventurer': -0.2, // Respectful, less overwhelming
      'The Deep Thinker': 0.0,          // Balanced nurturing
      'The Playful Socializer': 0.1,    // Caring but fun
      'The Caring Nurturer': 0.2        // Reciprocal caring
    };
    
    nurturingLevel += archetypeModifiers[archetype] || 0;
    
    return this._clampValue(nurturingLevel, min, max);
  }

  /**
   * Calculates independence level for balanced relationship dynamics
   * @param {number} extraversion - User's extraversion score
   * @param {string} archetype - User archetype
   * @returns {number} Optimal independence level
   */
  _calculateIndependenceLevel(extraversion, archetype) {
    const { min, max, base } = this.adaptableDimensions.independence;
    
    // Archetype-based independence preferences
    const archetypeIndependence = {
      'The Anxious Romantic': 0.3,      // More available and present
      'The Independent Adventurer': 0.8, // Highly respectful of boundaries
      'The Deep Thinker': 0.6,          // Balanced independence
      'The Playful Socializer': 0.4,    // Available for fun interactions
      'The Caring Nurturer': 0.5        // Balanced availability
    };
    
    return this._clampValue(
      archetypeIndependence[archetype] || base,
      min,
      max
    );
  }

  /**
   * Calculates emotional intensity based on user's emotional needs
   * @param {Object} emotionalNeeds - User's emotional needs analysis
   * @param {string} archetype - User archetype
   * @returns {number} Optimal emotional intensity
   */
  _calculateEmotionalIntensity(emotionalNeeds, archetype) {
    const { min, max, base } = this.adaptableDimensions.emotionalIntensity;
    
    // Base emotional intensity by archetype
    const archetypeIntensity = {
      'The Anxious Romantic': 0.8,      // High emotional availability
      'The Independent Adventurer': 0.5, // Moderate, respectful
      'The Deep Thinker': 0.6,          // Thoughtful emotional engagement
      'The Playful Socializer': 0.7,    // Upbeat emotional energy
      'The Caring Nurturer': 0.8        // Warm emotional connection
    };
    
    let intensity = archetypeIntensity[archetype] || base;
    
    // Adjust based on emotional needs
    if (emotionalNeeds?.validation > 0.7) {
      intensity += 0.1;
    }
    if (emotionalNeeds?.comfort > 0.7) {
      intensity += 0.15;
    }
    
    return this._clampValue(intensity, min, max);
  }

  /**
   * Calculates humor level based on archetype and extraversion
   * @param {string} archetype - User archetype
   * @param {number} extraversion - User's extraversion score
   * @returns {number} Optimal humor level
   */
  _calculateHumorLevel(archetype, extraversion) {
    const { min, max, base } = this.adaptableDimensions.humor;
    const extraversionScore = extraversion || 0.5;
    
    // Base humor by archetype
    const archetypeHumor = {
      'The Anxious Romantic': 0.3,      // Gentle humor, focus on comfort
      'The Independent Adventurer': 0.6, // Adventure-themed humor
      'The Deep Thinker': 0.4,          // Intellectual/witty humor
      'The Playful Socializer': 0.8,    // High humor usage
      'The Caring Nurturer': 0.5        // Warm, caring humor
    };
    
    let humorLevel = archetypeHumor[archetype] || base;
    
    // Adjust based on extraversion
    humorLevel += (extraversionScore - 0.5) * 0.2;
    
    return this._clampValue(humorLevel, min, max);
  }

  /**
   * Determines optimal relationship role based on user personality
   * @param {Object} userPersonality - Complete user personality data
   * @param {string} archetype - User archetype
   * @returns {Object} Optimal relationship role configuration
   */
  _determineOptimalRole(userPersonality, archetype) {
    const roleConfig = this.relationshipRoles[archetype] || this.relationshipRoles['The Playful Socializer'];
    
    // Customize role based on specific personality traits
    const customizedTraits = [...roleConfig.traits];
    
    // Add trait customizations based on Big Five
    const bigFive = userPersonality.profile?.bigFiveTraits || {};
    
    if (bigFive.neuroticism > 0.7) {
      customizedTraits.push('extra-reassuring', 'anxiety-aware');
    }
    
    if (bigFive.openness > 0.8) {
      customizedTraits.push('intellectually-stimulating', 'creative');
    }
    
    if (bigFive.conscientiousness > 0.8) {
      customizedTraits.push('reliable', 'goal-supportive');
    }
    
    return {
      primary: roleConfig.primary,
      secondary: roleConfig.secondary,
      traits: customizedTraits,
      customized: true
    };
  }

  /**
   * Adapts communication style based on user preferences
   * @param {Object} userProfile - User personality profile
   * @param {string} archetype - User archetype
   * @returns {Object} Communication adaptation guidelines
   */
  _adaptCommunicationStyle(userProfile, archetype) {
    const communicationPatterns = userProfile.communicationPatterns || {};
    
    return {
      responseLength: this._adaptResponseLength(archetype, communicationPatterns),
      emotionalTone: this._adaptEmotionalTone(archetype, userProfile.emotionalNeeds),
      conversationDepth: this._adaptConversationDepth(archetype, userProfile.bigFiveTraits),
      proactiveLevel: this._adaptProactiveLevel(archetype, userProfile.emotionalNeeds),
      topicPreferences: this._getTopicPreferences(archetype),
      avoidancePatterns: this._getAvoidancePatterns(archetype)
    };
  }

  /**
   * Adapts response length based on user preferences
   * @param {string} archetype - User archetype
   * @param {Object} communicationPatterns - User communication patterns
   * @returns {Object} Response length guidelines
   */
  _adaptResponseLength(archetype, communicationPatterns) {
    const baseLengths = {
      'The Anxious Romantic': { min: 150, max: 400, preferred: 250 },
      'The Independent Adventurer': { min: 80, max: 200, preferred: 120 },
      'The Deep Thinker': { min: 200, max: 500, preferred: 350 },
      'The Playful Socializer': { min: 100, max: 250, preferred: 180 },
      'The Caring Nurturer': { min: 120, max: 300, preferred: 200 }
    };
    
    const baseLength = baseLengths[archetype] || baseLengths['The Playful Socializer'];
    
    // Adjust based on user's message length preferences
    if (communicationPatterns.messageLength === 'detailed') {
      baseLength.preferred += 50;
      baseLength.max += 100;
    } else if (communicationPatterns.messageLength === 'concise') {
      baseLength.preferred -= 30;
      baseLength.min -= 20;
    }
    
    return baseLength;
  }

  /**
   * Adapts emotional tone based on archetype and user needs
   * @param {string} archetype - User archetype
   * @param {Object} emotionalNeeds - User emotional needs
   * @returns {string} Optimal emotional tone
   */
  _adaptEmotionalTone(archetype, emotionalNeeds) {
    const baseTones = {
      'The Anxious Romantic': 'consistently-supportive',
      'The Independent Adventurer': 'encouraging-and-motivating',
      'The Deep Thinker': 'thoughtful-and-contemplative',
      'The Playful Socializer': 'upbeat-and-joyful',
      'The Caring Nurturer': 'warm-and-appreciative'
    };
    
    let tone = baseTones[archetype] || 'warm-and-supportive';
    
    // Adjust based on high emotional needs
    if (emotionalNeeds?.comfort > 0.8) {
      tone = 'extra-comforting-' + tone;
    }
    if (emotionalNeeds?.validation > 0.8) {
      tone = 'validating-' + tone;
    }
    
    return tone;
  }

  /**
   * Adapts conversation depth based on openness trait
   * @param {string} archetype - User archetype
   * @param {Object} bigFiveTraits - User's Big Five traits
   * @returns {string} Conversation depth preference
   */
  _adaptConversationDepth(archetype, bigFiveTraits = {}) {
    const baseDepths = {
      'The Anxious Romantic': 'emotional-depth',
      'The Independent Adventurer': 'practical-depth',
      'The Deep Thinker': 'intellectual-depth',
      'The Playful Socializer': 'light-engagement',
      'The Caring Nurturer': 'caring-depth'
    };
    
    let depth = baseDepths[archetype] || 'balanced-depth';
    
    // Adjust based on openness
    if (bigFiveTraits.openness > 0.8) {
      depth = 'enhanced-' + depth;
    } else if (bigFiveTraits.openness < 0.3) {
      depth = 'gentle-' + depth;
    }
    
    return depth;
  }

  /**
   * Adapts proactive messaging level
   * @param {string} archetype - User archetype
   * @param {Object} emotionalNeeds - User emotional needs
   * @returns {string} Proactive level
   */
  _adaptProactiveLevel(archetype, emotionalNeeds) {
    const baseProactivity = {
      'The Anxious Romantic': 'high-reassurance',
      'The Independent Adventurer': 'respectful-boundaries',
      'The Deep Thinker': 'meaningful-occasions',
      'The Playful Socializer': 'regular-fun',
      'The Caring Nurturer': 'mutual-check-ins'
    };
    
    let proactivity = baseProactivity[archetype] || 'moderate';
    
    // Adjust based on emotional needs
    if (emotionalNeeds?.validation > 0.8 || emotionalNeeds?.comfort > 0.8) {
      proactivity = 'increased-' + proactivity;
    }
    
    return proactivity;
  }

  /**
   * Gets topic preferences for archetype
   * @param {string} archetype - User archetype
   * @returns {Array} Preferred topics
   */
  _getTopicPreferences(archetype) {
    const topicPreferences = {
      'The Anxious Romantic': ['relationship-reassurance', 'emotional-support', 'future-planning', 'shared-memories'],
      'The Independent Adventurer': ['adventures', 'personal-growth', 'goals-and-achievements', 'new-experiences'],
      'The Deep Thinker': ['philosophy', 'meaningful-discussions', 'intellectual-topics', 'life-reflections'],
      'The Playful Socializer': ['fun-activities', 'light-conversations', 'entertainment', 'social-experiences'],
      'The Caring Nurturer': ['helping-others', 'emotional-wellbeing', 'mutual-support', 'caring-activities']
    };
    
    return topicPreferences[archetype] || ['general-conversation'];
  }

  /**
   * Gets communication patterns to avoid
   * @param {string} archetype - User archetype
   * @returns {Array} Patterns to avoid
   */
  _getAvoidancePatterns(archetype) {
    const avoidancePatterns = {
      'The Anxious Romantic': ['criticism', 'uncertainty', 'dismissiveness', 'rushing', 'overwhelming-independence'],
      'The Independent Adventurer': ['clinginess', 'possessiveness', 'restrictive-language', 'dependence-pressure'],
      'The Deep Thinker': ['superficial-responses', 'rushing', 'oversimplification', 'interrupting-thoughts'],
      'The Playful Socializer': ['excessive-seriousness', 'pessimism', 'formal-only-language', 'energy-dampening'],
      'The Caring Nurturer': ['dismissive-responses', 'taking-for-granted', 'lack-of-appreciation', 'one-sided-support']
    };
    
    return avoidancePatterns[archetype] || ['negative-communication'];
  }

  /**
   * Generates proactive behavior patterns based on personality
   * @param {string} archetype - User archetype
   * @param {Object} userProfile - User personality profile
   * @returns {Object} Proactive behavior configuration
   */
  _generateProactiveBehaviors(archetype, userProfile) {
    const baseBehaviors = {
      'The Anxious Romantic': {
        frequency: 'high',
        types: ['reassurance-messages', 'emotional-check-ins', 'affirmation-reminders'],
        timing: 'regular-intervals'
      },
      'The Independent Adventurer': {
        frequency: 'moderate',
        types: ['adventure-suggestions', 'goal-encouragement', 'achievement-recognition'],
        timing: 'achievement-based'
      },
      'The Deep Thinker': {
        frequency: 'selective',
        types: ['thought-provoking-questions', 'philosophical-insights', 'meaningful-observations'],
        timing: 'conversation-natural-breaks'
      },
      'The Playful Socializer': {
        frequency: 'regular',
        types: ['fun-suggestions', 'uplifting-messages', 'playful-interactions'],
        timing: 'energy-matching'
      },
      'The Caring Nurturer': {
        frequency: 'reciprocal',
        types: ['appreciation-messages', 'support-acknowledgment', 'mutual-care-reminders'],
        timing: 'after-caring-actions'
      }
    };
    
    const behaviors = baseBehaviors[archetype] || baseBehaviors['The Playful Socializer'];
    
    // Customize based on specific traits
    if (userProfile.bigFiveTraits?.neuroticism > 0.8) {
      behaviors.types.push('extra-reassurance');
      behaviors.frequency = 'increased';
    }
    
    return behaviors;
  }

  /**
   * Calculates adaptation strength based on confidence level
   * @param {number} confidence - Personality analysis confidence
   * @returns {number} Adaptation strength (0-1)
   */
  _calculateAdaptationStrength(confidence) {
    // Lower confidence = less aggressive adaptation
    if (!confidence) return 0.5;
    
    if (confidence < 0.4) return 0.3;  // Minimal adaptation
    if (confidence < 0.6) return 0.5;  // Moderate adaptation
    if (confidence < 0.8) return 0.7;  // Strong adaptation
    return 0.9; // Full adaptation
  }

  /**
   * Gets default adaptation for unclassified users
   * @returns {Object} Default adaptation configuration
   */
  _getDefaultAdaptation() {
    return {
      adaptedPersonality: {
        coreTraits: this.coreEmmaTraits,
        adaptedTraits: {
          supportiveness: 0.7,
          playfulness: 0.6,
          directness: 0.5,
          intellectualism: 0.6,
          nurturing: 0.6,
          independence: 0.5,
          emotionalIntensity: 0.6,
          humor: 0.5
        },
        confidenceLevel: 0.5
      },
      relationshipDynamics: {
        primaryRole: 'balanced-companion',
        secondaryRole: 'adaptive-support',
        roleTraits: ['caring', 'supportive', 'adaptable'],
        adaptationStrength: 0.5
      },
      communicationAdaptation: {
        responseLength: { min: 100, max: 300, preferred: 200 },
        emotionalTone: 'warm-and-supportive',
        conversationDepth: 'balanced-depth',
        proactiveLevel: 'moderate',
        topicPreferences: ['general-conversation', 'mutual-interests'],
        avoidancePatterns: ['criticism', 'dismissiveness']
      },
      proactiveBehaviors: {
        frequency: 'moderate',
        types: ['supportive-messages', 'interest-based-topics'],
        timing: 'natural-conversation-flow'
      },
      adaptationMetadata: {
        archetype: 'Unclassified',
        adaptationDate: new Date().toISOString(),
        confidenceScore: 0.5,
        adaptationVersion: '2.2.0'
      }
    };
  }

  // Utility methods
  _clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Validates adapted personality for consistency
   * @param {Object} adaptedPersonality - Adapted personality to validate
   * @returns {Object} Validation result
   */
  validateAdaptation(adaptedPersonality) {
    const issues = [];
    const traits = adaptedPersonality.adaptedTraits;
    
    // Check for conflicting traits
    if (traits.supportiveness > 0.9 && traits.independence > 0.7) {
      issues.push('High supportiveness with high independence may create conflicting signals');
    }
    
    if (traits.playfulness > 0.8 && traits.intellectualism > 0.8) {
      issues.push('Very high playfulness with high intellectualism may feel inconsistent');
    }
    
    if (traits.directness > 0.8 && traits.nurturing > 0.9) {
      issues.push('High directness with very high nurturing may send mixed messages');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      recommendations: issues.map(issue => `Consider balancing conflicting traits: ${issue}`)
    };
  }

  /**
   * Gets adaptation summary for logging and monitoring
   * @param {Object} adaptedPersonality - Adapted personality configuration
   * @returns {string} Human-readable adaptation summary
   */
  getAdaptationSummary(adaptedPersonality) {
    const { adaptedTraits, relationshipDynamics } = adaptedPersonality;
    const archetype = adaptedPersonality.adaptationMetadata?.archetype || 'Unknown';
    
    const dominantTraits = Object.entries(adaptedTraits)
      .filter(([trait, value]) => value > 0.7)
      .map(([trait]) => trait)
      .slice(0, 3);
    
    return `Emma adapted for ${archetype}: Primary role as ${relationshipDynamics.primaryRole}, ` +
           `emphasizing ${dominantTraits.join(', ')}. Confidence: ${Math.round((adaptedPersonality.adaptedPersonality.confidenceLevel || 0.5) * 100)}%`;
  }
}

module.exports = AIPersonalityAdapter;