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
      const emotionalContext = {
        joy: "Respond with enthusiasm and positive energy",
        sadness: "Respond with empathy and gentle comfort", 
        anger: "Respond with understanding and calming tone",
        fear: "Respond with reassurance and support",
        surprise: "Respond with engagement and curiosity",
        love: "Respond with warmth and affection",
        neutral: "Respond naturally and helpfully"
      };

      // Build context-aware system prompt
      let systemPrompt = `You are an empathetic AI assistant. The user seems to be feeling ${emotion}. ${emotionalContext[emotion]}. Keep your response concise but emotionally appropriate.`;
      
      // Add conversation memory context if available
      if (conversationMemory) {
        const { buildContextFromMemory } = require('../features/memory/ContextBuilder');
        const { contextPrompt } = buildContextFromMemory(userMessage, conversationMemory);
        if (contextPrompt) {
          systemPrompt += ` Context: ${contextPrompt}`;
        }
      }

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

      return completion.choices[0].message.content;
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

NSFW includes: romantic expressions, sexual content, intimate conversations, flirting, dating topics, relationship intimacy, love declarations.
General includes: casual chat, work, hobbies, technical topics, general questions, friendly conversation.

Return only valid JSON object.`;

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

      try {
        const keywords = JSON.parse(completion.choices[0].message.content);
        return {
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
}

module.exports = new OpenAIService();