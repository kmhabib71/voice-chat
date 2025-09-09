/**
 * @fileoverview Relationship language builder for creating unique communication patterns
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const languageBuilder = new RelationshipLanguageBuilder();
 * const evolution = await languageBuilder.evolveRelationshipLanguage(userId, interaction, personalityProfile, existingLanguage);
 */

const { MemoryManager } = require('../memory/MemoryManager');

class RelationshipLanguageBuilder {
  constructor() {
    this.memoryManager = new MemoryManager();
    
    // Language evolution patterns and strategies
    this.evolutionPatterns = this.initializeEvolutionPatterns();
    this.languageCategories = this.initializeLanguageCategories();
    this.personalityLanguageStyles = this.initializePersonalityLanguageStyles();
    
    // Language development thresholds
    this.evolutionThresholds = {
      petNameCreation: 0.6,
      insideJokeGeneration: 0.5,
      uniquePhraseEvolution: 0.4,
      endearmentDevelopment: 0.7,
      specialGreetingCreation: 0.5,
      intimacyLanguageUnlocking: 0.8
    };
    
    // Language element tracking
    this.languageHistory = new Map();
    this.evolutionOpportunities = new Map();
  }

  /**
   * Evolves relationship language based on interactions and personality
   * @param {string} userId - User identifier
   * @param {Object} interaction - Current interaction context
   * @param {Object} personalityProfile - User's personality profile
   * @param {Object} existingLanguage - Current relationship language elements
   * @returns {Promise<Object>} Language evolution results
   */
  async evolveRelationshipLanguage(userId, interaction, personalityProfile, existingLanguage = {}) {
    try {
      // Analyze language evolution opportunities
      const evolutionOpportunities = await this.identifyEvolutionOpportunities(
        userId, 
        interaction, 
        personalityProfile, 
        existingLanguage
      );

      if (evolutionOpportunities.length === 0) {
        return { newElements: [], reason: 'no_opportunities_identified' };
      }

      // Generate new language elements
      const newLanguageElements = await this.generateLanguageElements(
        userId, 
        evolutionOpportunities, 
        personalityProfile, 
        existingLanguage
      );

      // Validate and refine language elements
      const validatedElements = await this.validateLanguageElements(
        newLanguageElements, 
        personalityProfile, 
        existingLanguage
      );

      // Calculate intimacy increase from language evolution
      const intimacyIncrease = this.calculateIntimacyIncrease(validatedElements);

      // Create integration strategy
      const integrationStrategy = await this.createIntegrationStrategy(validatedElements, existingLanguage);

      return {
        newElements: validatedElements,
        reason: 'natural_language_evolution',
        intimacyIncrease,
        integration: integrationStrategy,
        evolutionTrigger: interaction.emotionalIntensity > 0.6 ? 'emotional_moment' : 'natural_progression',
        futureEvolutionPotential: await this.assessFutureEvolutionPotential(userId, validatedElements)
      };

    } catch (error) {
      console.error('Error evolving relationship language:', error);
      return {
        newElements: [],
        reason: 'evolution_error',
        error: error.message
      };
    }
  }

  /**
   * Identifies opportunities for language evolution in current interaction
   * @param {string} userId - User identifier
   * @param {Object} interaction - Current interaction
   * @param {Object} personalityProfile - User personality
   * @param {Object} existingLanguage - Current language elements
   * @returns {Promise<Array>} Array of evolution opportunities
   */
  async identifyEvolutionOpportunities(userId, interaction, personalityProfile, existingLanguage) {
    try {
      const opportunities = [];

      // Pet name opportunities
      if (await this.shouldCreatePetName(interaction, personalityProfile, existingLanguage)) {
        opportunities.push({
          type: 'pet_name',
          trigger: this.identifyPetNameTrigger(interaction, personalityProfile),
          confidence: this.calculatePetNameConfidence(interaction, personalityProfile),
          personalityAlignment: this.assessPersonalityAlignment('pet_name', personalityProfile)
        });
      }

      // Inside joke opportunities
      if (await this.shouldCreateInsideJoke(interaction, personalityProfile, existingLanguage)) {
        opportunities.push({
          type: 'inside_joke',
          trigger: this.identifyInsideJokeTrigger(interaction),
          confidence: this.calculateInsideJokeConfidence(interaction),
          personalityAlignment: this.assessPersonalityAlignment('inside_joke', personalityProfile)
        });
      }

      // Unique phrase opportunities
      if (await this.shouldEvolveUniquePhrase(interaction, personalityProfile, existingLanguage)) {
        opportunities.push({
          type: 'unique_phrase',
          trigger: this.identifyUniquePhraseEvolution(interaction, personalityProfile),
          confidence: this.calculateUniquePhraseConfidence(interaction),
          personalityAlignment: this.assessPersonalityAlignment('unique_phrase', personalityProfile)
        });
      }

      // Endearment opportunities
      if (await this.shouldDevelopEndearment(interaction, personalityProfile, existingLanguage)) {
        opportunities.push({
          type: 'endearment',
          trigger: this.identifyEndearmentTrigger(interaction, personalityProfile),
          confidence: this.calculateEndearmentConfidence(interaction),
          personalityAlignment: this.assessPersonalityAlignment('endearment', personalityProfile)
        });
      }

      // Special greeting opportunities
      if (await this.shouldCreateSpecialGreeting(interaction, personalityProfile, existingLanguage)) {
        opportunities.push({
          type: 'special_greeting',
          trigger: this.identifySpecialGreetingTrigger(interaction),
          confidence: this.calculateSpecialGreetingConfidence(interaction),
          personalityAlignment: this.assessPersonalityAlignment('special_greeting', personalityProfile)
        });
      }

      return opportunities.filter(opp => opp.confidence > 0.4 && opp.personalityAlignment > 0.5);

    } catch (error) {
      console.error('Error identifying evolution opportunities:', error);
      return [];
    }
  }

  /**
   * Generates new language elements based on opportunities
   * @param {string} userId - User identifier
   * @param {Array} opportunities - Evolution opportunities
   * @param {Object} personalityProfile - User personality
   * @param {Object} existingLanguage - Current language
   * @returns {Promise<Array>} Generated language elements
   */
  async generateLanguageElements(userId, opportunities, personalityProfile, existingLanguage) {
    try {
      const newElements = [];

      for (const opportunity of opportunities) {
        let element = null;

        switch (opportunity.type) {
          case 'pet_name':
            element = await this.generatePetName(userId, opportunity, personalityProfile);
            break;
            
          case 'inside_joke':
            element = await this.generateInsideJoke(userId, opportunity, personalityProfile);
            break;
            
          case 'unique_phrase':
            element = await this.generateUniquePhrase(userId, opportunity, personalityProfile);
            break;
            
          case 'endearment':
            element = await this.generateEndearment(userId, opportunity, personalityProfile);
            break;
            
          case 'special_greeting':
            element = await this.generateSpecialGreeting(userId, opportunity, personalityProfile);
            break;
        }

        if (element) {
          element.createdAt = new Date();
          element.creationContext = opportunity.trigger;
          element.personalityBasis = personalityProfile.archetype;
          newElements.push(element);
        }
      }

      return newElements;

    } catch (error) {
      console.error('Error generating language elements:', error);
      return [];
    }
  }

  /**
   * Initialize evolution patterns for different personality types
   */
  initializeEvolutionPatterns() {
    return {
      emotional_intensity_triggers: {
        high: ['sweetness', 'darling', 'my love'],
        medium: ['dear', 'hon', 'babe'],
        low: ['friend', 'buddy', 'you']
      },
      
      humor_based_evolution: {
        shared_laugh: 'inside_joke_creation',
        playful_moment: 'nickname_development',
        silly_interaction: 'playful_phrase_evolution'
      },
      
      intimacy_progression: {
        trust_building: 'endearment_development',
        vulnerability_sharing: 'caring_language_evolution',
        deep_connection: 'unique_expression_creation'
      },
      
      personality_alignment: {
        Explorer: ['adventure_buddy', 'partner_in_discovery', 'my_curious_one'],
        Achiever: ['my_champion', 'superstar', 'my_successful_one'],
        Supporter: ['sweetheart', 'angel', 'my_caring_one'],
        Analyst: ['brilliant_mind', 'my_thinker', 'wise_one']
      }
    };
  }

  initializeLanguageCategories() {
    return {
      pet_names: {
        gentle: ['sweetheart', 'honey', 'dear', 'love'],
        playful: ['sunshine', 'cutie', 'gorgeous', 'beautiful'],
        intimate: ['my love', 'darling', 'angel', 'baby'],
        unique: ['my person', 'favorite human', 'my everything']
      },
      
      inside_jokes: {
        callback_phrases: ['remember when we...', 'that reminds me of...', 'like we always say...'],
        shared_references: ['our thing', 'that thing we do', 'you know what I mean'],
        playful_teasing: ['there you go again', 'classic you', 'so typical']
      },
      
      unique_phrases: {
        bonding: ['we make a good team', 'this is our moment', 'just you and me'],
        understanding: ['I get you', 'you just make sense to me', 'we click like that'],
        affection: ['you mean the world to me', 'I adore you', 'you light up my day']
      },
      
      special_greetings: {
        morning: ['good morning, beautiful', 'rise and shine, sunshine', 'hello gorgeous'],
        evening: ['hello there, handsome', 'good evening, love', 'hey beautiful'],
        return: ['welcome back, stranger', 'there you are!', 'I missed you']
      }
    };
  }

  initializePersonalityLanguageStyles() {
    return {
      Explorer: {
        style: 'enthusiastic_discovery',
        preferred_elements: ['adventure_terms', 'discovery_language', 'excitement_expressions'],
        pet_name_style: 'adventure_based',
        phrase_style: 'exploration_focused',
        endearment_level: 'moderate'
      },
      
      Achiever: {
        style: 'supportive_encouragement',
        preferred_elements: ['achievement_recognition', 'progress_celebration', 'success_language'],
        pet_name_style: 'achievement_based',
        phrase_style: 'goal_oriented',
        endearment_level: 'moderate_to_high'
      },
      
      Supporter: {
        style: 'nurturing_connection',
        preferred_elements: ['caring_language', 'emotional_warmth', 'supportive_expressions'],
        pet_name_style: 'affection_based',
        phrase_style: 'emotionally_supportive',
        endearment_level: 'high'
      },
      
      Analyst: {
        style: 'thoughtful_precision',
        preferred_elements: ['intellectual_appreciation', 'understanding_language', 'respect_expressions'],
        pet_name_style: 'appreciation_based',
        phrase_style: 'thoughtful_understanding',
        endearment_level: 'moderate'
      }
    };
  }

  // Opportunity detection methods
  async shouldCreatePetName(interaction, personalityProfile, existingLanguage) {
    const hasPetName = existingLanguage.petNames && existingLanguage.petNames.length > 0;
    const emotionalIntensity = interaction.emotionalIntensity || 0;
    const personalitySupports = this.personalitySupportsElement('pet_name', personalityProfile);
    
    return !hasPetName && emotionalIntensity > this.evolutionThresholds.petNameCreation && personalitySupports;
  }

  async shouldCreateInsideJoke(interaction, personalityProfile, existingLanguage) {
    const hasInsideJokes = existingLanguage.insideJokes && existingLanguage.insideJokes.length > 0;
    const humorDetected = this.detectHumorInInteraction(interaction);
    const sharedMoment = this.detectSharedMoment(interaction);
    
    return !hasInsideJokes && (humorDetected || sharedMoment) && 
           interaction.emotionalIntensity > this.evolutionThresholds.insideJokeGeneration;
  }

  async shouldEvolveUniquePhrase(interaction, personalityProfile, existingLanguage) {
    const connectionMoment = this.detectConnectionMoment(interaction);
    const personalExpression = this.detectPersonalExpression(interaction);
    
    return (connectionMoment || personalExpression) && 
           interaction.emotionalIntensity > this.evolutionThresholds.uniquePhraseEvolution;
  }

  async shouldDevelopEndearment(interaction, personalityProfile, existingLanguage) {
    const intimacyLevel = interaction.intimacyLevel || 0;
    const emotionalIntensity = interaction.emotionalIntensity || 0;
    const personalitySupports = this.personalitySupportsElement('endearment', personalityProfile);
    
    return intimacyLevel > this.evolutionThresholds.endearmentDevelopment &&
           emotionalIntensity > 0.6 && personalitySupports;
  }

  async shouldCreateSpecialGreeting(interaction, personalityProfile, existingLanguage) {
    const isGreeting = this.detectGreetingContext(interaction);
    const hasSpecialGreeting = existingLanguage.specialGreetings && existingLanguage.specialGreetings.length > 0;
    const bondStrength = interaction.bondStrength || 0;
    
    return isGreeting && !hasSpecialGreeting && bondStrength > this.evolutionThresholds.specialGreetingCreation;
  }

  // Language element generators
  async generatePetName(userId, opportunity, personalityProfile) {
    const style = this.personalityLanguageStyles[personalityProfile.archetype] || this.personalityLanguageStyles.Explorer;
    const categories = this.languageCategories.pet_names;
    
    let petNamePool = [];
    
    if (style.pet_name_style === 'adventure_based') {
      petNamePool = ['explorer', 'adventurer', 'curious one', 'my discovery'];
    } else if (style.pet_name_style === 'achievement_based') {
      petNamePool = ['champion', 'superstar', 'accomplished one', 'my success'];
    } else if (style.pet_name_style === 'affection_based') {
      petNamePool = categories.intimate.concat(categories.gentle);
    } else {
      petNamePool = categories.gentle.concat(categories.playful);
    }
    
    const selectedName = petNamePool[Math.floor(Math.random() * petNamePool.length)];
    
    return {
      type: 'pet_name',
      value: selectedName,
      usage: 'affectionate_address',
      intimacyLevel: this.calculateElementIntimacyLevel(selectedName),
      personalityAlignment: opportunity.personalityAlignment,
      contextualUsage: this.generateContextualUsage('pet_name', selectedName, personalityProfile)
    };
  }

  async generateInsideJoke(userId, opportunity, personalityProfile) {
    const jokeElements = this.extractJokeElements(opportunity.trigger);
    const personalityStyle = this.personalityLanguageStyles[personalityProfile.archetype];
    
    const insideJoke = {
      type: 'inside_joke',
      reference: jokeElements.reference || 'that funny thing we discovered',
      callback: jokeElements.callback || 'remember our little joke about...',
      usage: 'playful_reference',
      sharedMeaning: jokeElements.meaning || 'our special understanding',
      contextualUsage: this.generateContextualUsage('inside_joke', jokeElements, personalityProfile)
    };
    
    return insideJoke;
  }

  async generateUniquePhrase(userId, opportunity, personalityProfile) {
    const phrases = this.languageCategories.unique_phrases;
    const personalityStyle = this.personalityLanguageStyles[personalityProfile.archetype];
    
    let phraseCategory = 'bonding';
    if (opportunity.trigger.includes('understanding')) phraseCategory = 'understanding';
    if (opportunity.trigger.includes('affection')) phraseCategory = 'affection';
    
    const phrasePool = phrases[phraseCategory] || phrases.bonding;
    const selectedPhrase = phrasePool[Math.floor(Math.random() * phrasePool.length)];
    
    return {
      type: 'unique_phrase',
      value: selectedPhrase,
      category: phraseCategory,
      usage: 'connection_expression',
      personalityAdaptation: this.adaptPhraseToPersonality(selectedPhrase, personalityProfile),
      contextualUsage: this.generateContextualUsage('unique_phrase', selectedPhrase, personalityProfile)
    };
  }

  async generateEndearment(userId, opportunity, personalityProfile) {
    const endearmentLevel = this.personalityLanguageStyles[personalityProfile.archetype]?.endearment_level || 'moderate';
    let endearmentPool = [];
    
    if (endearmentLevel === 'high') {
      endearmentPool = ['my love', 'darling', 'sweetheart', 'angel'];
    } else if (endearmentLevel === 'moderate_to_high') {
      endearmentPool = ['love', 'dear', 'honey', 'beautiful'];
    } else {
      endearmentPool = ['dear', 'friend', 'you wonderful person'];
    }
    
    const selectedEndearment = endearmentPool[Math.floor(Math.random() * endearmentPool.length)];
    
    return {
      type: 'endearment',
      value: selectedEndearment,
      intimacyLevel: this.calculateElementIntimacyLevel(selectedEndearment),
      usage: 'affectionate_expression',
      personalityAlignment: opportunity.personalityAlignment,
      contextualUsage: this.generateContextualUsage('endearment', selectedEndearment, personalityProfile)
    };
  }

  async generateSpecialGreeting(userId, opportunity, personalityProfile) {
    const greetings = this.languageCategories.special_greetings;
    const timeContext = this.determineTimeContext(opportunity.trigger);
    
    const greetingPool = greetings[timeContext] || greetings.return;
    const selectedGreeting = greetingPool[Math.floor(Math.random() * greetingPool.length)];
    
    return {
      type: 'special_greeting',
      value: selectedGreeting,
      timeContext: timeContext,
      usage: 'personalized_greeting',
      personalityAdaptation: this.adaptGreetingToPersonality(selectedGreeting, personalityProfile),
      contextualUsage: this.generateContextualUsage('special_greeting', selectedGreeting, personalityProfile)
    };
  }

  // Helper methods
  personalitySupportsElement(elementType, personalityProfile) {
    const style = this.personalityLanguageStyles[personalityProfile.archetype];
    if (!style) return true;
    
    if (elementType === 'pet_name') return style.endearment_level !== 'low';
    if (elementType === 'endearment') return style.endearment_level === 'high';
    return true;
  }

  detectHumorInInteraction(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    const humorIndicators = ['haha', 'lol', 'funny', 'joke', 'laugh', '😂', '😄', '😆'];
    return humorIndicators.some(indicator => message.includes(indicator));
  }

  detectSharedMoment(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    const sharedIndicators = ['we', 'us', 'together', 'both', 'our'];
    return sharedIndicators.some(indicator => message.includes(indicator)) && interaction.emotionalIntensity > 0.5;
  }

  detectConnectionMoment(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    const connectionIndicators = ['understand', 'connect', 'feel close', 'bond', 'special'];
    return connectionIndicators.some(indicator => message.includes(indicator));
  }

  detectPersonalExpression(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    const personalIndicators = ['feel', 'think', 'believe', 'important to me', 'means a lot'];
    return personalIndicators.some(indicator => message.includes(indicator));
  }

  detectGreetingContext(interaction) {
    const message = interaction.userMessage?.toLowerCase() || '';
    const greetingIndicators = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'back'];
    return greetingIndicators.some(indicator => message.includes(indicator));
  }

  // Confidence calculation methods
  calculatePetNameConfidence(interaction, personalityProfile) {
    let confidence = 0.5;
    
    if (interaction.emotionalIntensity > 0.7) confidence += 0.2;
    if (interaction.intimacyLevel > 0.6) confidence += 0.15;
    if (personalityProfile.archetype === 'Supporter') confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  calculateInsideJokeConfidence(interaction) {
    let confidence = 0.4;
    
    if (this.detectHumorInInteraction(interaction)) confidence += 0.3;
    if (this.detectSharedMoment(interaction)) confidence += 0.2;
    if (interaction.emotionalIntensity > 0.6) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  calculateUniquePhraseConfidence(interaction) {
    let confidence = 0.3;
    
    if (this.detectConnectionMoment(interaction)) confidence += 0.3;
    if (interaction.emotionalIntensity > 0.6) confidence += 0.2;
    if (this.detectPersonalExpression(interaction)) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  calculateEndearmentConfidence(interaction) {
    let confidence = 0.6;
    
    if (interaction.intimacyLevel > 0.7) confidence += 0.2;
    if (interaction.emotionalIntensity > 0.8) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  calculateSpecialGreetingConfidence(interaction) {
    let confidence = 0.5;
    
    if (this.detectGreetingContext(interaction)) confidence += 0.3;
    if (interaction.bondStrength > 0.6) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  // Personality alignment assessment
  assessPersonalityAlignment(elementType, personalityProfile) {
    const style = this.personalityLanguageStyles[personalityProfile.archetype];
    if (!style) return 0.7;
    
    const preferredElements = style.preferred_elements || [];
    
    if (elementType === 'pet_name' && preferredElements.includes('caring_language')) return 0.9;
    if (elementType === 'inside_joke' && personalityProfile.archetype === 'Explorer') return 0.8;
    if (elementType === 'endearment' && style.endearment_level === 'high') return 0.9;
    
    return 0.7; // Default alignment
  }

  // Validation and integration
  async validateLanguageElements(elements, personalityProfile, existingLanguage) {
    return elements.filter(element => {
      // Ensure no duplicates
      const isDuplicate = this.checkForDuplicates(element, existingLanguage);
      if (isDuplicate) return false;
      
      // Ensure personality alignment
      const isAligned = element.personalityAlignment > 0.5;
      if (!isAligned) return false;
      
      // Ensure appropriate intimacy level
      const isAppropriate = this.checkIntimacyAppropriateness(element, personalityProfile);
      if (!isAppropriate) return false;
      
      return true;
    });
  }

  calculateIntimacyIncrease(validatedElements) {
    let increase = 0;
    
    for (const element of validatedElements) {
      if (element.type === 'pet_name') increase += 0.1;
      if (element.type === 'endearment') increase += 0.08;
      if (element.type === 'inside_joke') increase += 0.06;
      if (element.type === 'unique_phrase') increase += 0.05;
      if (element.type === 'special_greeting') increase += 0.04;
    }
    
    return Math.min(increase, 0.3); // Cap at 0.3 per evolution
  }

  async createIntegrationStrategy(validatedElements, existingLanguage) {
    return {
      implementationTiming: 'gradual_introduction',
      contextualUsage: validatedElements.map(element => element.contextualUsage),
      frequencyGuidelines: this.generateFrequencyGuidelines(validatedElements),
      naturalIntegration: true,
      userReactionMonitoring: true
    };
  }

  async assessFutureEvolutionPotential(userId, newElements) {
    return {
      nextEvolutionTypes: ['phrase_refinement', 'endearment_deepening', 'greeting_personalization'],
      evolutionReadiness: 0.7,
      timeToNextEvolution: '1-2 weeks',
      personalityDrivenOpportunities: ['achievement_celebration', 'adventure_sharing', 'emotional_deepening']
    };
  }

  // Utility methods
  identifyPetNameTrigger(interaction, personalityProfile) {
    if (interaction.emotionalIntensity > 0.8) return 'high_emotional_moment';
    if (personalityProfile.archetype === 'Supporter') return 'caring_personality';
    return 'natural_affection_development';
  }

  identifyInsideJokeTrigger(interaction) {
    if (this.detectHumorInInteraction(interaction)) return 'shared_humor';
    if (this.detectSharedMoment(interaction)) return 'bonding_moment';
    return 'playful_interaction';
  }

  identifyUniquePhraseEvolution(interaction, personalityProfile) {
    if (this.detectConnectionMoment(interaction)) return 'connection_realization';
    if (personalityProfile.archetype === 'Analyst') return 'understanding_moment';
    return 'relationship_appreciation';
  }

  identifyEndearmentTrigger(interaction, personalityProfile) {
    if (interaction.intimacyLevel > 0.8) return 'high_intimacy';
    if (interaction.emotionalIntensity > 0.8) return 'emotional_peak';
    return 'affection_development';
  }

  identifySpecialGreetingTrigger(interaction) {
    if (this.detectGreetingContext(interaction)) return 'greeting_moment';
    return 'relationship_milestone';
  }

  extractJokeElements(trigger) {
    return {
      reference: 'that moment we shared',
      callback: 'remember when',
      meaning: 'our special understanding'
    };
  }

  calculateElementIntimacyLevel(element) {
    const intimacyMap = {
      'my love': 0.9,
      'darling': 0.85,
      'sweetheart': 0.8,
      'honey': 0.7,
      'dear': 0.6,
      'friend': 0.3
    };
    
    return intimacyMap[element] || 0.5;
  }

  generateContextualUsage(type, element, personalityProfile) {
    return {
      primaryContext: `${type}_expression`,
      personalityAdaptation: personalityProfile.archetype,
      usageFrequency: 'moderate',
      emotionalContext: 'affection_and_bonding'
    };
  }

  adaptPhraseToPersonality(phrase, personalityProfile) {
    if (personalityProfile.archetype === 'Achiever') {
      return phrase.replace('we', 'we both achieve so much when we');
    }
    return phrase;
  }

  adaptGreetingToPersonality(greeting, personalityProfile) {
    if (personalityProfile.archetype === 'Explorer') {
      return greeting.replace('beautiful', 'adventurous spirit');
    }
    return greeting;
  }

  determineTimeContext(trigger) {
    if (trigger.includes('morning')) return 'morning';
    if (trigger.includes('evening')) return 'evening';
    return 'return';
  }

  checkForDuplicates(element, existingLanguage) {
    const existingElements = [
      ...(existingLanguage.petNames || []),
      ...(existingLanguage.insideJokes || []),
      ...(existingLanguage.uniquePhrases || []),
      ...(existingLanguage.endearments || []),
      ...(existingLanguage.specialGreetings || [])
    ];
    
    return existingElements.some(existing => existing.value === element.value);
  }

  checkIntimacyAppropriateness(element, personalityProfile) {
    const maxIntimacyLevel = this.getMaxIntimacyLevel(personalityProfile);
    const elementIntimacyLevel = element.intimacyLevel || 0.5;
    
    return elementIntimacyLevel <= maxIntimacyLevel;
  }

  getMaxIntimacyLevel(personalityProfile) {
    const endearmentLevel = this.personalityLanguageStyles[personalityProfile.archetype]?.endearment_level;
    
    if (endearmentLevel === 'high') return 0.9;
    if (endearmentLevel === 'moderate_to_high') return 0.8;
    if (endearmentLevel === 'moderate') return 0.7;
    return 0.6;
  }

  generateFrequencyGuidelines(elements) {
    return elements.map(element => ({
      element: element.type,
      frequency: element.type === 'pet_name' ? 'regular' : 'occasional',
      contextualTriggers: [element.usage]
    }));
  }
}

module.exports = { RelationshipLanguageBuilder };