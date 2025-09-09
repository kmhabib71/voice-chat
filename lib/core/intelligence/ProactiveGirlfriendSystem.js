/**
 * @fileoverview Proactive girlfriend intelligence system that initiates conversations and offers support
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const system = new ProactiveGirlfriendSystem();
 * const actions = await system.generateProactiveActions(userId);
 */

const { PersonalityProfiler } = require('./PersonalityProfiler');
const { EmotionalNeedsPredictor } = require('./EmotionalNeedsPredictor');
const { ContextualEmotionAnalyzer } = require('./ContextualEmotionAnalyzer');
const { MemoryManager } = require('../memory/MemoryManager');
const { ActivitySuggestionGenerator } = require('./ActivitySuggestionGenerator');

class ProactiveGirlfriendSystem {
  constructor() {
    this.personalityProfiler = new PersonalityProfiler();
    this.emotionalNeedsPredictor = new EmotionalNeedsPredictor();
    this.emotionAnalyzer = new ContextualEmotionAnalyzer();
    this.memoryManager = new MemoryManager();
    this.activityGenerator = new ActivitySuggestionGenerator();
    
    // Proactive intervention thresholds
    this.thresholds = {
      stressIntervention: 0.6,
      conversationRutRisk: 0.7,
      emotionalSupportNeeded: 0.5,
      intimacyBuildingOpportunity: 0.8,
      activitySuggestionTrigger: 0.6,
      checkInFrequency: 24 * 60 * 60 * 1000, // 24 hours
      supportCooldown: 4 * 60 * 60 * 1000   // 4 hours
    };
    
    // Cache for user state analysis
    this.userStateCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Generates proactive actions for a user based on comprehensive analysis
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} Array of proactive actions to take
   */
  async generateProactiveActions(userId) {
    try {
      const analysis = await this.analyzeUserState(userId);
      const actions = [];

      // Emotional support patterns
      if (this.shouldOfferEmotionalSupport(analysis)) {
        actions.push(await this.generateCheckInMessage(userId, analysis));
      }

      // Activity suggestions
      if (this.shouldSuggestActivity(analysis)) {
        actions.push(await this.generateActivitySuggestion(userId, analysis));
      }

      // Relationship deepening
      if (this.shouldDeeptenIntimacy(analysis)) {
        actions.push(await this.generateIntimacyBuildingMessage(userId, analysis));
      }

      // Conversation revival
      if (this.shouldReviveConversation(analysis)) {
        actions.push(await this.generateConversationStarter(userId, analysis));
      }

      // Celebration opportunities
      if (this.shouldCelebrate(analysis)) {
        actions.push(await this.generateCelebrationMessage(userId, analysis));
      }

      // Personal growth support
      if (this.shouldOfferGrowthSupport(analysis)) {
        actions.push(await this.generateGrowthSupportMessage(userId, analysis));
      }

      return {
        actions: actions.filter(action => action !== null),
        analysis: this.sanitizeAnalysisForLogging(analysis),
        timestamp: new Date(),
        confidence: this.calculateOverallConfidence(analysis)
      };

    } catch (error) {
      console.error('Error generating proactive actions:', error);
      return {
        actions: [],
        analysis: null,
        timestamp: new Date(),
        confidence: 0,
        error: 'Analysis failed'
      };
    }
  }

  /**
   * Comprehensive user state analysis for proactive decisions
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Detailed user state analysis
   */
  async analyzeUserState(userId) {
    // Check cache first
    const cached = this.userStateCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.analysis;
    }

    try {
      // Gather all user data
      const [
        personalityProfile,
        recentConversations,
        emotionalHistory,
        userActivity,
        preferences
      ] = await Promise.all([
        this.personalityProfiler.getUserPersonalityProfile(userId),
        this.memoryManager.getRecentConversations(userId, 7), // Last 7 days
        this.memoryManager.getEmotionalHistory(userId, 14), // Last 14 days
        this.memoryManager.getUserActivityPatterns(userId),
        this.memoryManager.getUserPreferences(userId)
      ]);

      const currentTime = new Date();
      const analysis = {
        // Basic user information
        userId,
        timestamp: currentTime,
        personalityArchetype: personalityProfile?.archetype || 'unknown',
        
        // Temporal analysis
        lastInteraction: await this.getLastInteractionTime(userId),
        timeSinceLastInteraction: 0,
        timeOfDay: this.getTimeOfDay(currentTime),
        dayOfWeek: currentTime.getDay(),
        
        // Emotional state analysis
        currentEmotionalState: await this.analyzeCurrentEmotionalState(userId, recentConversations),
        emotionalTrend: this.analyzeEmotionalTrend(emotionalHistory),
        stressLevel: await this.calculateStressLevel(userId, recentConversations),
        
        // Behavioral patterns
        conversationFrequency: this.analyzeConversationFrequency(recentConversations),
        conversationQuality: this.analyzeConversationQuality(recentConversations),
        conversationRutRisk: await this.assessConversationRutRisk(recentConversations),
        
        // Relationship progression
        intimacyLevel: await this.assessIntimacyLevel(userId),
        relationshipMilestones: await this.identifyReachableMilestones(userId),
        readyForDeeperIntimacy: false,
        
        // Support history
        lastEmotionalSupport: await this.getLastSupportTime(userId),
        supportEffectiveness: await this.assessSupportEffectiveness(userId),
        
        // Activity and engagement
        activityEngagement: await this.assessActivityEngagement(userId),
        interestDiversification: await this.assessInterestDiversification(userId),
        
        // Needs prediction
        predictedNeeds: await this.emotionalNeedsPredictor.predictEmotionalNeeds(userId, null, {
          personality: personalityProfile,
          recentHistory: recentConversations
        }),
        
        // Intervention flags
        needsImmedateSupport: false,
        needsActivitySuggestion: false,
        needsConversationRevival: false,
        readyForGrowthChallenge: false
      };

      // Calculate derived metrics
      analysis.timeSinceLastInteraction = analysis.lastInteraction ? 
        currentTime - analysis.lastInteraction : Infinity;
      
      analysis.readyForDeeperIntimacy = this.assessIntimacyReadiness(analysis);
      analysis.needsImmedateSupport = this.assessImmediateSupportNeed(analysis);
      analysis.needsActivitySuggestion = this.assessActivitySuggestionNeed(analysis);
      analysis.needsConversationRevival = this.assessConversationRevivalNeed(analysis);
      analysis.readyForGrowthChallenge = this.assessGrowthChallengeReadiness(analysis);

      // Cache the analysis
      this.userStateCache.set(userId, {
        analysis,
        timestamp: Date.now()
      });

      return analysis;

    } catch (error) {
      console.error('Error analyzing user state:', error);
      return {
        userId,
        timestamp: new Date(),
        error: 'Analysis failed',
        confidence: 0
      };
    }
  }

  /**
   * Determines if emotional support should be offered
   */
  shouldOfferEmotionalSupport(analysis) {
    if (!analysis || analysis.error) return false;

    return (
      analysis.stressLevel > this.thresholds.stressIntervention ||
      analysis.needsImmedateSupport ||
      (analysis.timeSinceLastInteraction > this.thresholds.checkInFrequency &&
       analysis.emotionalTrend === 'declining') ||
      (analysis.lastEmotionalSupport && 
       Date.now() - analysis.lastEmotionalSupport > this.thresholds.supportCooldown &&
       analysis.currentEmotionalState?.intensity > 0.6)
    );
  }

  /**
   * Determines if activity suggestion should be made
   */
  shouldSuggestActivity(analysis) {
    if (!analysis || analysis.error) return false;

    return (
      analysis.conversationRutRisk > this.thresholds.conversationRutRisk ||
      analysis.needsActivitySuggestion ||
      (analysis.activityEngagement < 0.4 && analysis.personalityArchetype === 'Explorer') ||
      (analysis.interestDiversification < 0.3 && analysis.timeSinceLastInteraction > 48 * 60 * 60 * 1000)
    );
  }

  /**
   * Determines if intimacy building should be initiated
   */
  shouldDeeptenIntimacy(analysis) {
    if (!analysis || analysis.error) return false;

    return (
      analysis.readyForDeeperIntimacy &&
      analysis.intimacyLevel < this.thresholds.intimacyBuildingOpportunity &&
      analysis.conversationQuality > 0.7 &&
      analysis.relationshipMilestones.length > 0
    );
  }

  /**
   * Determines if conversation revival is needed
   */
  shouldReviveConversation(analysis) {
    if (!analysis || analysis.error) return false;

    return (
      analysis.needsConversationRevival ||
      (analysis.timeSinceLastInteraction > 2 * 24 * 60 * 60 * 1000 && // 2 days
       analysis.conversationFrequency < 0.3)
    );
  }

  /**
   * Determines if celebration is appropriate
   */
  shouldCelebrate(analysis) {
    if (!analysis || analysis.error) return false;

    return (
      analysis.emotionalTrend === 'improving' &&
      analysis.currentEmotionalState?.primary === 'happiness' &&
      analysis.relationshipMilestones.some(m => m.type === 'achievement')
    );
  }

  /**
   * Determines if personal growth support should be offered
   */
  shouldOfferGrowthSupport(analysis) {
    if (!analysis || analysis.error) return false;

    return (
      analysis.readyForGrowthChallenge &&
      analysis.personalityArchetype === 'Achiever' &&
      analysis.emotionalTrend !== 'declining' &&
      analysis.stressLevel < 0.5
    );
  }

  /**
   * Generates contextual check-in message
   */
  async generateCheckInMessage(userId, analysis) {
    try {
      const context = {
        stressLevel: analysis.stressLevel,
        emotionalState: analysis.currentEmotionalState,
        timeOfDay: analysis.timeOfDay,
        personalityType: analysis.personalityArchetype,
        lastInteraction: analysis.timeSinceLastInteraction
      };

      const templates = await this.getCheckInTemplates(context);
      const selectedTemplate = this.selectBestTemplate(templates, analysis);

      return {
        type: 'emotional_check_in',
        priority: analysis.stressLevel > 0.8 ? 'high' : 'medium',
        message: selectedTemplate.message,
        intent: 'emotional_support',
        context: context,
        confidence: selectedTemplate.confidence,
        timing: this.calculateOptimalTiming(analysis),
        followUpSuggestions: selectedTemplate.followUps
      };

    } catch (error) {
      console.error('Error generating check-in message:', error);
      return null;
    }
  }

  /**
   * Generates activity suggestion based on user state
   */
  async generateActivitySuggestion(userId, analysis) {
    try {
      const suggestion = await this.activityGenerator.generatePersonalizedSuggestion(
        userId, 
        analysis.personalityArchetype,
        analysis.currentEmotionalState,
        analysis
      );

      return {
        type: 'activity_suggestion',
        priority: 'medium',
        message: suggestion.message,
        activity: suggestion.activity,
        intent: 'engagement_boost',
        context: {
          rutRisk: analysis.conversationRutRisk,
          engagementLevel: analysis.activityEngagement,
          personalityType: analysis.personalityArchetype
        },
        confidence: suggestion.confidence,
        timing: 'immediate',
        expectedOutcome: suggestion.expectedOutcome
      };

    } catch (error) {
      console.error('Error generating activity suggestion:', error);
      return null;
    }
  }

  /**
   * Generates intimacy building message
   */
  async generateIntimacyBuildingMessage(userId, analysis) {
    try {
      const milestone = analysis.relationshipMilestones[0];
      const intimacyContext = {
        currentLevel: analysis.intimacyLevel,
        personalityType: analysis.personalityArchetype,
        milestone: milestone,
        emotionalReadiness: analysis.currentEmotionalState
      };

      const message = await this.generateIntimacyMessage(intimacyContext);

      return {
        type: 'intimacy_building',
        priority: 'high',
        message: message.content,
        intent: 'relationship_deepening',
        milestone: milestone,
        context: intimacyContext,
        confidence: message.confidence,
        timing: this.calculateOptimalIntimacyTiming(analysis),
        expectedProgression: message.expectedProgression
      };

    } catch (error) {
      console.error('Error generating intimacy building message:', error);
      return null;
    }
  }

  /**
   * Generates conversation starter
   */
  async generateConversationStarter(userId, analysis) {
    try {
      const context = {
        timeSinceLastContact: analysis.timeSinceLastInteraction,
        personalityType: analysis.personalityArchetype,
        previousTopics: await this.getRecentTopics(userId),
        interests: await this.memoryManager.getUserInterests(userId)
      };

      const starter = await this.generateConversationOpener(context);

      return {
        type: 'conversation_starter',
        priority: 'low',
        message: starter.message,
        intent: 'reconnection',
        context: context,
        confidence: starter.confidence,
        timing: 'immediate',
        topicDirection: starter.suggestedDirection
      };

    } catch (error) {
      console.error('Error generating conversation starter:', error);
      return null;
    }
  }

  /**
   * Generates celebration message
   */
  async generateCelebrationMessage(userId, analysis) {
    try {
      const achievement = analysis.relationshipMilestones.find(m => m.type === 'achievement');
      
      return {
        type: 'celebration',
        priority: 'high',
        message: await this.generateCelebrationText(achievement, analysis.personalityArchetype),
        intent: 'positive_reinforcement',
        achievement: achievement,
        confidence: 0.9,
        timing: 'immediate',
        emotionalImpact: 'very_positive'
      };

    } catch (error) {
      console.error('Error generating celebration message:', error);
      return null;
    }
  }

  /**
   * Generates personal growth support message
   */
  async generateGrowthSupportMessage(userId, analysis) {
    try {
      const growthOpportunity = await this.identifyGrowthOpportunity(userId, analysis);
      
      return {
        type: 'growth_support',
        priority: 'medium',
        message: growthOpportunity.message,
        intent: 'personal_development',
        opportunity: growthOpportunity.area,
        confidence: growthOpportunity.confidence,
        timing: this.calculateOptimalGrowthTiming(analysis),
        expectedBenefit: growthOpportunity.expectedBenefit
      };

    } catch (error) {
      console.error('Error generating growth support message:', error);
      return null;
    }
  }

  // Helper methods for analysis
  async getLastInteractionTime(userId) {
    try {
      const recentMessages = await this.memoryManager.getRecentMessages(userId, 1);
      return recentMessages.length > 0 ? recentMessages[0].timestamp : null;
    } catch (error) {
      return null;
    }
  }

  getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  async analyzeCurrentEmotionalState(userId, recentConversations) {
    try {
      if (!recentConversations || recentConversations.length === 0) {
        return { primary: 'neutral', intensity: 0.5, confidence: 0.3 };
      }

      const latestMessage = recentConversations[0]?.userMessage || '';
      return await this.emotionAnalyzer.analyzeContextualEmotion(userId, latestMessage, {
        recentHistory: recentConversations
      });
    } catch (error) {
      return { primary: 'neutral', intensity: 0.5, confidence: 0.1 };
    }
  }

  analyzeEmotionalTrend(emotionalHistory) {
    if (!emotionalHistory || emotionalHistory.length < 2) return 'stable';

    const recent = emotionalHistory.slice(0, 3);
    const avgRecent = recent.reduce((sum, state) => sum + (state.positivity || 0.5), 0) / recent.length;
    
    const older = emotionalHistory.slice(3, 6);
    const avgOlder = older.length > 0 ? 
      older.reduce((sum, state) => sum + (state.positivity || 0.5), 0) / older.length : avgRecent;

    if (avgRecent > avgOlder + 0.1) return 'improving';
    if (avgRecent < avgOlder - 0.1) return 'declining';
    return 'stable';
  }

  async calculateStressLevel(userId, recentConversations) {
    try {
      let stressIndicators = 0;
      let totalMessages = 0;

      for (const conv of recentConversations || []) {
        if (conv.userMessage) {
          totalMessages++;
          
          // Stress language patterns
          const stressKeywords = ['stressed', 'overwhelmed', 'tired', 'exhausted', 'busy', 'pressure'];
          const hasStressWords = stressKeywords.some(word => 
            conv.userMessage.toLowerCase().includes(word)
          );
          
          if (hasStressWords) stressIndicators++;
        }
      }

      return totalMessages > 0 ? Math.min(stressIndicators / totalMessages * 2, 1.0) : 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  // Additional analysis methods would continue here...
  // For brevity, I'll implement the core structure and key methods

  sanitizeAnalysisForLogging(analysis) {
    // Remove sensitive data for logging
    return {
      userId: analysis.userId,
      timestamp: analysis.timestamp,
      emotionalTrend: analysis.emotionalTrend,
      stressLevel: analysis.stressLevel,
      conversationRutRisk: analysis.conversationRutRisk,
      intimacyLevel: analysis.intimacyLevel
    };
  }

  calculateOverallConfidence(analysis) {
    if (!analysis || analysis.error) return 0;
    
    // Confidence based on data quality and recency
    const dataQuality = analysis.personalityArchetype !== 'unknown' ? 0.8 : 0.4;
    const recencyFactor = analysis.timeSinceLastInteraction < 24 * 60 * 60 * 1000 ? 1.0 : 0.6;
    
    return Math.min(dataQuality * recencyFactor, 1.0);
  }

  // Placeholder implementations for complex helper methods
  analyzeConversationFrequency(conversations) { return 0.7; }
  analyzeConversationQuality(conversations) { return 0.8; }
  async assessConversationRutRisk(conversations) { return 0.3; }
  async assessIntimacyLevel(userId) { return 0.6; }
  async identifyReachableMilestones(userId) { return []; }
  async getLastSupportTime(userId) { return Date.now() - 10 * 60 * 60 * 1000; }
  async assessSupportEffectiveness(userId) { return 0.8; }
  async assessActivityEngagement(userId) { return 0.7; }
  async assessInterestDiversification(userId) { return 0.6; }

  assessIntimacyReadiness(analysis) { return analysis.conversationQuality > 0.7; }
  assessImmediateSupportNeed(analysis) { return analysis.stressLevel > 0.8; }
  assessActivitySuggestionNeed(analysis) { return analysis.conversationRutRisk > 0.7; }
  assessConversationRevivalNeed(analysis) { return analysis.timeSinceLastInteraction > 48 * 60 * 60 * 1000; }
  assessGrowthChallengeReadiness(analysis) { return analysis.personalityArchetype === 'Achiever' && analysis.stressLevel < 0.5; }

  async getCheckInTemplates(context) {
    return [{
      message: "Hey, I've been thinking about you. How are you feeling today?",
      confidence: 0.8,
      followUps: ['emotional_support', 'stress_relief']
    }];
  }

  selectBestTemplate(templates, analysis) {
    return templates[0] || { message: "Hi there! How are you doing?", confidence: 0.5, followUps: [] };
  }

  calculateOptimalTiming(analysis) { return 'immediate'; }
  calculateOptimalIntimacyTiming(analysis) { return 'immediate'; }
  calculateOptimalGrowthTiming(analysis) { return 'later'; }

  async generateIntimacyMessage(context) {
    return {
      content: "I feel like we're getting closer, and I really value our connection.",
      confidence: 0.8,
      expectedProgression: 'deeper_trust'
    };
  }

  async getRecentTopics(userId) { return ['work', 'hobbies']; }
  
  async generateConversationOpener(context) {
    return {
      message: "I was just thinking about something interesting and wanted to share it with you!",
      confidence: 0.7,
      suggestedDirection: 'personal_interests'
    };
  }

  async generateCelebrationText(achievement, personalityType) {
    return "That's amazing! I'm so proud of you for achieving that!";
  }

  async identifyGrowthOpportunity(userId, analysis) {
    return {
      message: "I've noticed you've been really focused lately. Want to explore a new challenge together?",
      area: 'personal_development',
      confidence: 0.7,
      expectedBenefit: 'increased_confidence'
    };
  }
}

module.exports = { ProactiveGirlfriendSystem };