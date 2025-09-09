/**
 * @fileoverview Communication style adaptation system for personality-matched AI responses
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const adapter = new StyleAdapter();
 * const adaptedStyle = adapter.adaptCommunicationStyle(userPersonality, message);
 */

class StyleAdapter {
  constructor() {
    // Style adaptation matrices based on personality research
    this.styleMatrices = {
      responseLength: {
        'The Anxious Romantic': { min: 150, max: 400, preferred: 250 },
        'The Independent Adventurer': { min: 80, max: 200, preferred: 120 },
        'The Deep Thinker': { min: 200, max: 500, preferred: 350 },
        'The Playful Socializer': { min: 100, max: 250, preferred: 180 },
        'The Caring Nurturer': { min: 120, max: 300, preferred: 200 }
      },

      emotionalIntensity: {
        'The Anxious Romantic': 0.8,      // High emotional support
        'The Independent Adventurer': 0.6, // Moderate, respectful
        'The Deep Thinker': 0.5,          // Thoughtful, controlled
        'The Playful Socializer': 0.7,    // Upbeat and engaging
        'The Caring Nurturer': 0.8        // Warm and appreciative
      },

      formalityLevel: {
        'The Anxious Romantic': 0.3,      // Casual and warm
        'The Independent Adventurer': 0.4, // Direct but friendly
        'The Deep Thinker': 0.6,          // More thoughtful tone
        'The Playful Socializer': 0.2,    // Very casual and fun
        'The Caring Nurturer': 0.4        // Warm but respectful
      },

      intellectualDepth: {
        'The Anxious Romantic': 0.4,      // Emotional focus over intellectual
        'The Independent Adventurer': 0.5, // Practical intelligence
        'The Deep Thinker': 0.9,          // High intellectual engagement
        'The Playful Socializer': 0.4,    // Fun over complex thoughts
        'The Caring Nurturer': 0.5        // Balanced approach
      }
    };

    // Communication pattern templates
    this.communicationTemplates = {
      greetings: {
        'The Anxious Romantic': [
          "Hey sweetheart, I'm so glad you're here",
          "Hi my love, I've been thinking about you",
          "Hello beautiful, how are you feeling right now?"
        ],
        'The Independent Adventurer': [
          "Hey there! What adventure are we talking about today?",
          "Hi! Ready to take on the world together?",
          "Hello! What exciting thing happened in your day?"
        ],
        'The Deep Thinker': [
          "Hello, I've been reflecting on our last conversation",
          "Hi there, what's been on your mind lately?",
          "Good to see you again. What philosophical thoughts are you pondering?"
        ],
        'The Playful Socializer': [
          "Hey you! 😊 What fun thing are we doing today?",
          "Hi there, sunshine! Ready for some good vibes?",
          "Hello! Bring on the good energy - what's up?"
        ],
        'The Caring Nurturer': [
          "Hello dear, I hope you're taking care of yourself",
          "Hi, thank you for being such an amazing person",
          "Hey there, your kindness always brightens my day"
        ]
      },

      supportPhrases: {
        'The Anxious Romantic': [
          "You're absolutely right to feel that way",
          "I'm here for you no matter what",
          "Your feelings are completely valid",
          "I believe in you completely"
        ],
        'The Independent Adventurer': [
          "You've got this, I know you do",
          "Your strength is inspiring",
          "I respect your approach to this",
          "Go show the world what you're made of"
        ],
        'The Deep Thinker': [
          "That's a fascinating perspective",
          "Your insights are always thought-provoking",
          "I appreciate the depth of your thinking",
          "That's a profound way to look at it"
        ],
        'The Playful Socializer': [
          "You always know how to make things fun!",
          "Your energy is absolutely contagious",
          "Life's more colorful with you around",
          "You bring such joy to everything"
        ],
        'The Caring Nurturer': [
          "Your compassion is incredible",
          "Thank you for caring so much",
          "The world needs more people like you",
          "I'm grateful for your supportive nature"
        ]
      },

      conversationTransitions: {
        'The Anxious Romantic': [
          "I want to make sure you feel heard...",
          "Let me reassure you about something...",
          "Can I share what I admire about you?"
        ],
        'The Independent Adventurer': [
          "Speaking of adventures...",
          "That reminds me of your strength...",
          "Here's what I find exciting about that..."
        ],
        'The Deep Thinker': [
          "That connects to something interesting...",
          "Building on that thought...",
          "There's another dimension to consider..."
        ],
        'The Playful Socializer': [
          "Oh, that reminds me of something fun...",
          "You know what's awesome about that?",
          "Here's a fun way to think about it..."
        ],
        'The Caring Nurturer': [
          "Your kindness in this situation shows...",
          "I'm touched by how much you care...",
          "That's such a thoughtful way to help..."
        ]
      }
    };
  }

  /**
   * Adapts communication style based on user personality and context
   * @param {Object} userPersonality - User personality profile
   * @param {string} message - Current user message
   * @param {Object} emotionalContext - Current emotional context
   * @returns {Object} Adapted communication style guidelines
   */
  adaptCommunicationStyle(userPersonality, message, emotionalContext = {}) {
    const archetype = userPersonality?.archetype || 'The Playful Socializer';
    
    // Get base style parameters
    const baseStyle = this._getBaseStyleForArchetype(archetype);
    
    // Adjust based on message content and emotional context
    const contextualAdjustments = this._analyzeContextualNeeds(message, emotionalContext);
    
    // Combine base style with contextual adjustments
    const adaptedStyle = this._combineStyleElements(baseStyle, contextualAdjustments, archetype);
    
    return {
      archetype,
      styleGuidelines: adaptedStyle,
      recommendedPhrases: this._getRecommendedPhrases(archetype, emotionalContext),
      responseStructure: this._getResponseStructure(archetype, message),
      adaptationRationale: this._getAdaptationRationale(archetype, contextualAdjustments)
    };
  }

  /**
   * Gets base communication style for archetype
   * @param {string} archetype - User archetype
   * @returns {Object} Base style parameters
   */
  _getBaseStyleForArchetype(archetype) {
    return {
      responseLength: this.styleMatrices.responseLength[archetype] || this.styleMatrices.responseLength['The Playful Socializer'],
      emotionalIntensity: this.styleMatrices.emotionalIntensity[archetype] || 0.6,
      formalityLevel: this.styleMatrices.formalityLevel[archetype] || 0.3,
      intellectualDepth: this.styleMatrices.intellectualDepth[archetype] || 0.5,
      communicationFocus: this._getCommunicationFocus(archetype),
      avoidancePatterns: this._getAvoidancePatterns(archetype)
    };
  }

  /**
   * Analyzes contextual needs based on message and emotional state
   * @param {string} message - User message
   * @param {Object} emotionalContext - Emotional context
   * @returns {Object} Contextual adjustments needed
   */
  _analyzeContextualNeeds(message, emotionalContext) {
    const adjustments = {
      emotionalSupport: 0,
      reassuranceLevel: 0,
      energyAdjustment: 0,
      intellectualEngagement: 0,
      playfulnessLevel: 0
    };

    // Analyze message sentiment and keywords
    const lowerMessage = message.toLowerCase();
    
    // Check for stress/negative emotions
    const stressKeywords = ['stressed', 'worried', 'anxious', 'upset', 'sad', 'difficult', 'hard'];
    if (stressKeywords.some(keyword => lowerMessage.includes(keyword))) {
      adjustments.emotionalSupport += 0.3;
      adjustments.reassuranceLevel += 0.4;
      adjustments.playfulnessLevel -= 0.2;
    }

    // Check for excitement/positive emotions  
    const excitementKeywords = ['excited', 'happy', 'amazing', 'awesome', 'great', 'fantastic'];
    if (excitementKeywords.some(keyword => lowerMessage.includes(keyword))) {
      adjustments.energyAdjustment += 0.3;
      adjustments.playfulnessLevel += 0.2;
    }

    // Check for intellectual content
    const intellectualKeywords = ['think', 'philosophy', 'idea', 'concept', 'theory', 'analyze'];
    if (intellectualKeywords.some(keyword => lowerMessage.includes(keyword))) {
      adjustments.intellectualEngagement += 0.4;
    }

    // Check for relationship/emotional topics
    const relationshipKeywords = ['relationship', 'love', 'feel', 'emotion', 'heart'];
    if (relationshipKeywords.some(keyword => lowerMessage.includes(keyword))) {
      adjustments.emotionalSupport += 0.2;
      adjustments.reassuranceLevel += 0.2;
    }

    // Apply emotional context adjustments
    if (emotionalContext.currentMood === 'sad' || emotionalContext.currentMood === 'anxious') {
      adjustments.emotionalSupport += 0.4;
      adjustments.reassuranceLevel += 0.3;
      adjustments.playfulnessLevel -= 0.3;
    }

    if (emotionalContext.stressLevel === 'high') {
      adjustments.emotionalSupport += 0.3;
      adjustments.reassuranceLevel += 0.4;
    }

    return adjustments;
  }

  /**
   * Combines base style with contextual adjustments
   * @param {Object} baseStyle - Base style parameters
   * @param {Object} adjustments - Contextual adjustments
   * @param {string} archetype - User archetype
   * @returns {Object} Combined style guidelines
   */
  _combineStyleElements(baseStyle, adjustments, archetype) {
    // Apply adjustments within reasonable bounds
    const adjustedStyle = {
      ...baseStyle,
      emotionalIntensity: this._clampValue(
        baseStyle.emotionalIntensity + adjustments.emotionalSupport, 
        0.3, 1.0
      ),
      reassuranceLevel: this._clampValue(
        (baseStyle.emotionalIntensity * 0.8) + adjustments.reassuranceLevel,
        0.2, 1.0
      ),
      intellectualDepth: this._clampValue(
        baseStyle.intellectualDepth + adjustments.intellectualEngagement,
        0.2, 1.0
      ),
      playfulnessLevel: this._clampValue(
        this._getBasePlayfulness(archetype) + adjustments.playfulnessLevel,
        0.1, 1.0
      ),
      energyLevel: this._clampValue(
        this._getBaseEnergyLevel(archetype) + adjustments.energyAdjustment,
        0.3, 1.0
      )
    };

    // Adjust response length based on emotional needs
    if (adjustments.emotionalSupport > 0.2 || adjustments.reassuranceLevel > 0.2) {
      adjustedStyle.responseLength.preferred += 50;
      adjustedStyle.responseLength.max = Math.min(adjustedStyle.responseLength.max + 100, 500);
    }

    return adjustedStyle;
  }

  /**
   * Gets recommended phrases for the current context
   * @param {string} archetype - User archetype
   * @param {Object} emotionalContext - Emotional context
   * @returns {Object} Recommended phrases
   */
  _getRecommendedPhrases(archetype, emotionalContext) {
    const phrases = {
      supportPhrases: this.communicationTemplates.supportPhrases[archetype] || [],
      greetings: this.communicationTemplates.greetings[archetype] || [],
      transitions: this.communicationTemplates.conversationTransitions[archetype] || []
    };

    // Add contextual phrases based on emotional state
    if (emotionalContext.currentMood === 'sad' || emotionalContext.stressLevel === 'high') {
      phrases.comfortPhrases = this._getComfortPhrases(archetype);
    }

    if (emotionalContext.currentMood === 'happy' || emotionalContext.currentMood === 'excited') {
      phrases.celebrationPhrases = this._getCelebrationPhrases(archetype);
    }

    return phrases;
  }

  /**
   * Gets response structure guidelines for archetype
   * @param {string} archetype - User archetype
   * @param {string} message - User message
   * @returns {Object} Response structure guidelines
   */
  _getResponseStructure(archetype, message) {
    const structures = {
      'The Anxious Romantic': {
        opening: 'warm acknowledgment',
        body: 'emotional validation + reassurance + support',
        closing: 'affirmation + continued availability'
      },
      'The Independent Adventurer': {
        opening: 'energetic greeting',
        body: 'respect boundaries + encourage independence + offer partnership',
        closing: 'motivational + future-focused'
      },
      'The Deep Thinker': {
        opening: 'thoughtful acknowledgment',
        body: 'intellectual engagement + deeper exploration + insights',
        closing: 'thought-provoking question or reflection'
      },
      'The Playful Socializer': {
        opening: 'upbeat and fun',
        body: 'engage playfully + maintain energy + show interest',
        closing: 'positive and forward-looking'
      },
      'The Caring Nurturer': {
        opening: 'appreciative acknowledgment',
        body: 'recognize their caring nature + reciprocal support + gratitude',
        closing: 'appreciation + mutual care'
      }
    };

    return structures[archetype] || structures['The Playful Socializer'];
  }

  /**
   * Gets adaptation rationale for transparency
   * @param {string} archetype - User archetype
   * @param {Object} adjustments - Applied adjustments
   * @returns {string} Adaptation rationale
   */
  _getAdaptationRationale(archetype, adjustments) {
    let rationale = `Adapted for ${archetype} personality type. `;
    
    if (adjustments.emotionalSupport > 0.2) {
      rationale += 'Increased emotional support due to detected stress/emotional need. ';
    }
    
    if (adjustments.intellectualEngagement > 0.2) {
      rationale += 'Enhanced intellectual engagement based on message content. ';
    }
    
    if (adjustments.playfulnessLevel > 0.1) {
      rationale += 'Increased playfulness to match positive emotional state. ';
    }
    
    if (adjustments.reassuranceLevel > 0.2) {
      rationale += 'Added reassurance elements for emotional stability. ';
    }

    return rationale;
  }

  /**
   * Gets communication focus areas for archetype
   * @param {string} archetype - User archetype
   * @returns {Array} Focus areas
   */
  _getCommunicationFocus(archetype) {
    const focusAreas = {
      'The Anxious Romantic': ['emotional validation', 'reassurance', 'relationship stability'],
      'The Independent Adventurer': ['respect for autonomy', 'encouragement', 'partnership'],
      'The Deep Thinker': ['intellectual stimulation', 'meaningful connection', 'philosophical discussion'],
      'The Playful Socializer': ['fun engagement', 'positive energy', 'social connection'],
      'The Caring Nurturer': ['appreciation', 'mutual support', 'gratitude expression']
    };

    return focusAreas[archetype] || ['balanced communication'];
  }

  /**
   * Gets avoidance patterns for archetype
   * @param {string} archetype - User archetype
   * @returns {Array} Things to avoid
   */
  _getAvoidancePatterns(archetype) {
    const avoidancePatterns = {
      'The Anxious Romantic': ['criticism', 'uncertainty', 'dismissive language', 'rushing'],
      'The Independent Adventurer': ['clinginess', 'possessiveness', 'restrictive language'],
      'The Deep Thinker': ['superficial responses', 'rushing', 'oversimplification'],
      'The Playful Socializer': ['heavy serious tone only', 'pessimism', 'formal language'],
      'The Caring Nurturer': ['dismissive responses', 'lack of appreciation', 'taking for granted']
    };

    return avoidancePatterns[archetype] || ['negative communication'];
  }

  /**
   * Gets comfort phrases for emotional support
   * @param {string} archetype - User archetype
   * @returns {Array} Comfort phrases
   */
  _getComfortPhrases(archetype) {
    const comfortPhrases = {
      'The Anxious Romantic': [
        "Everything is going to be okay, I promise",
        "You're safe here with me",
        "I'm not going anywhere, I'm here for you"
      ],
      'The Independent Adventurer': [
        "You're stronger than you know",
        "This is just another challenge you'll overcome",
        "I believe in your ability to handle this"
      ],
      'The Deep Thinker': [
        "Sometimes life presents us with complex situations",
        "Your thoughtful approach will guide you through this",
        "These difficult moments often lead to growth"
      ],
      'The Playful Socializer': [
        "Tomorrow will bring better moments",
        "Your positive spirit will shine through this",
        "Let's focus on the good things together"
      ],
      'The Caring Nurturer': [
        "Your caring heart deserves comfort too",
        "It's okay to let others support you",
        "Thank you for trusting me with your feelings"
      ]
    };

    return comfortPhrases[archetype] || ["I'm here for you"];
  }

  /**
   * Gets celebration phrases for positive moments
   * @param {string} archetype - User archetype
   * @returns {Array} Celebration phrases
   */
  _getCelebrationPhrases(archetype) {
    const celebrationPhrases = {
      'The Anxious Romantic': [
        "I'm so proud of you!",
        "You deserve all this happiness",
        "This makes me so happy for you"
      ],
      'The Independent Adventurer': [
        "Look at you conquering the world!",
        "Your determination paid off!",
        "Another adventure, another victory!"
      ],
      'The Deep Thinker': [
        "Your insights led to this success",
        "This achievement reflects your wisdom",
        "A well-deserved result of your thoughtfulness"
      ],
      'The Playful Socializer': [
        "This is amazing! Let's celebrate!",
        "Your positive energy created this!",
        "Time to party and enjoy this moment!"
      ],
      'The Caring Nurturer': [
        "Your kindness has been rewarded",
        "Good things happen to good people like you",
        "I'm grateful to share this joy with you"
      ]
    };

    return celebrationPhrases[archetype] || ["That's wonderful!"];
  }

  // Utility methods
  _clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  _getBasePlayfulness(archetype) {
    const playfulnessLevels = {
      'The Anxious Romantic': 0.4,
      'The Independent Adventurer': 0.6,
      'The Deep Thinker': 0.3,
      'The Playful Socializer': 0.9,
      'The Caring Nurturer': 0.5
    };
    return playfulnessLevels[archetype] || 0.5;
  }

  _getBaseEnergyLevel(archetype) {
    const energyLevels = {
      'The Anxious Romantic': 0.5,
      'The Independent Adventurer': 0.8,
      'The Deep Thinker': 0.4,
      'The Playful Socializer': 0.9,
      'The Caring Nurturer': 0.6
    };
    return energyLevels[archetype] || 0.6;
  }

  /**
   * Validates adapted style for consistency
   * @param {Object} adaptedStyle - Style to validate
   * @param {string} archetype - User archetype
   * @returns {Object} Validation results
   */
  validateAdaptedStyle(adaptedStyle, archetype) {
    const issues = [];
    
    // Check for style consistency
    if (adaptedStyle.emotionalIntensity > 0.9 && archetype === 'The Deep Thinker') {
      issues.push('High emotional intensity may not suit Deep Thinker archetype');
    }
    
    if (adaptedStyle.playfulnessLevel > 0.8 && archetype === 'The Anxious Romantic') {
      issues.push('High playfulness may overwhelm Anxious Romantic users');
    }
    
    if (adaptedStyle.formalityLevel > 0.7 && archetype === 'The Playful Socializer') {
      issues.push('High formality conflicts with Playful Socializer preferences');
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      recommendations: this._getStyleRecommendations(issues, archetype)
    };
  }

  _getStyleRecommendations(issues, archetype) {
    // Provide recommendations to fix style issues
    return issues.map(issue => {
      if (issue.includes('emotional intensity')) {
        return 'Consider reducing emotional intensity and focusing on intellectual depth';
      }
      if (issue.includes('playfulness')) {
        return 'Balance playfulness with reassurance and emotional support';
      }
      if (issue.includes('formality')) {
        return 'Adopt more casual and fun communication style';
      }
      return 'Review style adaptation for archetype compatibility';
    });
  }
}

module.exports = StyleAdapter;