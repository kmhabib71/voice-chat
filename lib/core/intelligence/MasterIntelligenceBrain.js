/**
 * @fileoverview Master Intelligence Brain - Coordinates all intelligence systems for human-like thinking
 * @author AI Girlfriend Project
 * @created 2025-01-28
 * 
 * @description
 * The Master Intelligence Brain coordinates all individual intelligence systems to create
 * coherent, human-like responses. This is the central processing unit that makes Emma
 * truly intelligent rather than just having good memory.
 * 
 * Intelligence Flow:
 * 1. Parallel Intelligence Analysis (6 systems)
 * 2. Intelligent Synthesis & Decision Making
 * 3. Context-Aware Response Generation
 * 4. Relationship Enhancement Processing
 * 
 * @example
 * const brain = new MasterIntelligenceBrain();
 * const response = await brain.think(userId, message, context);
 */

const PersonalityProfiler = require('./PersonalityProfiler');
const AdaptiveResponseGenerator = require('./AdaptiveResponseGenerator');
const EmotionalNeedsPredictor = require('./EmotionalNeedsPredictor');
const { ProactiveGirlfriendSystem } = require('./ProactiveGirlfriendSystem');
const ContextualEmotionAnalyzer = require('./ContextualEmotionAnalyzer');
const { ConversationFlowManager } = require('./ConversationFlowManager');
const AttachmentPsychology = require('./AttachmentPsychology');
const memoryManager = require('../memory');

class MasterIntelligenceBrain {
  constructor() {
    // Initialize all intelligence systems
    this.personalityProfiler = new PersonalityProfiler();
    this.adaptiveResponseGenerator = new AdaptiveResponseGenerator();
    this.emotionalNeedsPredictor = new EmotionalNeedsPredictor();
    this.proactiveGirlfriendSystem = new ProactiveGirlfriendSystem();
    this.contextualEmotionAnalyzer = new ContextualEmotionAnalyzer();
    this.conversationFlowManager = new ConversationFlowManager();
    this.attachmentPsychology = new AttachmentPsychology();
    
    // Performance optimization
    this.intelligenceCache = new Map(); // Cache for 5 minutes
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    console.log('🧠 Master Intelligence Brain initialized with existing systems');
  }

  /**
   * Main intelligence processing - thinks like a human using all available intelligence
   * @param {string} userId - User identifier
   * @param {string} message - User's message
   * @param {Object} context - Conversation context
   * @returns {Promise<Object>} Intelligent response with metadata
   */
  async think(userId, message, context = {}) {
    try {
      console.log('\n🧠 === MASTER INTELLIGENCE BRAIN: THINKING START ===');
      console.log(`👤 User: ${userId}`);
      console.log(`💭 Message: "${message}"`);
      console.log(`📋 Context: ${JSON.stringify(context, null, 2)}`);
      
      const thinkingStart = Date.now();
      
      // Phase 1: Parallel Intelligence Analysis (Human-like parallel thinking)
      console.log('\n🔄 Phase 1: Parallel Intelligence Analysis...');
      const intelligenceInputs = await this._gatherIntelligenceInputs(userId, message, context);
      
      // Phase 2: Intelligence Synthesis (Human-like decision making)
      console.log('\n🎯 Phase 2: Intelligence Synthesis & Decision Making...');
      const intelligentDecision = await this._synthesizeIntelligence(intelligenceInputs, userId, message);
      
      // Phase 3: Context-Aware Response Generation (Human-like response creation)
      console.log('\n💬 Phase 3: Context-Aware Response Generation...');
      const intelligentResponse = await this._generateIntelligentResponse(intelligentDecision, userId, message, context);
      
      // Phase 4: Relationship Enhancement Processing (Human-like bonding)
      console.log('\n❤️ Phase 4: Relationship Enhancement Processing...');
      const relationshipEnhancement = await this._enhanceRelationship(intelligentDecision, userId, message);
      
      const thinkingTime = Date.now() - thinkingStart;
      console.log(`\n✅ Master Intelligence Brain thinking complete: ${thinkingTime}ms`);
      
      const result = {
        response: intelligentResponse.response,
        emotion: intelligentResponse.emotion,
        intelligence: {
          personalityProfile: intelligenceInputs.personalityProfile,
          emotionalNeeds: intelligenceInputs.emotionalNeeds,
          proactiveActions: intelligenceInputs.proactiveActions,
          relationshipEnhancement: relationshipEnhancement,
          thinkingTime: thinkingTime
        },
        metadata: {
          intelligenceUsed: true,
          systemsActive: this._getActiveSystemsCount(),
          confidenceScore: intelligentDecision.confidenceScore,
          responseStrategy: intelligentDecision.strategy
        }
      };
      
      console.log('🧠 === MASTER INTELLIGENCE BRAIN: THINKING COMPLETE ===\n');
      return result;
      
    } catch (error) {
      console.error('❌ Master Intelligence Brain error:', error);
      
      // Graceful fallback to basic response
      console.log('🔄 Falling back to basic response generation...');
      return await this._generateFallbackResponse(userId, message, context, error);
    }
  }

  /**
   * Phase 1: Gather intelligence inputs from all systems in parallel
   * @private
   */
  async _gatherIntelligenceInputs(userId, message, context) {
    const cacheKey = `intelligence_${userId}_${Date.now().toString().slice(0, -4)}`; // 10 second cache
    
    if (this.intelligenceCache.has(cacheKey)) {
      console.log('⚡ Using cached intelligence inputs');
      return this.intelligenceCache.get(cacheKey);
    }
    
    try {
      console.log('🔄 Gathering intelligence from all systems...');
      
      // Parallel intelligence analysis - like human brain processing multiple streams
      const [
        personalityProfile,
        emotionalNeeds,
        emotionalAnalysis,
        proactiveActions,
        conversationFlow,
        enhancedMemoryContext
      ] = await Promise.all([
        this._safeIntelligenceCall('personality', () => 
          this.personalityProfiler.analyzePersonality(userId)),
        this._safeIntelligenceCall('emotional_needs', () => 
          this.emotionalNeedsPredictor.predictEmotionalNeeds(userId, message, context)),
        this._safeIntelligenceCall('emotion_analysis', () => 
          this.contextualEmotionAnalyzer.analyzeContextualEmotion(userId, message, context)),
        this._safeIntelligenceCall('proactive', () => 
          this.proactiveGirlfriendSystem.generateProactiveActions(userId)),
        this._safeIntelligenceCall('conversation_flow', () => 
          this.conversationFlowManager.analyzeAndGuideConversation(userId, message, context)),
        this._safeIntelligenceCall('memory', () => 
          memoryManager.buildEnhancedContext ? 
            memoryManager.buildEnhancedContext(userId, message) :
            this._buildBasicMemoryContext(userId))
      ]);
      
      const intelligenceInputs = {
        personalityProfile,
        emotionalNeeds,
        emotionalAnalysis,
        proactiveActions,
        conversationFlow,
        memoryContext: enhancedMemoryContext,
        timestamp: Date.now(),
        userId
      };
      
      // Cache for performance
      this.intelligenceCache.set(cacheKey, intelligenceInputs);
      setTimeout(() => this.intelligenceCache.delete(cacheKey), this.cacheTimeout);
      
      console.log('✅ Intelligence inputs gathered:', {
        personalityAvailable: !!personalityProfile,
        emotionalNeedsDetected: !!emotionalNeeds,
        emotionAnalyzed: !!emotionalAnalysis,
        proactiveActionsFound: !!proactiveActions,
        conversationFlowAnalyzed: !!conversationFlow,
        memoryContextBuilt: !!enhancedMemoryContext
      });
      
      return intelligenceInputs;
      
    } catch (error) {
      console.error('❌ Error gathering intelligence inputs:', error);
      return { error: error.message, timestamp: Date.now() };
    }
  }

  /**
   * Phase 2: Synthesize all intelligence inputs into coherent decision
   * @private
   */
  async _synthesizeIntelligence(intelligenceInputs, userId, message) {
    console.log('🎯 Synthesizing intelligence inputs into coherent decision...');
    
    try {
      // Calculate confidence score based on available intelligence
      const confidenceFactors = {
        personality: intelligenceInputs.personalityProfile ? 0.20 : 0,
        emotionalNeeds: intelligenceInputs.emotionalNeeds ? 0.20 : 0,
        emotionalAnalysis: intelligenceInputs.emotionalAnalysis ? 0.20 : 0,
        proactiveActions: intelligenceInputs.proactiveActions ? 0.15 : 0,
        conversationFlow: intelligenceInputs.conversationFlow ? 0.15 : 0,
        memoryContext: intelligenceInputs.memoryContext ? 0.10 : 0
      };
      
      const confidenceScore = Object.values(confidenceFactors).reduce((sum, val) => sum + val, 0);
      
      // Determine response strategy based on intelligence synthesis
      let strategy = 'basic';
      let priority = 'neutral';
      let approach = 'supportive';
      
      if (intelligenceInputs.emotionalNeeds?.prediction?.urgency === 'high') {
        strategy = 'emotional_support';
        priority = 'high';
        approach = 'nurturing';
      } else if (intelligenceInputs.proactiveActions?.length > 0) {
        strategy = 'proactive_engagement';
        priority = 'medium';
        approach = 'engaging';
      } else if (intelligenceInputs.personalityProfile?.archetype) {
        strategy = 'personality_adapted';
        priority = 'medium';
        approach = intelligenceInputs.personalityProfile.archetype.toLowerCase();
      }
      
      console.log(`📊 Intelligence Synthesis Result:`, {
        confidenceScore: Math.round(confidenceScore * 100) + '%',
        strategy,
        priority,
        approach
      });
      
      return {
        confidenceScore,
        strategy,
        priority,
        approach,
        intelligenceInputs,
        synthesisTimestamp: Date.now()
      };
      
    } catch (error) {
      console.error('❌ Error synthesizing intelligence:', error);
      return {
        confidenceScore: 0.1,
        strategy: 'fallback',
        priority: 'low',
        approach: 'basic',
        error: error.message
      };
    }
  }

  /**
   * Phase 3: Generate intelligent response using synthesized decision
   * @private
   */
  async _generateIntelligentResponse(intelligentDecision, userId, message, context) {
    console.log(`💬 Generating intelligent response using strategy: ${intelligentDecision.strategy}`);
    
    try {
      // Use AdaptiveResponseGenerator with all intelligence context
      const adaptiveContext = {
        userId,
        message,
        context,
        personalityProfile: intelligentDecision.intelligenceInputs.personalityProfile,
        emotionalNeeds: intelligentDecision.intelligenceInputs.emotionalNeeds,
        emotionalAnalysis: intelligentDecision.intelligenceInputs.emotionalAnalysis,
        proactiveActions: intelligentDecision.intelligenceInputs.proactiveActions,
        memoryContext: intelligentDecision.intelligenceInputs.memoryContext,
        strategy: intelligentDecision.strategy,
        approach: intelligentDecision.approach
      };
      
      // Generate personalized response using all available intelligence
      const response = await this.adaptiveResponseGenerator.generatePersonalizedResponse(
        userId,
        message,
        adaptiveContext
      );
      
      // Extract emotion from emotional analysis or fallback
      const emotion = intelligentDecision.intelligenceInputs.emotionalAnalysis?.primaryEmotion?.emotion ||
                     intelligentDecision.intelligenceInputs.emotionalAnalysis?.emotion ||
                     'neutral';
      
      console.log(`✅ Intelligent response generated: "${response.substring(0, 100)}..."`);
      console.log(`😊 Emotion context: ${emotion}`);
      
      return {
        response,
        emotion,
        strategy: intelligentDecision.strategy,
        confidenceScore: intelligentDecision.confidenceScore
      };
      
    } catch (error) {
      console.error('❌ Error generating intelligent response:', error);
      
      // Fallback to basic emotional response
      const openaiService = require('../../api/openai');
      const basicResponse = await openaiService.generateEmotionalResponse(
        message,
        'neutral',
        intelligentDecision.intelligenceInputs.memoryContext
      );
      
      return {
        response: basicResponse,
        emotion: 'neutral',
        strategy: 'fallback',
        confidenceScore: 0.1
      };
    }
  }

  /**
   * Phase 4: Enhance relationship using existing systems
   * @private
   */
  async _enhanceRelationship(intelligentDecision, userId, message) {
    console.log('❤️ Processing relationship enhancement...');
    
    try {
      const enhancements = {
        conversationGuidance: null,
        proactiveOpportunities: null,
        attachmentHealth: null,
        languageEvolution: null
      };
      
      // Use conversation flow guidance for relationship enhancement
      try {
        enhancements.conversationGuidance = intelligentDecision.intelligenceInputs.conversationFlow;
        console.log('✅ Conversation flow guidance available for relationship enhancement');
      } catch (error) {
        console.error('❌ Conversation flow error:', error.message);
        enhancements.conversationGuidance = { error: error.message };
      }
      
      // Use proactive system for relationship opportunities
      try {
        enhancements.proactiveOpportunities = intelligentDecision.intelligenceInputs.proactiveActions;
        console.log('✅ Proactive opportunities available for relationship enhancement');
      } catch (error) {
        console.error('❌ Proactive system error:', error.message);
        enhancements.proactiveOpportunities = { error: error.message };
      }
      
      // Apply ethical safeguards through attachment psychology
      try {
        enhancements.attachmentHealth = await this.attachmentPsychology.applyEthicalSafeguards(userId, {
          message,
          emotionalIntensity: intelligentDecision.intelligenceInputs.emotionalAnalysis?.emotionalIntensity || 0,
          emotion: intelligentDecision.intelligenceInputs.emotionalAnalysis?.primaryEmotion?.emotion || 'neutral',
          intelligence: intelligentDecision.intelligenceInputs
        });
        console.log('✅ Attachment psychology safeguards applied');
      } catch (error) {
        console.error('❌ Attachment psychology error:', error.message);
        enhancements.attachmentHealth = { error: error.message };
      }
      
      // Language evolution is handled by AdaptiveResponseGenerator automatically
      enhancements.languageEvolution = { 
        handled_by: 'AdaptiveResponseGenerator',
        integrated: true 
      };
      
      console.log('✅ Relationship enhancement processed using existing systems');
      return enhancements;
      
    } catch (error) {
      console.error('❌ Error enhancing relationship:', error);
      return { error: error.message };
    }
  }

  /**
   * Safe wrapper for intelligence system calls with error handling
   * @private
   */
  async _safeIntelligenceCall(systemName, intelligenceFunction) {
    try {
      console.log(`🔄 Calling ${systemName} intelligence system...`);
      const result = await intelligenceFunction();
      console.log(`✅ ${systemName} intelligence system completed`);
      return result;
    } catch (error) {
      console.error(`❌ ${systemName} intelligence system failed:`, error.message);
      return null;
    }
  }

  /**
   * Build basic memory context as fallback
   * @private
   */
  async _buildBasicMemoryContext(userId) {
    try {
      const [recentMemories, userFacts, episodicMemories] = await Promise.all([
        memoryManager.retrieveRecentMemories(userId, 3),
        memoryManager.getUserFacts(userId, ['preferences', 'personal_facts']).catch(() => []),
        memoryManager.getEpisodicMemories(userId, 3).catch(() => [])
      ]);

      return {
        recentMemories,
        userFacts,
        episodicMemories,
        userId,
        contextBuilt: true,
        fallbackMode: true
      };
    } catch (error) {
      console.error('❌ Basic memory context building failed:', error);
      return { 
        contextBuilt: false, 
        userId,
        error: error.message 
      };
    }
  }

  /**
   * Generate fallback response when intelligence systems fail
   * @private
   */
  async _generateFallbackResponse(userId, message, context, originalError) {
    console.log('🔄 Generating fallback response...');
    
    try {
      const openaiService = require('../../api/openai');
      const basicResponse = await openaiService.generateEmotionalResponse(
        message,
        'neutral',
        null
      );
      
      return {
        response: basicResponse,
        emotion: 'neutral',
        intelligence: null,
        metadata: {
          intelligenceUsed: false,
          fallbackReason: originalError.message,
          systemsActive: 0
        }
      };
    } catch (fallbackError) {
      console.error('❌ Fallback response generation failed:', fallbackError);
      
      return {
        response: "I'm having some trouble thinking clearly right now, but I'm here for you. Could you tell me more about what's on your mind?",
        emotion: 'neutral',
        intelligence: null,
        metadata: {
          intelligenceUsed: false,
          fallbackReason: 'Complete system failure',
          systemsActive: 0
        }
      };
    }
  }

  /**
   * Get count of active intelligence systems
   * @private
   */
  _getActiveSystemsCount() {
    let count = 0;
    if (this.personalityProfiler) count++;
    if (this.adaptiveResponseGenerator) count++;
    if (this.emotionalNeedsPredictor) count++;
    if (this.proactiveGirlfriendSystem) count++;
    if (this.contextualEmotionAnalyzer) count++;
    if (this.conversationFlowManager) count++;
    if (this.attachmentPsychology) count++;
    return count;
  }

  /**
   * Health check for all intelligence systems
   * @returns {Object} System health status
   */
  async healthCheck() {
    console.log('🏥 Master Intelligence Brain health check...');
    
    const systems = {
      personalityProfiler: !!this.personalityProfiler,
      adaptiveResponseGenerator: !!this.adaptiveResponseGenerator,
      emotionalNeedsPredictor: !!this.emotionalNeedsPredictor,
      proactiveGirlfriendSystem: !!this.proactiveGirlfriendSystem,
      contextualEmotionAnalyzer: !!this.contextualEmotionAnalyzer,
      conversationFlowManager: !!this.conversationFlowManager,
      attachmentPsychology: !!this.attachmentPsychology
    };
    
    const activeCount = Object.values(systems).filter(Boolean).length;
    const totalCount = Object.keys(systems).length;
    
    return {
      status: activeCount > 0 ? 'healthy' : 'critical',
      activeSystems: activeCount,
      totalSystems: totalCount,
      systemDetails: systems,
      cacheSize: this.intelligenceCache.size
    };
  }

  /**
   * Clear intelligence cache
   */
  clearCache() {
    this.intelligenceCache.clear();
    console.log('🧹 Intelligence cache cleared');
  }
}

module.exports = MasterIntelligenceBrain;