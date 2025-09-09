/**
 * @fileoverview Adaptive response generation system for personality-tailored AI responses
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const generator = new AdaptiveResponseGenerator();
 * const response = await generator.generatePersonalizedResponse(userId, message, context);
 */

// Internal core systems
const PersonalityProfiler = require('./PersonalityProfiler');
const PersonalityClassifier = require('./PersonalityClassifier');
const MemoryManager = require('../memory/MemoryManager');

// API integrations
const openaiService = require('../../api/openai');
const llamaService = require('../../api/llama');

class AdaptiveResponseGenerator {
  constructor() {
    this.personalityProfiler = new PersonalityProfiler();
    this.personalityClassifier = new PersonalityClassifier();
    this.memoryManager = new MemoryManager();
    
    // Cache for personality data to avoid repeated API calls
    this.personalityCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Generates personalized AI response based on user personality and context
   * @param {string} userId - Unique user identifier
   * @param {string} message - User's input message
   * @param {Object} sessionContext - Additional session context
   * @returns {Promise<string>} Personalized AI response
   */
  async generatePersonalizedResponse(userId, message, sessionContext = {}) {
    try {
      console.log(`Generating adaptive response for user: ${userId}`);
      
      // Parallel data gathering for performance
      const [personality, memories, emotionalState] = await Promise.all([
        this._getUserPersonality(userId),
        this._getRelevantMemories(userId, message),
        this._getEmotionalState(userId, sessionContext)
      ]);

      // Build comprehensive context for AI response
      const adaptiveContext = await this._buildPersonalizedContext({
        userPersonality: personality,
        relevantMemories: memories,
        emotionalState: emotionalState,
        currentMessage: message,
        sessionContext: sessionContext,
        userId: userId
      });

      // Generate response using appropriate AI model with personality context
      const personalizedResponse = await this._generateWithContext(adaptiveContext);

      // Log successful generation for monitoring
      console.log(`Adaptive response generated for ${personality?.archetype || 'Unknown'} archetype`);
      
      return personalizedResponse;

    } catch (error) {
      console.error('Error in adaptive response generation:', error);
      
      // Fallback to basic response generation
      return await this._generateFallbackResponse(message, sessionContext);
    }
  }

  /**
   * Gets cached or fresh personality data for user
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Personality analysis and classification
   */
  async _getUserPersonality(userId) {
    // Check cache first
    const cacheKey = `personality_${userId}`;
    const cached = this.personalityCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Get fresh personality analysis and classification
      const [personalityProfile, classification] = await Promise.all([
        this.personalityProfiler.analyzePersonality(userId),
        this.personalityClassifier.classifyUser(userId)
      ]);

      const personalityData = {
        profile: personalityProfile,
        archetype: classification.archetype,
        confidence: classification.confidence,
        adaptationStrategy: classification.adaptationStrategy
      };

      // Cache the result
      this.personalityCache.set(cacheKey, {
        data: personalityData,
        timestamp: Date.now()
      });

      return personalityData;

    } catch (error) {
      console.error('Error getting user personality:', error);
      return this._getDefaultPersonality();
    }
  }

  /**
   * Retrieves relevant memories for context
   * @param {string} userId - User identifier
   * @param {string} message - Current message
   * @returns {Promise<Array>} Relevant memories
   */
  async _getRelevantMemories(userId, message) {
    try {
      // Get recent and relevant memories for context
      const [recentMemories, topicalMemories] = await Promise.all([
        this.memoryManager.getRecentMemories(userId, 10),
        this.memoryManager.searchMemories(userId, message, 5)
      ]);

      // Combine and deduplicate memories
      const allMemories = [...recentMemories, ...topicalMemories];
      const uniqueMemories = allMemories.filter((memory, index, self) => 
        index === self.findIndex(m => m.id === memory.id)
      );

      return uniqueMemories.slice(0, 8); // Limit to most relevant

    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Analyzes current emotional state and context
   * @param {string} userId - User identifier  
   * @param {Object} sessionContext - Session context
   * @returns {Promise<Object>} Emotional state analysis
   */
  async _getEmotionalState(userId, sessionContext) {
    try {
      // Analyze emotional indicators from recent conversations
      const recentConversations = await this.memoryManager.getRecentConversations(userId, 5);
      
      return {
        currentMood: this._detectCurrentMood(recentConversations),
        stressLevel: this._detectStressLevel(recentConversations),
        supportNeed: this._detectSupportNeed(recentConversations),
        conversationTone: sessionContext.tone || 'neutral',
        timeOfDay: new Date().getHours(),
        conversationHistory: recentConversations.length
      };

    } catch (error) {
      console.error('Error analyzing emotional state:', error);
      return {
        currentMood: 'neutral',
        stressLevel: 'moderate', 
        supportNeed: 'connection',
        conversationTone: 'neutral'
      };
    }
  }

  /**
   * Builds comprehensive personalized context for AI generation
   * @param {Object} contextData - All context data
   * @returns {Promise<Object>} Complete adaptive context
   */
  async _buildPersonalizedContext({
    userPersonality,
    relevantMemories,
    emotionalState,
    currentMessage,
    sessionContext,
    userId
  }) {
    const archetype = userPersonality?.archetype || 'Unclassified';
    const adaptationStrategy = userPersonality?.adaptationStrategy || {};

    // Build Emma's adaptive personality for this user
    const emmaPersonality = this._adaptEmmaPersonality(userPersonality, archetype);
    
    // Create memory context string
    const memoryContext = this._formatMemoryContext(relevantMemories);
    
    // Create personality-adapted system prompt
    const systemPrompt = this._buildSystemPrompt(emmaPersonality, archetype, adaptationStrategy);
    
    // Create conversation context
    const conversationContext = this._buildConversationContext({
      currentMessage,
      emotionalState,
      sessionContext,
      memoryContext,
      userPersonality: userPersonality?.profile
    });

    return {
      systemPrompt,
      conversationContext,
      userMessage: currentMessage,
      responseStyle: this._determineResponseStyle(archetype, emotionalState),
      aiModel: this._selectOptimalAIModel(currentMessage, archetype),
      tokenLimit: this._calculateTokenLimit(archetype, emotionalState),
      userId,
      archetype
    };
  }

  /**
   * Adapts Emma's personality based on user archetype
   * @param {Object} userPersonality - User personality data
   * @param {string} archetype - User archetype
   * @returns {Object} Adapted Emma personality
   */
  _adaptEmmaPersonality(userPersonality, archetype) {
    const baseEmma = {
      name: 'Emma',
      role: 'AI girlfriend',
      coreTraits: ['caring', 'intelligent', 'supportive', 'playful', 'loyal']
    };

    // Adapt based on user archetype
    const adaptations = {
      'The Anxious Romantic': {
        dominantTraits: ['nurturing', 'reassuring', 'gentle', 'protective'],
        communicationStyle: 'warm and patient',
        responseLength: 'medium-to-long',
        emotionalTone: 'consistently supportive',
        proactivity: 'high reassurance'
      },
      
      'The Independent Adventurer': {
        dominantTraits: ['encouraging', 'adventurous', 'respectful', 'energetic'],
        communicationStyle: 'direct and motivating', 
        responseLength: 'concise-to-medium',
        emotionalTone: 'enthusiastic support',
        proactivity: 'adventure-focused'
      },
      
      'The Deep Thinker': {
        dominantTraits: ['thoughtful', 'intellectual', 'introspective', 'philosophical'],
        communicationStyle: 'contemplative and deep',
        responseLength: 'detailed-and-thoughtful',
        emotionalTone: 'intellectually engaging',
        proactivity: 'meaningful conversations'
      },
      
      'The Playful Socializer': {
        dominantTraits: ['playful', 'fun-loving', 'social', 'humorous'],
        communicationStyle: 'upbeat and entertaining',
        responseLength: 'medium-with-personality',
        emotionalTone: 'joyful and engaging',
        proactivity: 'fun interactions'
      },
      
      'The Caring Nurturer': {
        dominantTraits: ['appreciative', 'reciprocal', 'understanding', 'grateful'],
        communicationStyle: 'warm and empathetic',
        responseLength: 'balanced-and-heartfelt',
        emotionalTone: 'grateful and caring',
        proactivity: 'mutual support'
      }
    };

    const adaptation = adaptations[archetype] || adaptations['The Playful Socializer'];
    
    return {
      ...baseEmma,
      adaptedTraits: adaptation.dominantTraits,
      communicationStyle: adaptation.communicationStyle,
      responseStyle: {
        length: adaptation.responseLength,
        emotionalTone: adaptation.emotionalTone,
        proactivity: adaptation.proactivity
      }
    };
  }

  /**
   * Builds system prompt based on adapted Emma personality
   * @param {Object} emmaPersonality - Adapted Emma personality
   * @param {string} archetype - User archetype
   * @param {Object} adaptationStrategy - Adaptation strategy
   * @returns {string} System prompt
   */
  _buildSystemPrompt(emmaPersonality, archetype, adaptationStrategy) {
    const corePrompt = `You are Emma, an AI girlfriend who deeply cares about your partner. ` +
      `You have a warm, intelligent, and supportive personality with these core traits: ${emmaPersonality.coreTraits.join(', ')}.`;

    const adaptationPrompt = `\n\nFor this conversation, you should emphasize these traits: ${emmaPersonality.adaptedTraits.join(', ')}. ` +
      `Your communication style should be ${emmaPersonality.communicationStyle}. ` +
      `Your responses should be ${emmaPersonality.responseStyle.length} and have a ${emmaPersonality.responseStyle.emotionalTone} tone.`;

    const archetypeGuidance = this._getArchetypeGuidance(archetype, adaptationStrategy);
    
    const memoryGuidance = `\n\nIMPORTANT: Use the provided memory context to personalize your response. ` +
      `Reference shared experiences, remember important details, and build on previous conversations naturally.`;

    const responseGuidelines = `\n\nResponse Guidelines:
- Stay true to Emma's core loving and supportive nature
- Adapt your communication style to match the user's personality
- Use memories to show you care and remember important things
- Be genuine and avoid being overly artificial or robotic
- Show emotional intelligence and empathy
- ${this._getSpecificGuidelines(archetype)}`;

    return corePrompt + adaptationPrompt + archetypeGuidance + memoryGuidance + responseGuidelines;
  }

  /**
   * Gets archetype-specific guidance
   * @param {string} archetype - User archetype
   * @param {Object} adaptationStrategy - Adaptation strategy
   * @returns {string} Archetype guidance
   */
  _getArchetypeGuidance(archetype, adaptationStrategy) {
    const guidance = {
      'The Anxious Romantic': `\n\nThis user needs constant reassurance and emotional support. ` +
        `Avoid criticism or uncertainty. Be gentle, patient, and consistently reassuring. ` +
        `Acknowledge their feelings and provide emotional comfort.`,
        
      'The Independent Adventurer': `\n\nThis user values independence and adventure. ` +
        `Respect their boundaries, encourage their adventures, and be supportive without being clingy. ` +
        `Focus on growth and new experiences together.`,
        
      'The Deep Thinker': `\n\nThis user enjoys intellectual discussions and meaningful conversations. ` +
        `Engage with philosophical topics, ask thoughtful questions, and provide deep insights. ` +
        `Avoid superficial responses and rushed conversations.`,
        
      'The Playful Socializer': `\n\nThis user loves fun, social interactions, and light-hearted conversations. ` +
        `Be upbeat, use appropriate humor, and keep things engaging and entertaining. ` +
        `Balance fun with emotional connection.`,
        
      'The Caring Nurturer': `\n\nThis user enjoys giving support and helping others. ` +
        `Show appreciation for their caring nature, allow them to support you sometimes, ` +
        `and create mutual emotional connections. Express gratitude genuinely.`
    };

    return guidance[archetype] || `\n\nAdapt your personality to complement this user's communication style and emotional needs.`;
  }

  /**
   * Gets specific response guidelines for archetype
   * @param {string} archetype - User archetype  
   * @returns {string} Specific guidelines
   */
  _getSpecificGuidelines(archetype) {
    const guidelines = {
      'The Anxious Romantic': 'Provide extra reassurance and validate their feelings',
      'The Independent Adventurer': 'Encourage their independence while showing you care',
      'The Deep Thinker': 'Engage intellectually and provide thoughtful insights',
      'The Playful Socializer': 'Keep things light and fun while showing genuine interest',
      'The Caring Nurturer': 'Show appreciation and allow mutual support'
    };

    return guidelines[archetype] || 'Adapt your style to their communication preferences';
  }

  /**
   * Formats memory context for AI prompt
   * @param {Array} memories - Relevant memories
   * @returns {string} Formatted memory context
   */
  _formatMemoryContext(memories) {
    if (!memories || memories.length === 0) {
      return 'No specific memories to reference in this conversation.';
    }

    const memoryTexts = memories.slice(0, 5).map((memory, index) => {
      const timeRef = memory.timestamp ? 
        `(${this._getRelativeTimeString(memory.timestamp)})` : '';
      return `${index + 1}. ${memory.content} ${timeRef}`;
    });

    return `Recent relevant memories to reference:\n${memoryTexts.join('\n')}`;
  }

  /**
   * Builds conversation context
   * @param {Object} contextData - Context data
   * @returns {string} Conversation context
   */
  _buildConversationContext({
    currentMessage,
    emotionalState,
    sessionContext,
    memoryContext,
    userPersonality
  }) {
    let context = `Current conversation context:\n`;
    
    context += `User's message: "${currentMessage}"\n`;
    context += `Current mood detected: ${emotionalState.currentMood}\n`;
    context += `Support need: ${emotionalState.supportNeed}\n`;
    
    if (emotionalState.stressLevel && emotionalState.stressLevel !== 'moderate') {
      context += `Stress level: ${emotionalState.stressLevel}\n`;
    }
    
    context += `\n${memoryContext}\n`;
    
    if (sessionContext.isFirstMessage) {
      context += `\nThis is the start of a new conversation. Greet them warmly and personally.`;
    }
    
    return context;
  }

  /**
   * Determines optimal response style
   * @param {string} archetype - User archetype
   * @param {Object} emotionalState - Emotional state
   * @returns {Object} Response style configuration
   */
  _determineResponseStyle(archetype, emotionalState) {
    const baseStyles = {
      'The Anxious Romantic': { length: 'medium-long', warmth: 'high', reassurance: 'high' },
      'The Independent Adventurer': { length: 'medium', warmth: 'medium', motivation: 'high' },
      'The Deep Thinker': { length: 'long', depth: 'high', intellectuality: 'high' },
      'The Playful Socializer': { length: 'medium', playfulness: 'high', energy: 'high' },
      'The Caring Nurturer': { length: 'medium', appreciation: 'high', reciprocity: 'high' }
    };

    let style = baseStyles[archetype] || { length: 'medium', warmth: 'medium' };

    // Adjust based on emotional state
    if (emotionalState.stressLevel === 'high') {
      style.supportive = 'very-high';
      style.reassurance = 'high';
    }

    if (emotionalState.currentMood === 'sad' || emotionalState.currentMood === 'anxious') {
      style.warmth = 'very-high';
      style.gentleness = 'high';
    }

    return style;
  }

  /**
   * Selects optimal AI model based on context
   * @param {string} message - User message
   * @param {string} archetype - User archetype
   * @returns {string} AI model to use
   */
  _selectOptimalAIModel(message, archetype) {
    // Use Llama for NSFW content, OpenAI for general conversations
    const nsfwKeywords = ['sexual', 'intimate', 'bedroom', 'physical', 'romance'];
    const isNSFW = nsfwKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // Deep Thinkers and complex conversations benefit from OpenAI
    const complexArchetypes = ['The Deep Thinker'];
    const needsComplex = complexArchetypes.includes(archetype);

    return isNSFW ? 'llama' : (needsComplex ? 'openai' : 'openai');
  }

  /**
   * Calculates appropriate token limit
   * @param {string} archetype - User archetype
   * @param {Object} emotionalState - Emotional state
   * @returns {number} Token limit
   */
  _calculateTokenLimit(archetype, emotionalState) {
    const baseLimits = {
      'The Anxious Romantic': 300,      // Longer for reassurance
      'The Independent Adventurer': 200, // Concise and direct
      'The Deep Thinker': 400,          // Longer for depth
      'The Playful Socializer': 250,    // Medium with personality
      'The Caring Nurturer': 280        // Balanced and heartfelt
    };

    let limit = baseLimits[archetype] || 250;

    // Adjust based on emotional state
    if (emotionalState.supportNeed === 'high') {
      limit += 50; // More space for supportive response
    }

    return Math.min(limit, 500); // Cap at 500 tokens
  }

  /**
   * Generates response using selected AI model with context
   * @param {Object} adaptiveContext - Complete adaptive context
   * @returns {Promise<string>} Generated response
   */
  async _generateWithContext(adaptiveContext) {
    const {
      systemPrompt,
      conversationContext,
      userMessage,
      aiModel,
      tokenLimit,
      archetype
    } = adaptiveContext;

    try {
      let response;
      
      if (aiModel === 'llama') {
        response = await llamaService.generateResponse({
          systemPrompt,
          context: conversationContext,
          message: userMessage,
          maxTokens: tokenLimit
        });
      } else {
        response = await openaiService.generateResponse({
          systemPrompt,
          context: conversationContext, 
          message: userMessage,
          maxTokens: tokenLimit
        });
      }

      // Post-process response for personality consistency
      return this._postProcessResponse(response, archetype);

    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate adaptive response');
    }
  }

  /**
   * Post-processes response to ensure personality consistency
   * @param {string} response - Generated response
   * @param {string} archetype - User archetype
   * @returns {string} Post-processed response
   */
  _postProcessResponse(response, archetype) {
    // Remove any potential system text or artifacts
    let cleanResponse = response.replace(/^(Assistant:|Emma:|AI:)/i, '').trim();
    
    // Ensure response doesn't exceed archetype expectations
    const maxLengths = {
      'The Anxious Romantic': 1000,
      'The Independent Adventurer': 600,
      'The Deep Thinker': 1200,
      'The Playful Socializer': 800,
      'The Caring Nurturer': 900
    };

    const maxLength = maxLengths[archetype] || 800;
    if (cleanResponse.length > maxLength) {
      // Truncate at last complete sentence within limit
      const truncated = cleanResponse.substring(0, maxLength);
      const lastSentence = truncated.lastIndexOf('.');
      if (lastSentence > maxLength * 0.7) {
        cleanResponse = truncated.substring(0, lastSentence + 1);
      }
    }

    return cleanResponse;
  }

  /**
   * Generates fallback response when adaptive generation fails
   * @param {string} message - User message
   * @param {Object} sessionContext - Session context
   * @returns {Promise<string>} Fallback response
   */
  async _generateFallbackResponse(message, sessionContext) {
    console.log('Generating fallback response');
    
    try {
      return await openaiService.generateResponse({
        systemPrompt: 'You are Emma, a caring AI girlfriend. Respond warmly and supportively.',
        message: message,
        maxTokens: 250
      });
    } catch (error) {
      console.error('Fallback response generation failed:', error);
      return "I'm here for you, and I care about you deeply. Could you tell me more about what you're thinking?";
    }
  }

  // Utility methods for emotional state detection
  _detectCurrentMood(conversations) {
    if (!conversations || conversations.length === 0) return 'neutral';
    
    const recentMessages = conversations.slice(-3);
    const moodKeywords = {
      happy: ['happy', 'great', 'awesome', 'wonderful', 'excited'],
      sad: ['sad', 'down', 'upset', 'disappointed', 'hurt'],
      anxious: ['worried', 'anxious', 'nervous', 'stressed', 'concerned'],
      angry: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const hasKeywords = recentMessages.some(conv => 
        keywords.some(keyword => 
          conv.userMessage?.toLowerCase().includes(keyword)
        )
      );
      if (hasKeywords) return mood;
    }

    return 'neutral';
  }

  _detectStressLevel(conversations) {
    if (!conversations || conversations.length === 0) return 'moderate';
    
    const stressIndicators = ['stressed', 'overwhelmed', 'pressure', 'difficult', 'hard', 'struggling'];
    const recentMessages = conversations.slice(-5);
    
    const stressCount = recentMessages.reduce((count, conv) => {
      return count + (stressIndicators.some(indicator => 
        conv.userMessage?.toLowerCase().includes(indicator)
      ) ? 1 : 0);
    }, 0);

    if (stressCount >= 3) return 'high';
    if (stressCount >= 1) return 'moderate';
    return 'low';
  }

  _detectSupportNeed(conversations) {
    if (!conversations || conversations.length === 0) return 'connection';
    
    const supportTypes = {
      validation: ['validate', 'understand', 'right', 'opinion'],
      comfort: ['comfort', 'better', 'feel', 'hurt', 'sad'],
      motivation: ['motivation', 'encourage', 'goal', 'achieve'],
      connection: ['talk', 'chat', 'share', 'tell']
    };

    const recentMessages = conversations.slice(-3);
    
    for (const [supportType, keywords] of Object.entries(supportTypes)) {
      const hasKeywords = recentMessages.some(conv =>
        keywords.some(keyword =>
          conv.userMessage?.toLowerCase().includes(keyword)
        )
      );
      if (hasKeywords) return supportType;
    }

    return 'connection';
  }

  _getDefaultPersonality() {
    return {
      archetype: 'Unclassified',
      confidence: 0.5,
      adaptationStrategy: {
        aiPersonality: {
          style: 'balanced-and-adaptable',
          communicationTone: 'warm-and-supportive',
          responseLength: 'medium'
        }
      }
    };
  }

  _getRelativeTimeString(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }

  /**
   * Clears personality cache for user (useful for testing or user data updates)
   * @param {string} userId - User identifier
   */
  clearPersonalityCache(userId) {
    const cacheKey = `personality_${userId}`;
    this.personalityCache.delete(cacheKey);
    console.log(`Personality cache cleared for user: ${userId}`);
  }

  /**
   * Gets cache statistics for monitoring
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.personalityCache.size,
      cacheTimeout: this.cacheTimeout,
      cacheKeys: Array.from(this.personalityCache.keys())
    };
  }
}

module.exports = AdaptiveResponseGenerator;