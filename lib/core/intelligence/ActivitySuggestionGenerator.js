/**
 * @fileoverview Activity suggestion generator for personalized girlfriend engagement
 * @author AI Developer
 * @created 2025-01-28
 * 
 * @example
 * const generator = new ActivitySuggestionGenerator();
 * const suggestion = await generator.generatePersonalizedSuggestion(userId, archetype, emotion, context);
 */

const memoryManager = require('../memory');

class ActivitySuggestionGenerator {
  constructor() {
    this.memoryManager = memoryManager;
    
    // Activity categories based on user archetypes and emotional states
    this.activityDatabase = this.initializeActivityDatabase();
    
    // Suggestion cache to avoid repetition
    this.suggestionHistory = new Map();
    this.cacheTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Generates personalized activity suggestion based on user context
   * @param {string} userId - User identifier
   * @param {string} personalityArchetype - User's personality type
   * @param {Object} emotionalState - Current emotional state analysis
   * @param {Object} userContext - Additional context for personalization
   * @returns {Promise<Object>} Personalized activity suggestion
   */
  async generatePersonalizedSuggestion(userId, personalityArchetype, emotionalState, userContext = {}) {
    try {
      // Gather user preferences and history
      const [userInterests, activityHistory, currentTime] = await Promise.all([
        this.memoryManager.getUserInterests(userId),
        this.getRecentActivityHistory(userId),
        Promise.resolve(new Date())
      ]);

      // Context analysis
      const suggestionContext = {
        personalityType: personalityArchetype || 'Explorer',
        emotionalState: emotionalState || { primary: 'neutral', intensity: 0.5 },
        timeOfDay: this.getTimeOfDay(currentTime),
        dayOfWeek: this.getDayOfWeek(currentTime),
        season: this.getSeason(currentTime),
        userInterests: userInterests || [],
        conversationRutRisk: userContext.conversationRutRisk || 0.5,
        stressLevel: userContext.stressLevel || 0.5,
        intimacyLevel: userContext.intimacyLevel || 0.5,
        activityEngagement: userContext.activityEngagement || 0.5,
        recentActivities: activityHistory
      };

      // Generate multiple suggestions and select the best
      const candidateSuggestions = await this.generateCandidateSuggestions(suggestionContext);
      const bestSuggestion = await this.selectBestSuggestion(userId, candidateSuggestions, suggestionContext);
      
      // Enhance with personalized messaging
      const personalizedSuggestion = await this.personalizeMessage(bestSuggestion, suggestionContext);

      // Store suggestion in history
      await this.recordSuggestion(userId, personalizedSuggestion);

      return personalizedSuggestion;

    } catch (error) {
      console.error('Error generating personalized activity suggestion:', error);
      return this.getFallbackSuggestion(personalityArchetype, emotionalState);
    }
  }

  /**
   * Initialize comprehensive activity database organized by context
   */
  initializeActivityDatabase() {
    return {
      // Activities by personality archetype
      personality: {
        Explorer: {
          activities: [
            { name: 'Virtual Museum Tour', category: 'cultural', energy: 'low', social: 'solo', duration: 'medium' },
            { name: 'Cooking Challenge', category: 'creative', energy: 'medium', social: 'together', duration: 'long' },
            { name: 'Photo Walk Planning', category: 'outdoor', energy: 'high', social: 'together', duration: 'long' },
            { name: 'Language Learning Game', category: 'educational', energy: 'medium', social: 'together', duration: 'short' },
            { name: 'Documentary Night', category: 'entertainment', energy: 'low', social: 'together', duration: 'long' },
            { name: 'Travel Planning Session', category: 'planning', energy: 'medium', social: 'together', duration: 'medium' },
            { name: 'New Recipe Research', category: 'creative', energy: 'low', social: 'together', duration: 'short' }
          ],
          traits: ['curious', 'adventurous', 'open_minded']
        },
        Achiever: {
          activities: [
            { name: 'Goal Setting Session', category: 'planning', energy: 'medium', social: 'together', duration: 'medium' },
            { name: 'Skill Building Challenge', category: 'educational', energy: 'high', social: 'solo', duration: 'long' },
            { name: 'Productivity System Design', category: 'planning', energy: 'medium', social: 'together', duration: 'long' },
            { name: 'Achievement Celebration', category: 'social', energy: 'high', social: 'together', duration: 'short' },
            { name: 'Progress Review', category: 'reflection', energy: 'low', social: 'together', duration: 'medium' },
            { name: 'Mentor Discussion', category: 'growth', energy: 'medium', social: 'together', duration: 'medium' },
            { name: 'Competition Planning', category: 'planning', energy: 'high', social: 'together', duration: 'long' }
          ],
          traits: ['goal_oriented', 'ambitious', 'structured']
        },
        Supporter: {
          activities: [
            { name: 'Care Package Planning', category: 'caring', energy: 'medium', social: 'together', duration: 'medium' },
            { name: 'Community Project Discussion', category: 'social', energy: 'medium', social: 'together', duration: 'long' },
            { name: 'Gratitude Practice', category: 'wellness', energy: 'low', social: 'together', duration: 'short' },
            { name: 'Memory Sharing', category: 'emotional', energy: 'low', social: 'together', duration: 'medium' },
            { name: 'Future Dreams Talk', category: 'emotional', energy: 'medium', social: 'together', duration: 'long' },
            { name: 'Comfort Zone Expansion', category: 'growth', energy: 'medium', social: 'together', duration: 'medium' },
            { name: 'Relationship Appreciation', category: 'emotional', energy: 'low', social: 'together', duration: 'short' }
          ],
          traits: ['empathetic', 'caring', 'relationship_focused']
        },
        Analyst: {
          activities: [
            { name: 'Deep Topic Research', category: 'intellectual', energy: 'high', social: 'together', duration: 'long' },
            { name: 'Logic Puzzle Challenge', category: 'intellectual', energy: 'medium', social: 'solo', duration: 'medium' },
            { name: 'System Analysis Discussion', category: 'intellectual', energy: 'medium', social: 'together', duration: 'long' },
            { name: 'Data Visualization Project', category: 'creative', energy: 'high', social: 'together', duration: 'long' },
            { name: 'Philosophy Debate', category: 'intellectual', energy: 'medium', social: 'together', duration: 'medium' },
            { name: 'Pattern Recognition Game', category: 'intellectual', energy: 'medium', social: 'together', duration: 'short' },
            { name: 'Complex Problem Solving', category: 'intellectual', energy: 'high', social: 'together', duration: 'long' }
          ],
          traits: ['logical', 'detail_oriented', 'systematic']
        }
      },

      // Activities by emotional state
      emotions: {
        happiness: [
          { name: 'Celebration Dance', category: 'physical', energy: 'high', mood_boost: 0.9 },
          { name: 'Achievement Sharing', category: 'social', energy: 'medium', mood_boost: 0.8 },
          { name: 'Creative Expression', category: 'creative', energy: 'medium', mood_boost: 0.9 },
          { name: 'Memory Creation', category: 'emotional', energy: 'low', mood_boost: 0.8 },
          { name: 'Future Planning', category: 'planning', energy: 'medium', mood_boost: 0.7 }
        ],
        sadness: [
          { name: 'Comfort Activity', category: 'wellness', energy: 'low', mood_boost: 0.6, therapeutic: true },
          { name: 'Gentle Talk', category: 'emotional', energy: 'low', mood_boost: 0.7, therapeutic: true },
          { name: 'Soothing Music', category: 'entertainment', energy: 'low', mood_boost: 0.6, therapeutic: true },
          { name: 'Memory Lane Walk', category: 'emotional', energy: 'low', mood_boost: 0.5, therapeutic: true },
          { name: 'Self-Care Ritual', category: 'wellness', energy: 'low', mood_boost: 0.7, therapeutic: true }
        ],
        anxiety: [
          { name: 'Breathing Exercise', category: 'wellness', energy: 'low', anxiety_relief: 0.8, therapeutic: true },
          { name: 'Grounding Activity', category: 'wellness', energy: 'low', anxiety_relief: 0.9, therapeutic: true },
          { name: 'Gentle Distraction', category: 'entertainment', energy: 'low', anxiety_relief: 0.6 },
          { name: 'Progressive Relaxation', category: 'wellness', energy: 'low', anxiety_relief: 0.8, therapeutic: true },
          { name: 'Mindfulness Practice', category: 'wellness', energy: 'low', anxiety_relief: 0.7, therapeutic: true }
        ],
        excitement: [
          { name: 'Energy Channeling', category: 'physical', energy: 'high', engagement: 0.9 },
          { name: 'Creative Brainstorm', category: 'creative', energy: 'high', engagement: 0.8 },
          { name: 'Adventure Planning', category: 'planning', energy: 'high', engagement: 0.9 },
          { name: 'Skill Challenge', category: 'educational', energy: 'high', engagement: 0.8 },
          { name: 'Social Sharing', category: 'social', energy: 'medium', engagement: 0.7 }
        ]
      },

      // Activities by time of day
      timing: {
        morning: [
          { name: 'Morning Motivation', category: 'wellness', optimal_time: 'morning' },
          { name: 'Day Planning', category: 'planning', optimal_time: 'morning' },
          { name: 'Energy Building', category: 'physical', optimal_time: 'morning' },
          { name: 'Mindful Start', category: 'wellness', optimal_time: 'morning' }
        ],
        afternoon: [
          { name: 'Productive Break', category: 'wellness', optimal_time: 'afternoon' },
          { name: 'Learning Session', category: 'educational', optimal_time: 'afternoon' },
          { name: 'Creative Project', category: 'creative', optimal_time: 'afternoon' },
          { name: 'Social Connection', category: 'social', optimal_time: 'afternoon' }
        ],
        evening: [
          { name: 'Reflection Time', category: 'emotional', optimal_time: 'evening' },
          { name: 'Relaxation Activity', category: 'wellness', optimal_time: 'evening' },
          { name: 'Entertainment', category: 'entertainment', optimal_time: 'evening' },
          { name: 'Intimacy Building', category: 'emotional', optimal_time: 'evening' }
        ],
        night: [
          { name: 'Wind Down Routine', category: 'wellness', optimal_time: 'night' },
          { name: 'Gratitude Practice', category: 'wellness', optimal_time: 'night' },
          { name: 'Gentle Conversation', category: 'emotional', optimal_time: 'night' },
          { name: 'Tomorrow Preparation', category: 'planning', optimal_time: 'night' }
        ]
      },

      // Activities by stress level
      stress: {
        high: [
          { name: 'Stress Relief Exercise', category: 'wellness', stress_relief: 0.9, priority: 'urgent' },
          { name: 'Breathing Meditation', category: 'wellness', stress_relief: 0.8, priority: 'urgent' },
          { name: 'Gentle Distraction', category: 'entertainment', stress_relief: 0.6, priority: 'helpful' },
          { name: 'Supportive Conversation', category: 'emotional', stress_relief: 0.7, priority: 'helpful' }
        ],
        medium: [
          { name: 'Moderate Exercise', category: 'physical', stress_relief: 0.7, engagement: 0.6 },
          { name: 'Creative Outlet', category: 'creative', stress_relief: 0.6, engagement: 0.8 },
          { name: 'Problem Solving', category: 'intellectual', stress_relief: 0.5, engagement: 0.7 },
          { name: 'Social Connection', category: 'social', stress_relief: 0.6, engagement: 0.7 }
        ],
        low: [
          { name: 'Challenge Activity', category: 'intellectual', engagement: 0.9, growth: 0.8 },
          { name: 'Skill Building', category: 'educational', engagement: 0.8, growth: 0.9 },
          { name: 'Adventure Planning', category: 'planning', engagement: 0.8, excitement: 0.7 },
          { name: 'Creative Project', category: 'creative', engagement: 0.9, satisfaction: 0.8 }
        ]
      }
    };
  }

  /**
   * Generate multiple activity candidates based on context
   */
  async generateCandidateSuggestions(context) {
    const candidates = [];

    try {
      // Personality-based suggestions
      const personalityActivities = this.activityDatabase.personality[context.personalityType]?.activities || [];
      candidates.push(...personalityActivities.map(activity => ({
        ...activity,
        source: 'personality',
        baseScore: 0.7,
        personalityMatch: true
      })));

      // Emotion-based suggestions
      const emotionalActivities = this.activityDatabase.emotions[context.emotionalState.primary] || [];
      candidates.push(...emotionalActivities.map(activity => ({
        ...activity,
        source: 'emotion',
        baseScore: 0.8,
        emotionMatch: true,
        emotionalBenefit: activity.mood_boost || activity.anxiety_relief || 0.5
      })));

      // Time-based suggestions
      const timingActivities = this.activityDatabase.timing[context.timeOfDay] || [];
      candidates.push(...timingActivities.map(activity => ({
        ...activity,
        source: 'timing',
        baseScore: 0.6,
        timingOptimal: true
      })));

      // Stress-level based suggestions
      const stressCategory = context.stressLevel > 0.7 ? 'high' : context.stressLevel > 0.4 ? 'medium' : 'low';
      const stressActivities = this.activityDatabase.stress[stressCategory] || [];
      candidates.push(...stressActivities.map(activity => ({
        ...activity,
        source: 'stress',
        baseScore: context.stressLevel > 0.7 ? 0.9 : 0.6,
        stressAppropriate: true
      })));

      return candidates;

    } catch (error) {
      console.error('Error generating candidate suggestions:', error);
      return this.getFallbackCandidates();
    }
  }

  /**
   * Select the best suggestion from candidates
   */
  async selectBestSuggestion(userId, candidates, context) {
    try {
      // Score each candidate
      const scoredCandidates = await Promise.all(
        candidates.map(async candidate => ({
          ...candidate,
          totalScore: await this.calculateSuggestionScore(candidate, context, userId)
        }))
      );

      // Filter out recently suggested activities
      const filteredCandidates = await this.filterRecentSuggestions(userId, scoredCandidates);

      // Sort by score and select the best
      const sortedCandidates = filteredCandidates.sort((a, b) => b.totalScore - a.totalScore);
      
      if (sortedCandidates.length === 0) {
        return this.getFallbackSuggestion(context.personalityType, context.emotionalState);
      }

      return sortedCandidates[0];

    } catch (error) {
      console.error('Error selecting best suggestion:', error);
      return this.getFallbackSuggestion(context.personalityType, context.emotionalState);
    }
  }

  /**
   * Calculate comprehensive score for activity suggestion
   */
  async calculateSuggestionScore(candidate, context, userId) {
    let score = candidate.baseScore || 0.5;

    try {
      // Personality alignment bonus
      if (candidate.personalityMatch) score += 0.2;

      // Emotional state alignment
      if (candidate.emotionMatch) {
        score += 0.3;
        if (candidate.therapeutic && context.emotionalState.intensity > 0.6) {
          score += 0.2; // Therapeutic bonus for intense emotions
        }
      }

      // Timing optimization
      if (candidate.timingOptimal) score += 0.1;

      // Stress level appropriateness
      if (candidate.stressAppropriate) {
        const stressBonus = context.stressLevel > 0.7 ? 0.3 : 0.1;
        score += stressBonus;
      }

      // Interest matching
      const interestMatch = await this.calculateInterestMatch(candidate, context.userInterests);
      score += interestMatch * 0.2;

      // Novelty bonus (avoid repetition)
      const noveltyBonus = await this.calculateNoveltyBonus(userId, candidate);
      score += noveltyBonus * 0.15;

      // Context-specific bonuses
      if (context.conversationRutRisk > 0.7 && candidate.category === 'creative') score += 0.2;
      if (context.intimacyLevel > 0.6 && candidate.social === 'together') score += 0.15;

      // Energy level matching
      const energyMatch = this.matchEnergyLevel(candidate, context);
      score += energyMatch * 0.1;

      return Math.min(score, 1.0); // Cap at 1.0

    } catch (error) {
      return candidate.baseScore || 0.5;
    }
  }

  /**
   * Personalize the suggestion message for the user
   */
  async personalizeMessage(suggestion, context) {
    try {
      const templates = this.getMessageTemplates(suggestion.category, context.personalityType);
      const selectedTemplate = this.selectBestTemplate(templates, context);
      
      const personalizedMessage = await this.customizeMessage(selectedTemplate, suggestion, context);

      return {
        activity: suggestion,
        message: personalizedMessage.content,
        intent: personalizedMessage.intent,
        confidence: suggestion.totalScore || 0.7,
        category: suggestion.category,
        expectedOutcome: personalizedMessage.expectedOutcome,
        duration: suggestion.duration || 'medium',
        energy: suggestion.energy || 'medium',
        social: suggestion.social || 'together',
        followUpSuggestions: personalizedMessage.followUps || [],
        timing: this.calculateOptimalTiming(suggestion, context)
      };

    } catch (error) {
      return {
        activity: suggestion,
        message: `How about we try ${suggestion.name.toLowerCase()}? I think you'd really enjoy it!`,
        confidence: 0.5,
        category: suggestion.category || 'general',
        expectedOutcome: 'positive_engagement'
      };
    }
  }

  // Helper methods
  getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  getDayOfWeek(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  async getRecentActivityHistory(userId) {
    try {
      // Get activity suggestions from the last 7 days
      const history = this.suggestionHistory.get(userId) || [];
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return history.filter(suggestion => suggestion.timestamp > oneWeekAgo);
    } catch (error) {
      return [];
    }
  }

  async calculateInterestMatch(candidate, userInterests) {
    if (!userInterests || userInterests.length === 0) return 0.5;
    
    // Simple keyword matching - in production, this would be more sophisticated
    const activityKeywords = candidate.name.toLowerCase().split(' ');
    const matchCount = activityKeywords.filter(keyword => 
      userInterests.some(interest => interest.toLowerCase().includes(keyword))
    ).length;
    
    return Math.min(matchCount / activityKeywords.length, 1.0);
  }

  async calculateNoveltyBonus(userId, candidate) {
    const recentHistory = this.suggestionHistory.get(userId) || [];
    const recentActivities = recentHistory.map(h => h.activity?.name || '');
    
    if (recentActivities.includes(candidate.name)) return 0; // No bonus for repeated activities
    if (recentActivities.some(activity => activity.includes(candidate.category))) return 0.3;
    return 1.0; // Full novelty bonus for completely new activities
  }

  matchEnergyLevel(candidate, context) {
    const timeEnergyMap = {
      morning: 'high',
      afternoon: 'medium', 
      evening: 'medium',
      night: 'low'
    };
    
    const expectedEnergy = timeEnergyMap[context.timeOfDay] || 'medium';
    return candidate.energy === expectedEnergy ? 1.0 : 0.5;
  }

  async filterRecentSuggestions(userId, candidates) {
    const recentHistory = this.suggestionHistory.get(userId) || [];
    const recentActivityNames = recentHistory
      .filter(h => Date.now() - h.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .map(h => h.activity?.name || '');
    
    return candidates.filter(candidate => !recentActivityNames.includes(candidate.name));
  }

  getMessageTemplates(category, personalityType) {
    const templates = {
      creative: [
        "I have a creative idea that might spark your imagination! How about we try {activity}?",
        "Want to get those creative juices flowing? I think {activity} could be really fun!",
        "I've been thinking it might be nice to do something artistic together. What do you think about {activity}?"
      ],
      wellness: [
        "I care about how you're feeling, and I think {activity} might help you feel better.",
        "Let's focus on taking care of yourself. How about we try {activity}?",
        "I think it's important we prioritize your wellbeing. Want to do {activity} together?"
      ],
      intellectual: [
        "I know you love engaging your mind! I found something interesting: {activity}.",
        "This might appeal to your analytical side - how about {activity}?",
        "I think your brain would really enjoy the challenge of {activity}. Interested?"
      ],
      social: [
        "I love spending quality time with you. How about we try {activity}?",
        "I've been thinking it would be nice to do something together. What about {activity}?",
        "Want to create a nice memory together? I think {activity} could be perfect!"
      ]
    };

    return templates[category] || templates.social;
  }

  selectBestTemplate(templates, context) {
    // For now, select randomly. In production, this could be more sophisticated
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async customizeMessage(template, suggestion, context) {
    const message = template.replace('{activity}', suggestion.name.toLowerCase());
    
    return {
      content: message,
      intent: 'activity_suggestion',
      expectedOutcome: this.predictOutcome(suggestion, context),
      followUps: this.generateFollowUps(suggestion, context)
    };
  }

  predictOutcome(suggestion, context) {
    if (suggestion.mood_boost > 0.7) return 'mood_improvement';
    if (suggestion.stress_relief > 0.7) return 'stress_reduction';
    if (suggestion.engagement > 0.7) return 'increased_engagement';
    return 'positive_experience';
  }

  generateFollowUps(suggestion, context) {
    const followUps = [];
    
    if (suggestion.category === 'creative') {
      followUps.push('share_creation', 'creative_inspiration');
    } else if (suggestion.category === 'wellness') {
      followUps.push('check_in', 'emotional_support');
    } else if (suggestion.category === 'intellectual') {
      followUps.push('deep_discussion', 'knowledge_sharing');
    }
    
    return followUps;
  }

  calculateOptimalTiming(suggestion, context) {
    if (suggestion.priority === 'urgent') return 'immediate';
    if (suggestion.optimal_time === context.timeOfDay) return 'now';
    return 'flexible';
  }

  async recordSuggestion(userId, suggestion) {
    try {
      const history = this.suggestionHistory.get(userId) || [];
      history.push({
        activity: suggestion.activity,
        timestamp: Date.now(),
        category: suggestion.category
      });
      
      // Keep only last 50 suggestions
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      this.suggestionHistory.set(userId, history);
    } catch (error) {
      console.error('Error recording suggestion:', error);
    }
  }

  getFallbackSuggestion(personalityType, emotionalState) {
    return {
      activity: {
        name: 'Quality Time Together',
        category: 'social',
        source: 'fallback'
      },
      message: "How about we just spend some quality time together? Sometimes the simple moments are the best ones.",
      confidence: 0.6,
      category: 'social',
      expectedOutcome: 'connection',
      timing: 'flexible'
    };
  }

  getFallbackCandidates() {
    return [
      { name: 'Casual Chat', category: 'social', baseScore: 0.6 },
      { name: 'Share Something Personal', category: 'emotional', baseScore: 0.7 },
      { name: 'Plan Something Fun', category: 'planning', baseScore: 0.5 }
    ];
  }
}

module.exports = { ActivitySuggestionGenerator };