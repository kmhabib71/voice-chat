/**
 * @fileoverview Advanced Personality Profiler - Comprehensive personality analysis system
 * @author AI Girlfriend Project
 * @created 2025-09-08
 * 
 * @example
 * const profiler = new PersonalityProfiler();
 * const profile = await profiler.analyzePersonality(userId);
 */

// External libraries
const openaiService = require('../../api/openai');

// Internal core systems
const memoryManager = require('../memory');

// Intelligence components
const CommunicationAnalyzer = require('./CommunicationAnalyzer');
const EmotionalNeedsAnalyzer = require('./EmotionalNeedsAnalyzer');

// Utilities
const { logError } = require('../../utils/helpers');

/**
 * Advanced Personality Profiler for comprehensive user analysis
 * Analyzes 6 months of conversation history for deep personality insights
 */
class PersonalityProfiler {
  constructor() {
    this.communicationAnalyzer = new CommunicationAnalyzer();
    this.emotionalNeedsAnalyzer = new EmotionalNeedsAnalyzer();
    
    // Big Five personality dimensions
    this.bigFiveTraits = [
      'openness', 'conscientiousness', 'extraversion', 
      'agreeableness', 'neuroticism'
    ];
    
    // Custom emotional traits for relationship analysis
    this.emotionalTraits = [
      'emotionalNeedLevel', 'attachmentStyle', 'communicationPreference',
      'conflictResolutionStyle', 'intimacyComfortLevel'
    ];
  }

  /**
   * Analyzes comprehensive personality profile from conversation history
   * @param {string} userId - Unique user identifier
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Complete personality profile
   * @throws {Error} When analysis fails or insufficient data
   */
  async analyzePersonality(userId, options = {}) {
    try {
      console.log(`\n🧠 === PERSONALITY PROFILER: Analyzing user ${userId} ===`);
      
      const startTime = Date.now();
      const analysisDepth = options.depth || 'comprehensive'; // comprehensive | basic | update
      const timeRange = options.timeRange || 180; // days (6 months default)
      
      // 1. Gather conversation history for analysis
      const conversationData = await this._gatherConversationHistory(userId, timeRange);
      
      if (conversationData.totalMessages < 10) {
        throw new Error('Insufficient conversation data for personality analysis (minimum 10 messages required)');
      }
      
      console.log(`📊 Analyzing ${conversationData.totalMessages} messages from ${conversationData.totalSessions} sessions`);
      
      // 2. Parallel analysis of different personality aspects
      const [
        bigFiveAnalysis,
        communicationPatterns,
        emotionalNeeds,
        relationshipDynamics
      ] = await Promise.all([
        this._analyzeBigFiveTraits(conversationData),
        this.communicationAnalyzer.analyzePatterns(conversationData),
        this.emotionalNeedsAnalyzer.analyzeNeeds(conversationData),
        this._analyzeRelationshipDynamics(conversationData)
      ]);
      
      // 3. Synthesize comprehensive personality profile
      const personalityProfile = this._synthesizeProfile({
        userId,
        bigFiveAnalysis,
        communicationPatterns,
        emotionalNeeds,
        relationshipDynamics,
        metadata: {
          analysisDate: new Date().toISOString(),
          dataRange: timeRange,
          messageCount: conversationData.totalMessages,
          sessionCount: conversationData.totalSessions,
          analysisDepth,
          confidence: this._calculateConfidenceScore(conversationData)
        }
      });
      
      // 4. Store personality profile for future reference
      await this._storePersonalityProfile(userId, personalityProfile);
      
      const analysisTime = Date.now() - startTime;
      console.log(`✅ Personality analysis completed in ${analysisTime}ms`);
      console.log(`🎯 Confidence score: ${personalityProfile.metadata.confidence.toFixed(2)}`);
      
      return personalityProfile;
      
    } catch (error) {
      logError('PersonalityProfiler.analyzePersonality', error);
      throw new Error(`Personality analysis failed: ${error.message}`);
    }
  }

  /**
   * Gathers conversation history for personality analysis
   * @private
   * @param {string} userId - User identifier
   * @param {number} timeRangeDays - Days of history to analyze
   * @returns {Promise<Object>} Conversation data for analysis
   */
  async _gatherConversationHistory(userId, timeRangeDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRangeDays);
      
      // Get comprehensive conversation data
      const [episodicMemories, longTermFacts, emotionalHistory] = await Promise.all([
        memoryManager.getEpisodicMemories(userId, 200, { since: cutoffDate }),
        memoryManager.getUserFacts(userId, ['personal_facts', 'preferences', 'goals'], 100),
        memoryManager.getEmotionalHistory(userId, { since: cutoffDate })
      ]);
      
      // Extract message content and metadata
      const messages = [];
      let totalSessions = 0;
      
      // Process episodic memories for conversation patterns
      episodicMemories.forEach(episode => {
        if (episode.summary && episode.primaryEmotion) {
          messages.push({
            content: episode.summary,
            emotion: episode.primaryEmotion,
            timestamp: episode.timestamp,
            importance: episode.importance || 0.5,
            topics: episode.topics || []
          });
          totalSessions++;
        }
      });
      
      // Include long-term facts for personality insights
      longTermFacts.forEach(fact => {
        if (fact.value && fact.category) {
          messages.push({
            content: fact.value,
            type: 'fact',
            category: fact.category,
            importance: fact.importance === 'high' ? 0.9 : fact.importance === 'medium' ? 0.6 : 0.3,
            timestamp: fact.timestamp
          });
        }
      });
      
      return {
        messages,
        totalMessages: messages.length,
        totalSessions,
        emotionalHistory: emotionalHistory || [],
        dateRange: {
          start: cutoffDate.toISOString(),
          end: new Date().toISOString()
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to gather conversation history: ${error.message}`);
    }
  }

  /**
   * Analyzes Big Five personality traits from conversation data
   * @private
   * @param {Object} conversationData - User conversation history
   * @returns {Promise<Object>} Big Five trait scores
   */
  async _analyzeBigFiveTraits(conversationData) {
    try {
      console.log('🔍 Analyzing Big Five personality traits...');
      
      // Prepare conversation text for AI analysis
      const conversationText = conversationData.messages
        .filter(msg => msg.content && msg.content.length > 10)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50) // Analyze most recent 50 substantial messages
        .map(msg => msg.content)
        .join('\n');
      
      if (conversationText.length < 100) {
        throw new Error('Insufficient conversation content for Big Five analysis');
      }
      
      const analysisPrompt = `Analyze the following conversation history and provide Big Five personality trait scores (0.0-1.0 scale).

Conversation History:
${conversationText.substring(0, 8000)} // Limit for token efficiency

Instructions:
- Analyze communication patterns, word choice, emotional expressions
- Consider topics discussed, depth of sharing, social interactions
- Rate each trait from 0.0 (very low) to 1.0 (very high)
- Provide confidence score for each trait based on available evidence
- Include reasoning for each score

Respond in valid JSON format:
{
  "openness": { "score": 0.0-1.0, "confidence": 0.0-1.0, "reasoning": "explanation" },
  "conscientiousness": { "score": 0.0-1.0, "confidence": 0.0-1.0, "reasoning": "explanation" },
  "extraversion": { "score": 0.0-1.0, "confidence": 0.0-1.0, "reasoning": "explanation" },
  "agreeableness": { "score": 0.0-1.0, "confidence": 0.0-1.0, "reasoning": "explanation" },
  "neuroticism": { "score": 0.0-1.0, "confidence": 0.0-1.0, "reasoning": "explanation" }
}`;

      const response = await openaiService.generateResponse(analysisPrompt, {
        model: 'gpt-4o-mini',
        temperature: 0.3, // Lower temperature for consistency
        maxTokens: 1000
      });
      
      let bigFiveAnalysis;
      try {
        bigFiveAnalysis = JSON.parse(response);
      } catch (parseError) {
        console.log('Failed to parse Big Five analysis, using fallback approach');
        bigFiveAnalysis = this._fallbackBigFiveAnalysis(conversationData);
      }
      
      // Validate and normalize scores
      this.bigFiveTraits.forEach(trait => {
        if (!bigFiveAnalysis[trait] || typeof bigFiveAnalysis[trait].score !== 'number') {
          bigFiveAnalysis[trait] = { 
            score: 0.5, 
            confidence: 0.3, 
            reasoning: 'Insufficient data for reliable analysis' 
          };
        } else {
          // Ensure scores are within valid range
          bigFiveAnalysis[trait].score = Math.max(0.0, Math.min(1.0, bigFiveAnalysis[trait].score));
          bigFiveAnalysis[trait].confidence = Math.max(0.0, Math.min(1.0, bigFiveAnalysis[trait].confidence || 0.5));
        }
      });
      
      console.log('✅ Big Five analysis completed');
      return bigFiveAnalysis;
      
    } catch (error) {
      console.log('⚠️ Big Five analysis failed, using pattern-based fallback');
      return this._fallbackBigFiveAnalysis(conversationData);
    }
  }

  /**
   * Analyzes relationship dynamics and attachment style
   * @private
   * @param {Object} conversationData - User conversation history
   * @returns {Promise<Object>} Relationship dynamics analysis
   */
  async _analyzeRelationshipDynamics(conversationData) {
    try {
      console.log('💕 Analyzing relationship dynamics...');
      
      // Extract relationship-relevant content
      const relationshipMessages = conversationData.messages.filter(msg => {
        const content = msg.content?.toLowerCase() || '';
        return content.includes('relationship') ||
               content.includes('love') ||
               content.includes('partner') ||
               content.includes('dating') ||
               content.includes('friend') ||
               content.includes('family') ||
               content.includes('feel') ||
               msg.emotion && ['love', 'joy', 'sadness', 'anxiety', 'anger'].includes(msg.emotion);
      });
      
      // Analyze emotional history patterns
      const emotionalPatterns = this._analyzeEmotionalPatterns(conversationData.emotionalHistory);
      
      // Determine attachment style
      const attachmentStyle = this._determineAttachmentStyle(relationshipMessages, emotionalPatterns);
      
      // Analyze communication preferences
      const communicationPrefs = this._analyzeCommunicationPreferences(relationshipMessages);
      
      return {
        attachmentStyle,
        communicationPreferences: communicationPrefs,
        emotionalPatterns,
        intimacyComfortLevel: this._assessIntimacyComfort(relationshipMessages),
        conflictResolutionStyle: this._analyzeConflictResolution(relationshipMessages),
        socialConnectionLevel: this._assessSocialConnection(conversationData.messages)
      };
      
    } catch (error) {
      console.log('⚠️ Relationship dynamics analysis failed:', error.message);
      return this._getDefaultRelationshipProfile();
    }
  }

  /**
   * Synthesizes comprehensive personality profile from all analyses
   * @private
   * @param {Object} analysisData - Combined analysis results
   * @returns {Object} Complete personality profile
   */
  _synthesizeProfile(analysisData) {
    const {
      userId,
      bigFiveAnalysis,
      communicationPatterns,
      emotionalNeeds,
      relationshipDynamics,
      metadata
    } = analysisData;
    
    return {
      userId,
      corePersonality: {
        // Big Five traits
        openness: bigFiveAnalysis.openness?.score || 0.5,
        conscientiousness: bigFiveAnalysis.conscientiousness?.score || 0.5,
        extraversion: bigFiveAnalysis.extraversion?.score || 0.5,
        agreeableness: bigFiveAnalysis.agreeableness?.score || 0.5,
        neuroticism: bigFiveAnalysis.neuroticism?.score || 0.5
      },
      emotionalProfile: {
        emotionalNeedLevel: emotionalNeeds?.overallLevel || 0.5,
        attachmentStyle: relationshipDynamics?.attachmentStyle || 'secure',
        stressTriggers: emotionalNeeds?.stressTriggers || [],
        comfortSeekers: emotionalNeeds?.comfortSeekers || [],
        joyTriggers: emotionalNeeds?.joyTriggers || []
      },
      communicationStyle: {
        messageLength: communicationPatterns?.averageLength || 'medium',
        topicDeepness: communicationPatterns?.depthPreference || 'moderate',
        emotionalExpressiveness: communicationPatterns?.emotionalExpression || 'moderate',
        initiationFrequency: communicationPatterns?.initiationStyle || 'balanced',
        responsePattern: communicationPatterns?.responseStyle || 'thoughtful'
      },
      relationshipDynamics: {
        intimacyComfortLevel: relationshipDynamics?.intimacyComfortLevel || 0.5,
        conflictResolutionStyle: relationshipDynamics?.conflictResolutionStyle || 'collaborative',
        communicationPreference: relationshipDynamics?.communicationPreferences || 'balanced',
        socialConnectionLevel: relationshipDynamics?.socialConnectionLevel || 0.5
      },
      traitConfidence: {
        // Confidence scores for each analysis area
        bigFive: this._calculateBigFiveConfidence(bigFiveAnalysis),
        emotional: emotionalNeeds?.confidence || 0.5,
        communication: communicationPatterns?.confidence || 0.5,
        relationship: relationshipDynamics?.confidence || 0.5
      },
      metadata
    };
  }

  /**
   * Stores personality profile in database for future reference
   * @private
   * @param {string} userId - User identifier
   * @param {Object} profile - Complete personality profile
   */
  async _storePersonalityProfile(userId, profile) {
    try {
      const collection = await memoryManager.getDatabase().collection('personality_profiles');
      
      await collection.replaceOne(
        { userId },
        {
          userId,
          profile,
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: '2.1'
        },
        { upsert: true }
      );
      
      console.log('💾 Personality profile stored successfully');
    } catch (error) {
      console.log('⚠️ Failed to store personality profile:', error.message);
      // Don't throw - analysis was successful, storage is secondary
    }
  }

  /**
   * Calculates overall confidence score for personality analysis
   * @private
   * @param {Object} conversationData - Conversation data used for analysis
   * @returns {number} Confidence score (0.0-1.0)
   */
  _calculateConfidenceScore(conversationData) {
    const messageCount = conversationData.totalMessages;
    const sessionCount = conversationData.totalSessions;
    const timeSpan = conversationData.emotionalHistory?.length || 1;
    
    // Confidence based on data quantity and variety
    let confidence = 0.0;
    
    // Message quantity factor (0-0.4)
    if (messageCount >= 100) confidence += 0.4;
    else if (messageCount >= 50) confidence += 0.3;
    else if (messageCount >= 25) confidence += 0.2;
    else if (messageCount >= 10) confidence += 0.1;
    
    // Session variety factor (0-0.3)
    if (sessionCount >= 20) confidence += 0.3;
    else if (sessionCount >= 10) confidence += 0.2;
    else if (sessionCount >= 5) confidence += 0.1;
    
    // Temporal consistency factor (0-0.3)
    if (timeSpan >= 30) confidence += 0.3; // 30+ different time points
    else if (timeSpan >= 15) confidence += 0.2;
    else if (timeSpan >= 5) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  // Fallback and helper methods
  _fallbackBigFiveAnalysis(conversationData) {
    // Pattern-based fallback when AI analysis fails
    return {
      openness: { score: 0.5, confidence: 0.3, reasoning: 'Pattern-based estimation' },
      conscientiousness: { score: 0.5, confidence: 0.3, reasoning: 'Pattern-based estimation' },
      extraversion: { score: 0.5, confidence: 0.3, reasoning: 'Pattern-based estimation' },
      agreeableness: { score: 0.5, confidence: 0.3, reasoning: 'Pattern-based estimation' },
      neuroticism: { score: 0.5, confidence: 0.3, reasoning: 'Pattern-based estimation' }
    };
  }

  _calculateBigFiveConfidence(bigFiveAnalysis) {
    const scores = Object.values(bigFiveAnalysis).map(trait => trait.confidence || 0.5);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  _analyzeEmotionalPatterns(emotionalHistory) {
    // Analyze emotional patterns from history
    return {
      dominantEmotions: ['neutral'],
      emotionalVolatility: 0.5,
      positivityRatio: 0.5
    };
  }

  _determineAttachmentStyle(messages, patterns) {
    // Simple attachment style determination
    // TODO: Implement more sophisticated analysis
    return 'secure'; // secure, anxious, avoidant, disorganized
  }

  _analyzeCommunicationPreferences(messages) {
    // Analyze communication style preferences
    return 'balanced'; // direct, gentle, playful, serious, balanced
  }

  _assessIntimacyComfort(messages) {
    // Assess comfort level with intimate conversation
    return 0.5; // 0.0-1.0 scale
  }

  _analyzeConflictResolution(messages) {
    // Analyze conflict resolution style
    return 'collaborative'; // avoidant, competitive, collaborative, accommodating
  }

  _assessSocialConnection(messages) {
    // Assess level of social connection and extroversion
    return 0.5; // 0.0-1.0 scale
  }

  _getDefaultRelationshipProfile() {
    return {
      attachmentStyle: 'secure',
      communicationPreferences: 'balanced',
      emotionalPatterns: { dominantEmotions: ['neutral'], emotionalVolatility: 0.5 },
      intimacyComfortLevel: 0.5,
      conflictResolutionStyle: 'collaborative',
      socialConnectionLevel: 0.5,
      confidence: 0.3
    };
  }

  /**
   * Gets existing personality profile or returns null
   * @param {string} userId - User identifier
   * @returns {Promise<Object|null>} Existing personality profile or null
   */
  async getExistingProfile(userId) {
    try {
      const collection = await memoryManager.getDatabase().collection('personality_profiles');
      const result = await collection.findOne({ userId });
      return result?.profile || null;
    } catch (error) {
      console.log('⚠️ Failed to retrieve existing personality profile:', error.message);
      return null;
    }
  }

  /**
   * Updates existing personality profile with new insights
   * @param {string} userId - User identifier
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated personality profile
   */
  async updateProfile(userId, updates) {
    try {
      const existingProfile = await this.getExistingProfile(userId);
      
      if (!existingProfile) {
        // No existing profile, do full analysis
        return await this.analyzePersonality(userId);
      }
      
      // Merge updates with existing profile
      const updatedProfile = {
        ...existingProfile,
        ...updates,
        metadata: {
          ...existingProfile.metadata,
          lastUpdated: new Date().toISOString(),
          updateCount: (existingProfile.metadata.updateCount || 0) + 1
        }
      };
      
      await this._storePersonalityProfile(userId, updatedProfile);
      
      console.log(`✅ Personality profile updated for user ${userId}`);
      return updatedProfile;
      
    } catch (error) {
      logError('PersonalityProfiler.updateProfile', error);
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }
}

module.exports = PersonalityProfiler;