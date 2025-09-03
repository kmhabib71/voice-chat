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
      
      const systemPrompt = `Extract key information from user messages in JSON format. ${contextKeywords}
      
Extract:
- entities: people, places, things, brands (max 5)
- topics: main subjects/themes (max 4)  
- intents: user intentions (question/request/statement/greeting) (max 3)
- emotions: emotional indicators (max 3)
- context: situational markers (technical/personal/urgent/casual) (max 3)
- nsfw_classification: { "isNSFW": boolean, "category": "general|romantic|sexual|intimate", "confidence": 0.0-1.0 }

NSFW includes: romantic expressions, sexual content, intimate conversations, flirting, dating topics, relationship intimacy, love declarations.
General includes: casual chat, work, hobbies, technical topics, general questions, friendly conversation.

Return only valid JSON object.`;

      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 150,
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
        }
      };
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