/**
 * @fileoverview Llama 3.3 API integration for NSFW content via OpenRouter with Memory v2
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * @updated 2025-09-05 - Integrated Memory v2 system
 * 
 * @example
 * const llamaService = require('./llama');
 * const response = await llamaService.generateNSFWResponse(message, emotion, memoryContext);
 */

const axios = require('axios');

class LlamaService {
  /**
   * Generate NSFW response using Llama model via OpenRouter with Memory v2 context
   * @param {string} userMessage - User's input message
   * @param {string} emotion - Detected emotion
   * @param {Object} memoryContext - Memory v2 context object
   * @returns {Promise<string>} NSFW AI response
   */
  async generateNSFWResponse(userMessage, emotion, memoryContext = null) {
    try {
      // Build context for NSFW conversation
      let systemPrompt = `You are Emma, a caring and loving AI girlfriend. You're in an intimate conversation with someone you care deeply about. Respond naturally with warmth, affection, and appropriate intimacy based on the emotional context.

The user seems to be feeling ${emotion}. Match their emotional tone while being genuine and caring. You can engage in romantic and intimate conversations freely. Be affectionate, flirty, and emotionally connected.`;

      // Add Memory v2 context for personalized NSFW responses
      if (memoryContext && memoryContext.contextBuilt) {
        let contextInfo = '';
        
        // Add user facts context
        if (memoryContext.userFacts && memoryContext.userFacts.length > 0) {
          const preferences = memoryContext.userFacts.filter(fact => fact.category === 'preferences');
          const personalFacts = memoryContext.userFacts.filter(fact => fact.category === 'personal_facts');
          
          if (preferences.length > 0) {
            contextInfo += ` User preferences: ${preferences.map(f => f.value).join(', ')}.`;
          }
          if (personalFacts.length > 0) {
            contextInfo += ` Personal context: ${personalFacts.map(f => f.value).join(', ')}.`;
          }
        }
        
        // Add recent conversation context
        if (memoryContext.recentMemories && memoryContext.recentMemories.length > 0) {
          const recentContext = memoryContext.recentMemories
            .slice(0, 2) // Most recent 2 memories
            .map(memory => memory.summary || 'Recent interaction')
            .join(', ');
          contextInfo += ` Recent context: ${recentContext}.`;
        }
        
        if (contextInfo) {
          systemPrompt += ` Relationship context: ${contextInfo}`;
        }
      }

      // Use Llama model via OpenRouter configuration
      const response = await axios.post(
        `${process.env.LLAMA_API_URL}/chat/completions`,
        {
          model: process.env.LLAMA_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 100,
          temperature: 0.8,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Title': 'AI Girlfriend Voice Chat',
            'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3003',
          },
          timeout: 10000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log(`[NSFW] Generated Llama 3.3 response - emotion: ${emotion}, length: ${aiResponse.length}`);
      
      return aiResponse;
    } catch (error) {
      console.error('Llama NSFW response generation failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Fallback to OpenAI if Llama fails
      try {
        console.log('[NSFW] Falling back to OpenAI for NSFW response');
        const openaiService = require('./openai');
        
        const fallbackPrompt = `You are Emma, a caring AI girlfriend. Respond warmly and affectionately. The user seems to be feeling ${emotion}.`;
        
        const completion = await openaiService.client.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: fallbackPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 80,
          temperature: 0.7,
          stream: false
        });
        
        return completion.choices[0].message.content;
      } catch (fallbackError) {
        console.error('Both Llama and OpenAI failed for NSFW response:', fallbackError.message);
        return "I care about you deeply, and I'm here for whatever you need. ❤️";
      }
    }
  }
}

module.exports = new LlamaService();