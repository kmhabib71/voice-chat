/**
 * @fileoverview OpenAI API integration for GPT-4 mini and Whisper
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * 
 * @example
 * const openaiClient = require('./openai');
 * const response = await openaiClient.generateResponse(message, emotion);
 */

const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate AI response with emotional context for general content
   * @param {string} userMessage - User's input message
   * @param {string} emotion - Detected emotion
   * @param {Object} conversationMemory - Conversation memory context
   * @returns {Promise<string>} AI response
   */
  async generateEmotionalResponse(userMessage, emotion, conversationMemory = null) {
    try {
      console.log('\n🎯 === OPENAI: generateEmotionalResponse START ===');
      console.log('📝 Input message:', userMessage);
      console.log('😊 Emotion:', emotion);
      console.log('🧠 Memory context received:', conversationMemory ? 'YES' : 'NO');
      if (conversationMemory) {
        // Support both Enhanced Context Builder and legacy formats
        const contextBuilt = conversationMemory.metadata?.contextBuilt || conversationMemory.contextBuilt;
        const userFactsCount = conversationMemory.personalFacts?.length || conversationMemory.userFacts?.length || 0;
        const recentMemoriesCount = conversationMemory.recentContext?.length || conversationMemory.recentMemories?.length || 0;
        const episodicMemoriesCount = conversationMemory.relevantMemories?.length || conversationMemory.episodicMemories?.length || 0;
        
        console.log('📊 Memory context structure:', {
          contextBuilt,
          userFactsCount,
          recentMemoriesCount,
          episodicMemoriesCount,
          hasEmotionalContext: !!conversationMemory.emotionalContext,
          builderType: conversationMemory.metadata ? 'Enhanced' : 'Legacy'
        });
        
        // Show semantic memories from Enhanced Context Builder
        const memories = conversationMemory.relevantMemories || conversationMemory.episodicMemories;
        if (memories?.length > 0) {
          console.log('🎭 Relevant memories content:');
          memories.forEach((ep, i) => {
            console.log(`  Memory ${i+1}: "${(ep.summary || ep)?.substring(0, 80)}..."`);
          });
        }
        
        // Show user facts
        const facts = conversationMemory.personalFacts || conversationMemory.userFacts;
        if (facts?.length > 0) {
          console.log('👤 User facts:');
          facts.forEach((fact, i) => {
            const value = fact.value || fact;
            console.log(`  Fact ${i+1}: "${value?.substring(0, 60)}..."`);
          });
        }
      }

      const emotionalContext = {
        joy: "Respond with enthusiasm and positive energy",
        sadness: "Respond with empathy and gentle comfort", 
        anger: "Respond with understanding and calming tone",
        fear: "Respond with reassurance and support",
        surprise: "Respond with engagement and curiosity",
        love: "Respond with warmth and affection",
        neutral: "Respond naturally and helpfully"
      };

      // Build context-aware system prompt with Enhanced Context Builder support
      let systemPrompt = `You are Emma, a caring and empathetic AI companion. The user seems to be feeling ${emotion}. ${emotionalContext[emotion]}. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships.`;
      
      // Add Enhanced Memory Context (Task Group 1.4 structure)
      if (conversationMemory && (conversationMemory.metadata?.contextBuilt || conversationMemory.contextBuilt)) {
        let contextInfo = '';
        
        // Handle Enhanced Context Builder format (new structure)
        if (conversationMemory.personalFacts) {
          const userFacts = conversationMemory.personalFacts.slice(0, 3);
          if (userFacts.length > 0) {
            const factsList = userFacts.map(f => f.value || f).join(', ');
            contextInfo += ` What you know about the user: ${factsList}.`;
          }
        }
        
        // Add semantic memories from Enhanced Context Builder
        if (conversationMemory.relevantMemories) {
          const episodicContext = conversationMemory.relevantMemories
            .slice(0, 2) // Keep token usage efficient
            .map(episode => {
              const summary = episode.summary || episode;
              // Extract user's part only (before "AI responded") for context
              const userPart = summary.split('AI responded:')[0].replace('User shared: ', '').trim();
              return userPart || summary.substring(0, 80);
            })
            .filter(info => info && info.length > 10)
            .join(', ');
            
          if (episodicContext) {
            contextInfo += ` Previous relevant conversations: ${episodicContext}.`;
          }
        }
        
        // Add emotional context from Enhanced Context Builder
        if (conversationMemory.emotionalContext) {
          const emotional = conversationMemory.emotionalContext;
          if (emotional.relationshipDepth && emotional.relationshipDepth !== 'superficial') {
            contextInfo += ` Relationship level: ${emotional.relationshipDepth}.`;
          }
          if (emotional.currentEmotion && emotional.currentEmotion !== 'neutral') {
            contextInfo += ` User's recent emotional state: ${emotional.currentEmotion}.`;
          }
        }
        
        // Add recent context from Enhanced Context Builder
        if (conversationMemory.recentContext && conversationMemory.recentContext.length > 0) {
          const recentInfo = conversationMemory.recentContext
            .slice(0, 2)
            .map(msg => msg.content || msg)
            .filter(content => content && content.length > 5)
            .join(', ');
          if (recentInfo) {
            contextInfo += ` Recent conversation: ${recentInfo}.`;
          }
        }
        
        // Legacy support for old context structure
        if (!conversationMemory.personalFacts && conversationMemory.userFacts) {
          const recentFacts = conversationMemory.userFacts.slice(0, 3).map(f => f.value);
          contextInfo += ` User context: ${recentFacts.join(', ')}.`;
        }
        
        if (!conversationMemory.relevantMemories && conversationMemory.episodicMemories) {
          const episodicContext = conversationMemory.episodicMemories
            .slice(0, 2)
            .map(episode => {
              const summary = episode.summary || 'Past conversation';
              const userPart = summary.split('AI responded:')[0].replace('User shared: ', '').trim();
              return userPart || summary.substring(0, 80);
            })
            .filter(info => info && info.length > 10)
            .join(', ');
            
          if (episodicContext) {
            contextInfo += ` Relevant past conversations: ${episodicContext}.`;
          }
        }
        
        if (contextInfo) {
          systemPrompt += ` ${contextInfo}`;
        }
      }

      console.log('📋 Final system prompt:', systemPrompt);
      console.log('👤 User message:', userMessage);

      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 50,
        temperature: 0.5,
        stream: false
      });

      const response = completion.choices[0].message.content;
      console.log('✅ OpenAI response:', response);
      console.log('🎉 === OPENAI: generateEmotionalResponse COMPLETE ===\n');
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return `I understand you're feeling ${emotion}. I'm here to help you.`;
    }
  }

  /**
   * Extract keywords using OpenAI GPT-4 mini
   * @param {string} text - Text to analyze
   * @param {Array} context - Previous conversation topics
   * @returns {Promise<Object>} Extracted keywords and classifications
   */
  async extractKeywords(text, context = []) {
    try {
      console.log('\n🎯 === OPENAI: extractKeywords START ===');
      console.log(`📝 Input text: "${text}"`);
      console.log(`📚 Context topics: [${context.join(', ')}]`);
      
      const contextKeywords = context.length > 0 ? 
        `Previous conversation topics: ${context.join(', ')}.` : '';
      
      const systemPrompt = `Extract key information from user messages in JSON format with context awareness. ${contextKeywords}
      
Extract:
- entities: people, places, things, brands (max 5)
- topics: main subjects/themes (max 4)  
- intents: user intentions (question/request/statement/greeting) (max 3)
- emotions: emotional indicators (max 3)
- context: situational markers (technical/personal/urgent/casual) (max 3)
- nsfw_classification: { "isNSFW": boolean, "category": "general|romantic|sexual|intimate", "confidence": 0.0-1.0 }

CONTEXT ANALYSIS (NEW):
- subject_analysis: { "primary_subject": "self|friend|family|colleague|other|unclear", "confidence": 0.0-1.0 }
- information_ownership: { "belongs_to_user": boolean, "about_user": boolean, "about_others": boolean }
- temporal_context: { "timeframe": "current|past|future|hypothetical", "certainty": "factual|speculative|storytelling" }
- relationship_context: { "mentioned_people": ["relationship_type"], "user_involvement": "direct|indirect|observer" }

Context Rules:
- "I am/I'm/My" + factual statement = belongs_to_user: true, about_user: true
- "My friend/He/She said" = belongs_to_user: false, about_others: true  
- "If I were/What if" = timeframe: hypothetical, certainty: speculative
- Past tense verbs = timeframe: past
- Future plans = timeframe: future

NSFW includes: explicit sexual content, graphic intimate descriptions, sexting, adult content requests, erotic roleplay.
General includes: casual chat, work, hobbies, technical topics, general questions, friendly conversation, memory questions, identity discussions, relationship status mentions.

Return only valid JSON object.`;

      console.log('🤖 Calling OpenAI GPT-4o-mini for keyword extraction...');
      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 250,
        temperature: 0.3,
        stream: false
      });
      console.log('✅ OpenAI response received');

      try {
        console.log('🔄 Parsing OpenAI JSON response...');
        const rawResponse = completion.choices[0].message.content;
        console.log('📋 Raw OpenAI response:', rawResponse);
        
        const keywords = JSON.parse(rawResponse);
        console.log('✅ Successfully parsed keywords:', keywords);
        
        const result = {
          entities: keywords.entities || [],
          topics: keywords.topics || [],
          intents: keywords.intents || [],
          emotions: keywords.emotions || [],
          context: keywords.context || [],
          nsfw_classification: keywords.nsfw_classification || {
            isNSFW: false,
            category: 'general',
            confidence: 0.5
          },
          // Enhanced context analysis
          subject_analysis: keywords.subject_analysis || {
            primary_subject: 'unclear',
            confidence: 0.5
          },
          information_ownership: keywords.information_ownership || {
            belongs_to_user: true,
            about_user: true,
            about_others: false
          },
          temporal_context: keywords.temporal_context || {
            timeframe: 'current',
            certainty: 'factual'
          },
          relationship_context: keywords.relationship_context || {
            mentioned_people: [],
            user_involvement: 'direct'
          }
        };
        
        console.log('🎉 === OPENAI: extractKeywords COMPLETE ===');
        console.log(`📊 Extracted: ${result.entities.length} entities, ${result.topics.length} topics`);
        console.log(`🏷️  NSFW: ${result.nsfw_classification.isNSFW} (${result.nsfw_classification.category})`);
        console.log(`🧠 Context: ${result.subject_analysis.primary_subject} about ${result.information_ownership.about_user ? 'USER' : 'OTHERS'}`);
        
        return result;
      } catch (parseError) {
        const { detectEmotionFromText } = require('../utils/helpers');
        const fallbackEmotion = detectEmotionFromText(text);
        return {
          entities: [],
          topics: [text.split(' ').slice(0, 3).join(' ')],
          intents: ['statement'],
          emotions: [fallbackEmotion],
          context: ['general'],
          nsfw_classification: {
            isNSFW: false,
            category: 'general', 
            confidence: 0.5
          },
          subject_analysis: {
            primary_subject: 'unclear',
            confidence: 0.3
          },
          information_ownership: {
            belongs_to_user: true,
            about_user: true,
            about_others: false
          },
          temporal_context: {
            timeframe: 'current',
            certainty: 'factual'
          },
          relationship_context: {
            mentioned_people: [],
            user_involvement: 'direct'
          }
        };
      }
    } catch (error) {
      console.error('Keyword extraction failed:', error.message);
      const { detectEmotionFromText } = require('../utils/helpers');
      const fallbackEmotion = detectEmotionFromText(text);
      return {
        entities: [],
        topics: [],
        intents: ['statement'],
        emotions: [fallbackEmotion],
        context: ['general'],
        nsfw_classification: {
          isNSFW: false,
          category: 'general',
          confidence: 0.5
        },
        subject_analysis: {
          primary_subject: 'unclear',
          confidence: 0.2
        },
        information_ownership: {
          belongs_to_user: true,
          about_user: true,
          about_others: false
        },
        temporal_context: {
          timeframe: 'current',
          certainty: 'factual'
        },
        relationship_context: {
          mentioned_people: [],
          user_involvement: 'direct'
        }
      };
    }
  }

  /**
   * Generate vector embeddings using OpenAI text-embedding-3-small
   * @param {string} text - Text to create embeddings for
   * @returns {Promise<Array>} Vector embedding (1536 dimensions)
   */
  async createEmbedding(text) {
    try {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Valid text is required for embedding generation');
      }

      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.trim(),
        encoding_format: 'float'
      });

      const embedding = response.data[0].embedding;
      
      if (!Array.isArray(embedding) || embedding.length !== 1536) {
        throw new Error('Invalid embedding format received from OpenAI');
      }

      return embedding;
    } catch (error) {
      console.error('Embedding creation failed:', error.message);
      throw new Error(`Could not create embedding: ${error.message}`);
    }
  }

  /**
   * Generate AI summary for session content
   * @param {Array} messages - Array of conversation messages
   * @param {Object} options - Summarization options
   * @returns {Promise<string>} Generated summary
   */
  async generateSessionSummary(messages, options = {}) {
    try {
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Valid messages array is required');
      }

      const {
        maxLength = 200,
        focusOn = ['key_topics', 'emotions', 'important_facts'],
        includeMetadata = true
      } = options;

      // Build conversation text from messages
      let conversationText = messages
        .filter(msg => msg.content && msg.content.trim())
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Truncate if too long for context
      if (conversationText.length > 8000) {
        conversationText = conversationText.substring(0, 8000) + '\n[...conversation truncated...]';
      }

      const systemPrompt = `You are an AI that creates concise, insightful summaries of conversations. 

Your task:
- Summarize the key points, emotions, and important information from this conversation
- Focus on: ${focusOn.join(', ')}
- Maximum ${maxLength} words
- Capture the essence and emotional tone
- Highlight any significant revelations or life events
- Note relationship developments or important preferences shared

Be precise and meaningful. This summary will be used for memory and context retrieval.`;

      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText }
        ],
        max_tokens: Math.floor(maxLength * 1.5), // Allow some buffer
        temperature: 0.3, // Lower temperature for consistency
        stream: false
      });

      const summary = completion.choices[0].message.content.trim();

      if (!summary || summary.length < 10) {
        throw new Error('Generated summary too short or empty');
      }

      return summary;
    } catch (error) {
      console.error('Session summary generation failed:', error.message);
      throw new Error(`Could not generate session summary: ${error.message}`);
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {string} mimetype - Audio file MIME type
   * @returns {Promise<string>} Transcribed text
   */
  async transcribeAudio(audioBuffer, mimetype) {
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.webm', { type: mimetype }),
        model: 'whisper-1',
      });

      return transcription.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Could not transcribe audio: ${error.message}`);
    }
  }

  /**
   * Generate vector embedding for text
   * @param {string} text - Text to embed
   * @returns {Promise<Array>} Vector embedding array
   */
  async generateEmbedding(text) {
    try {
      console.log('🔢 Generating vector embedding for text:', text.substring(0, 50) + '...');
      
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small', // 1536 dimensions, efficient and good quality
        input: text,
        encoding_format: 'float'
      });

      const embedding = response.data[0].embedding;
      console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
      
      return embedding;

    } catch (error) {
      console.error('❌ OpenAI embedding generation failed:', error.message);
      
      // Return null instead of empty array to indicate failure
      return null;
    }
  }

  /**
   * Generate general chat completion (for personality analysis)
   * @param {string} prompt - Prompt for the AI
   * @param {Object} options - Options for the completion
   * @returns {Promise<string>} AI response
   */
  async generateChatCompletion(prompt, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      });

      return completion.choices[0].message.content;

    } catch (error) {
      console.error('❌ OpenAI chat completion failed:', error.message);
      throw error;
    }
  }
}

module.exports = new OpenAIService();