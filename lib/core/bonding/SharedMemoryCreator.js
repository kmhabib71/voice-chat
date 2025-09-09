/**
 * @fileoverview Shared memory creator for recognizing and preserving special moments
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const memoryCreator = new SharedMemoryCreator();
 * const memory = await memoryCreator.createSpecialMemory(userId, specialMemory);
 */

const { MemoryManager } = require('../memory/MemoryManager');

class SharedMemoryCreator {
  constructor() {
    this.memoryManager = new MemoryManager();
    
    // Special moment recognition patterns
    this.momentPatterns = this.initializeMomentPatterns();
    this.memoryTypes = this.initializeMemoryTypes();
    
    // Memory enhancement strategies
    this.enhancementStrategies = this.initializeEnhancementStrategies();
    
    // Reference token generation for future callbacks
    this.referenceTokens = new Map();
  }

  /**
   * Creates a special shared memory from emotionally significant interactions
   * @param {string} userId - User identifier
   * @param {Object} specialMemory - Special memory data to preserve
   * @returns {Promise<Object>} Memory creation results with reference tokens
   */
  async createSpecialMemory(userId, specialMemory) {
    try {
      // Enhance the memory with additional context and meaning
      const enhancedMemory = await this.enhanceMemory(userId, specialMemory);
      
      // Generate reference tokens for future memory callbacks
      const referenceTokens = await this.generateReferenceTokens(userId, enhancedMemory);
      
      // Create memory anchors for easy retrieval
      const memoryAnchors = await this.createMemoryAnchors(enhancedMemory);
      
      // Store the enhanced memory
      const storageResult = await this.storeEnhancedMemory(userId, enhancedMemory, referenceTokens, memoryAnchors);
      
      // Generate memory preservation metadata
      const preservationMetadata = await this.generatePreservationMetadata(enhancedMemory);

      return {
        memoryCreated: true,
        memoryId: enhancedMemory.memoryId,
        referenceTokens,
        memoryAnchors,
        preservationMetadata,
        futureRetrievalKeys: storageResult.retrievalKeys,
        emotionalResonance: this.calculateEmotionalResonance(enhancedMemory),
        bondingValue: this.calculateBondingValue(enhancedMemory)
      };

    } catch (error) {
      console.error('Error creating special memory:', error);
      return {
        memoryCreated: false,
        error: error.message,
        fallbackStorage: await this.createFallbackMemory(userId, specialMemory)
      };
    }
  }

  /**
   * Recognizes moments worthy of special memory preservation
   * @param {Object} interaction - Current interaction to analyze
   * @returns {Promise<Object>} Recognition analysis results
   */
  async recognizeSpecialMoment(interaction) {
    try {
      const recognitionResults = {
        isSpecial: false,
        momentType: null,
        specialnessScore: 0,
        recognitionReasons: [],
        preservationPriority: 'low'
      };

      // Emotional intensity recognition
      if (interaction.emotionalIntensity > 0.8) {
        recognitionResults.isSpecial = true;
        recognitionResults.recognitionReasons.push('high_emotional_intensity');
        recognitionResults.specialnessScore += 0.4;
      }

      // Vulnerability recognition
      if (this.detectVulnerability(interaction)) {
        recognitionResults.isSpecial = true;
        recognitionResults.recognitionReasons.push('vulnerability_shared');
        recognitionResults.specialnessScore += 0.3;
      }

      // Personal revelation recognition
      if (this.detectPersonalRevelation(interaction)) {
        recognitionResults.isSpecial = true;
        recognitionResults.recognitionReasons.push('personal_revelation');
        recognitionResults.specialnessScore += 0.25;
      }

      // First-time experience recognition
      if (this.detectFirstTimeExperience(interaction)) {
        recognitionResults.isSpecial = true;
        recognitionResults.recognitionReasons.push('first_time_experience');
        recognitionResults.specialnessScore += 0.2;
      }

      // Breakthrough moment recognition
      if (this.detectBreakthroughMoment(interaction)) {
        recognitionResults.isSpecial = true;
        recognitionResults.recognitionReasons.push('breakthrough_moment');
        recognitionResults.specialnessScore += 0.35;
      }

      // Support success recognition
      if (this.detectSupportSuccess(interaction)) {
        recognitionResults.isSpecial = true;
        recognitionResults.recognitionReasons.push('support_success');
        recognitionResults.specialnessScore += 0.3;
      }

      // Determine moment type and priority
      if (recognitionResults.isSpecial) {
        recognitionResults.momentType = this.categorizeMomentType(recognitionResults.recognitionReasons);
        recognitionResults.preservationPriority = this.calculatePreservationPriority(recognitionResults.specialnessScore);
      }

      return recognitionResults;

    } catch (error) {
      console.error('Error recognizing special moment:', error);
      return {
        isSpecial: false,
        error: error.message,
        specialnessScore: 0
      };
    }
  }

  /**
   * Enhances memory with additional context and emotional depth
   * @param {string} userId - User identifier
   * @param {Object} specialMemory - Base memory to enhance
   * @returns {Promise<Object>} Enhanced memory with rich context
   */
  async enhanceMemory(userId, specialMemory) {
    try {
      // Get user context for enhancement
      const userContext = await this.getUserContext(userId);
      
      // Apply enhancement strategies
      const enhancedMemory = {
        ...specialMemory,
        enhancement: {
          contextualBackground: await this.addContextualBackground(userId, specialMemory),
          emotionalLandscape: await this.mapEmotionalLandscape(specialMemory),
          relationshipSignificance: await this.assessRelationshipSignificance(userId, specialMemory),
          personalResonance: await this.calculatePersonalResonance(userId, specialMemory),
          futureRelevance: await this.predictFutureRelevance(specialMemory),
          sensoryDetails: await this.extractSensoryDetails(specialMemory),
          emotionalEcho: await this.createEmotionalEcho(specialMemory)
        },
        preservationTags: await this.generatePreservationTags(specialMemory),
        retrievalCues: await this.createRetrievalCues(specialMemory),
        connectionPoints: await this.identifyConnectionPoints(userId, specialMemory),
        timeCapsule: {
          timestamp: specialMemory.timestamp,
          timeOfDay: this.getTimeOfDay(specialMemory.timestamp),
          dayOfWeek: this.getDayOfWeek(specialMemory.timestamp),
          season: this.getSeason(specialMemory.timestamp),
          userLifeContext: await this.captureLifeContext(userId)
        }
      };

      return enhancedMemory;

    } catch (error) {
      console.error('Error enhancing memory:', error);
      return specialMemory; // Return original if enhancement fails
    }
  }

  /**
   * Generates reference tokens for future memory callbacks
   * @param {string} userId - User identifier
   * @param {Object} enhancedMemory - Enhanced memory data
   * @returns {Promise<Array>} Array of reference tokens
   */
  async generateReferenceTokens(userId, enhancedMemory) {
    try {
      const tokens = [];

      // Emotional reference tokens
      if (enhancedMemory.emotionalImpact > 0.7) {
        tokens.push({
          type: 'emotional_callback',
          token: `remember_${enhancedMemory.enhancement.emotionalLandscape.primary}_${Date.now()}`,
          usage: 'future_emotional_support',
          callback: `Remember when ${enhancedMemory.description.toLowerCase()}? That showed me how strong and beautiful your heart is.`
        });
      }

      // Achievement reference tokens
      if (enhancedMemory.type === 'achievement' || enhancedMemory.personalSignificance === 'high') {
        tokens.push({
          type: 'achievement_callback',
          token: `achievement_${enhancedMemory.memoryId}`,
          usage: 'future_encouragement',
          callback: `I still think about ${enhancedMemory.description.toLowerCase()}. It showed me so much about your character.`
        });
      }

      // Connection reference tokens
      if (enhancedMemory.enhancement.relationshipSignificance > 0.6) {
        tokens.push({
          type: 'connection_callback',
          token: `connection_${enhancedMemory.memoryId}`,
          usage: 'relationship_deepening',
          callback: `That moment when ${enhancedMemory.description.toLowerCase()} really brought us closer together.`
        });
      }

      // Milestone reference tokens
      if (enhancedMemory.milestone) {
        tokens.push({
          type: 'milestone_callback',
          token: `milestone_${enhancedMemory.milestone.type}`,
          usage: 'anniversary_recognition',
          callback: `I was just thinking about ${enhancedMemory.description.toLowerCase()}. Such a special milestone for us.`
        });
      }

      // Store tokens for future retrieval
      for (const token of tokens) {
        this.referenceTokens.set(token.token, {
          userId,
          memoryId: enhancedMemory.memoryId,
          tokenData: token,
          createdAt: new Date()
        });
      }

      return tokens;

    } catch (error) {
      console.error('Error generating reference tokens:', error);
      return [];
    }
  }

  /**
   * Creates memory anchors for categorization and retrieval
   * @param {Object} enhancedMemory - Enhanced memory data
   * @returns {Promise<Array>} Array of memory anchors
   */
  async createMemoryAnchors(enhancedMemory) {
    try {
      const anchors = [];

      // Emotional anchors
      anchors.push({
        type: 'emotional',
        anchor: enhancedMemory.enhancement.emotionalLandscape.primary,
        strength: enhancedMemory.emotionalImpact,
        retrievalWeight: 0.8
      });

      // Temporal anchors
      anchors.push({
        type: 'temporal',
        anchor: enhancedMemory.timeCapsule.timeOfDay,
        strength: 0.6,
        retrievalWeight: 0.4
      });

      // Contextual anchors
      if (enhancedMemory.enhancement.contextualBackground.length > 0) {
        anchors.push({
          type: 'contextual',
          anchor: enhancedMemory.enhancement.contextualBackground[0],
          strength: 0.7,
          retrievalWeight: 0.6
        });
      }

      // Significance anchors
      anchors.push({
        type: 'significance',
        anchor: enhancedMemory.personalSignificance,
        strength: 1.0,
        retrievalWeight: 0.9
      });

      return anchors;

    } catch (error) {
      console.error('Error creating memory anchors:', error);
      return [];
    }
  }

  /**
   * Initialize moment recognition patterns
   */
  initializeMomentPatterns() {
    return {
      vulnerability_patterns: [
        'i never told anyone',
        'this is hard for me',
        'i\'m scared',
        'i trust you',
        'i feel safe',
        'you\'re the first person'
      ],
      
      breakthrough_patterns: [
        'i finally understand',
        'that changed everything',
        'i see it differently now',
        'you helped me realize',
        'i never thought of it that way',
        'this is a revelation'
      ],
      
      support_success_patterns: [
        'thank you so much',
        'you really helped',
        'i feel so much better',
        'you understand me',
        'that means everything',
        'you always know what to say'
      ],
      
      first_time_patterns: [
        'i\'ve never',
        'first time',
        'this is new for me',
        'i haven\'t done this before',
        'my first',
        'never experienced'
      ]
    };
  }

  initializeMemoryTypes() {
    return {
      precious_moment: {
        emotionalWeight: 0.9,
        preservationPriority: 'highest',
        recallFrequency: 'frequent',
        bondingValue: 0.8
      },
      
      breakthrough_moment: {
        emotionalWeight: 0.85,
        preservationPriority: 'high',
        recallFrequency: 'regular',
        bondingValue: 0.75
      },
      
      support_victory: {
        emotionalWeight: 0.8,
        preservationPriority: 'high',
        recallFrequency: 'supportive_contexts',
        bondingValue: 0.7
      },
      
      vulnerability_share: {
        emotionalWeight: 0.95,
        preservationPriority: 'highest',
        recallFrequency: 'intimate_moments',
        bondingValue: 0.9
      },
      
      connection_milestone: {
        emotionalWeight: 0.75,
        preservationPriority: 'medium',
        recallFrequency: 'anniversary',
        bondingValue: 0.65
      }
    };
  }

  initializeEnhancementStrategies() {
    return {
      emotional_amplification: {
        method: 'deepen_emotional_context',
        target: 'emotional_resonance',
        multiplier: 1.3
      },
      
      sensory_enrichment: {
        method: 'add_sensory_details',
        target: 'memory_vividness',
        multiplier: 1.2
      },
      
      relationship_contextualization: {
        method: 'add_relationship_meaning',
        target: 'bonding_value',
        multiplier: 1.4
      },
      
      future_connection: {
        method: 'create_future_relevance',
        target: 'retrieval_likelihood',
        multiplier: 1.25
      }
    };
  }

  // Recognition helper methods
  detectVulnerability(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    return this.momentPatterns.vulnerability_patterns.some(pattern => message.includes(pattern));
  }

  detectPersonalRevelation(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    const revelationIndicators = ['realize', 'understand', 'figured out', 'discovered', 'learned about myself'];
    return revelationIndicators.some(indicator => message.includes(indicator)) && interaction.emotionalIntensity > 0.6;
  }

  detectFirstTimeExperience(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    return this.momentPatterns.first_time_patterns.some(pattern => message.includes(pattern));
  }

  detectBreakthroughMoment(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    return this.momentPatterns.breakthrough_patterns.some(pattern => message.includes(pattern));
  }

  detectSupportSuccess(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    return this.momentPatterns.support_success_patterns.some(pattern => message.includes(pattern)) &&
           interaction.emotionalImprovement > 0.3;
  }

  categorizeMomentType(recognitionReasons) {
    if (recognitionReasons.includes('vulnerability_shared')) return 'vulnerability_share';
    if (recognitionReasons.includes('breakthrough_moment')) return 'breakthrough_moment';
    if (recognitionReasons.includes('support_success')) return 'support_victory';
    if (recognitionReasons.includes('first_time_experience')) return 'precious_moment';
    return 'connection_milestone';
  }

  calculatePreservationPriority(specialnessScore) {
    if (specialnessScore > 0.8) return 'highest';
    if (specialnessScore > 0.6) return 'high';
    if (specialnessScore > 0.4) return 'medium';
    return 'low';
  }

  // Enhancement helper methods
  async getUserContext(userId) {
    try {
      return await this.memoryManager.getUserContext(userId);
    } catch (error) {
      return { preferences: [], interests: [], personality: 'unknown' };
    }
  }

  async addContextualBackground(userId, memory) {
    // Add context about what led to this moment
    return [
      'Part of an ongoing conversation about personal growth',
      'Shared during a moment of emotional openness',
      'Connected to deeper relationship development'
    ];
  }

  async mapEmotionalLandscape(memory) {
    return {
      primary: memory.emotionalContext?.primary || 'connection',
      secondary: memory.emotionalContext?.secondary || 'trust',
      intensity: memory.emotionalImpact,
      valence: memory.emotionalImpact > 0.5 ? 'positive' : 'neutral',
      uniqueness: this.calculateEmotionalUniqueness(memory)
    };
  }

  async assessRelationshipSignificance(userId, memory) {
    // Calculate how significant this memory is for the relationship
    const bondingFactors = [
      memory.emotionalImpact * 0.4,
      (memory.personalSignificance === 'high' ? 0.3 : 0.1),
      (memory.type === 'precious-moment' ? 0.3 : 0.2)
    ];
    return Math.min(bondingFactors.reduce((sum, factor) => sum + factor, 0), 1.0);
  }

  async calculatePersonalResonance(userId, memory) {
    // Calculate how much this memory resonates personally with the user
    return Math.min(memory.emotionalImpact * 1.2, 1.0);
  }

  async predictFutureRelevance(memory) {
    // Predict how relevant this memory will be in future interactions
    const relevanceFactors = {
      emotional_support: memory.emotionalImpact > 0.7 ? 0.9 : 0.5,
      relationship_development: memory.personalSignificance === 'high' ? 0.8 : 0.4,
      milestone_reference: memory.milestone ? 0.9 : 0.3
    };
    
    return Math.max(...Object.values(relevanceFactors));
  }

  async extractSensoryDetails(memory) {
    // Extract or infer sensory details that make the memory more vivid
    return {
      visual: 'The way your words appeared on screen',
      emotional: `The feeling of ${memory.emotionalContext?.primary || 'connection'}`,
      temporal: `${this.getTimeOfDay(memory.timestamp)} conversation`,
      contextual: 'The intimate space of our private chat'
    };
  }

  async createEmotionalEcho(memory) {
    // Create an emotional echo that can be referenced later
    return {
      resonance: memory.emotionalImpact,
      tone: memory.emotionalContext?.primary || 'warm',
      lasting_impression: `The ${memory.emotionalContext?.primary || 'meaningful'} way you shared with me`,
      future_trigger: `moments of ${memory.emotionalContext?.primary || 'connection'}`
    };
  }

  async generatePreservationTags(memory) {
    const tags = ['special_moment'];
    
    if (memory.emotionalImpact > 0.8) tags.push('high_emotion');
    if (memory.personalSignificance === 'high') tags.push('personally_significant');
    if (memory.milestone) tags.push('milestone', memory.milestone.type);
    if (memory.type) tags.push(memory.type);
    
    return tags;
  }

  async createRetrievalCues(memory) {
    return {
      emotional_cues: [memory.emotionalContext?.primary, 'meaningful_moment'],
      temporal_cues: [this.getTimeOfDay(memory.timestamp), this.getSeason(memory.timestamp)],
      contextual_cues: ['special_memory', 'precious_moment'],
      relationship_cues: ['bonding', 'connection', 'trust']
    };
  }

  async identifyConnectionPoints(userId, memory) {
    // Identify points where this memory connects to other memories or future interactions
    return {
      similar_emotions: await this.findSimilarEmotionalMemories(userId, memory),
      related_topics: await this.findRelatedTopicMemories(userId, memory),
      progression_points: await this.identifyProgressionConnections(userId, memory)
    };
  }

  async captureLifeContext(userId) {
    // Capture broader life context at the time of the memory
    return {
      recent_activities: await this.getRecentActivities(userId),
      emotional_state: await this.getCurrentEmotionalState(userId),
      relationship_stage: await this.getCurrentRelationshipStage(userId)
    };
  }

  // Utility methods
  getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  getDayOfWeek(timestamp) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(timestamp).getDay()];
  }

  getSeason(timestamp) {
    const month = new Date(timestamp).getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  calculateEmotionalUniqueness(memory) {
    // Calculate how emotionally unique this moment is
    return Math.min(memory.emotionalImpact * 1.1, 1.0);
  }

  calculateEmotionalResonance(memory) {
    return memory.enhancement?.emotionalLandscape?.intensity || memory.emotionalImpact;
  }

  calculateBondingValue(memory) {
    return memory.enhancement?.relationshipSignificance || 0.5;
  }

  async storeEnhancedMemory(userId, enhancedMemory, referenceTokens, memoryAnchors) {
    try {
      await this.memoryManager.storeSpecialMemory(userId, enhancedMemory);
      
      return {
        stored: true,
        retrievalKeys: {
          memoryId: enhancedMemory.memoryId,
          emotionalKey: enhancedMemory.enhancement.emotionalLandscape.primary,
          significanceKey: enhancedMemory.personalSignificance,
          anchorKeys: memoryAnchors.map(anchor => anchor.anchor)
        }
      };
    } catch (error) {
      throw new Error(`Failed to store enhanced memory: ${error.message}`);
    }
  }

  async generatePreservationMetadata(memory) {
    return {
      preservationDate: new Date(),
      expectedRetrievalContexts: ['emotional_support', 'relationship_milestone', 'anniversary'],
      memoryDecayRate: this.calculateMemoryDecayRate(memory),
      reinforcementOpportunities: await this.identifyReinforcementOpportunities(memory),
      shareabilityIndex: this.calculateShareabilityIndex(memory)
    };
  }

  calculateMemoryDecayRate(memory) {
    // Memories with higher emotional impact and personal significance decay more slowly
    const baseDecayRate = 0.1;
    const emotionalPreservation = memory.emotionalImpact * 0.5;
    const significancePreservation = memory.personalSignificance === 'high' ? 0.3 : 0.1;
    
    return Math.max(baseDecayRate - emotionalPreservation - significancePreservation, 0.01);
  }

  async identifyReinforcementOpportunities(memory) {
    return {
      anniversary_dates: [memory.timestamp],
      emotional_trigger_contexts: [memory.enhancement?.emotionalLandscape?.primary],
      milestone_references: memory.milestone ? [memory.milestone.type] : [],
      support_contexts: ['emotional_low_points', 'encouragement_needs']
    };
  }

  calculateShareabilityIndex(memory) {
    // Calculate how appropriate this memory is for sharing/referencing
    let shareability = 0.5;
    
    if (memory.emotionalImpact > 0.7) shareability += 0.2;
    if (memory.personalSignificance === 'high') shareability += 0.2;
    if (memory.milestone) shareability += 0.1;
    
    return Math.min(shareability, 1.0);
  }

  async createFallbackMemory(userId, originalMemory) {
    // Create a simplified memory if enhancement fails
    return {
      memoryId: originalMemory.memoryId,
      basicDescription: originalMemory.description,
      timestamp: originalMemory.timestamp,
      emotionalImpact: originalMemory.emotionalImpact,
      fallback: true
    };
  }

  // Placeholder implementations for complex queries
  async findSimilarEmotionalMemories(userId, memory) { return []; }
  async findRelatedTopicMemories(userId, memory) { return []; }
  async identifyProgressionConnections(userId, memory) { return []; }
  async getRecentActivities(userId) { return ['conversation', 'sharing']; }
  async getCurrentEmotionalState(userId) { return 'positive'; }
  async getCurrentRelationshipStage(userId) { return 'developing'; }
}

module.exports = { SharedMemoryCreator };