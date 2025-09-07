/**
 * @fileoverview Voice processing and transcription handling with Memory v2 integration
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * @updated 2025-09-05 - Integrated Memory v2 system
 * 
 * @example
 * const voiceController = require('./VoiceController');
 * const result = await voiceController.processAudioMessage(audioBuffer, mimetype, userId);
 */

class VoiceController {
  /**
   * Process voice message with transcription and emotion detection
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {string} mimetype - Audio MIME type
   * @param {string} userId - User identifier for memory system
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Processed voice message result
   */
  async processAudioMessage(audioBuffer, mimetype, userId = 'default', sessionId = null) {
    try {
      // Transcribe audio using OpenAI Whisper
      const openaiService = require('../../api/openai');
      const transcribedText = await openaiService.transcribeAudio(audioBuffer, mimetype);
      
      console.log(`[VOICE] Transcription completed: ${transcribedText}`);

      // Detect emotion from transcribed text
      const chatController = require('../chat/ChatController');
      const emotion = chatController.detectEmotionFromText(transcribedText);
      
      console.log(`[VOICE] Emotion detected: ${emotion}`);

      return {
        text: transcribedText,
        emotion: emotion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Voice processing error:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Could not process voice message: ${error.message}`);
    }
  }

  /**
   * Generate speech from text response
   * @param {string} text - Text to convert to speech
   * @param {string} emotion - Emotion for voice modulation
   * @returns {Promise<Buffer>} Audio buffer
   */
  async generateSpeech(text, emotion = 'neutral') {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text is required for speech generation');
      }

      const elevenLabsService = require('../../api/elevenlabs');
      const audioBuffer = await elevenLabsService.textToSpeech(text, emotion);
      
      console.log(`[VOICE] Speech generated - emotion: ${emotion}, size: ${audioBuffer.length}`);
      
      return audioBuffer;
    } catch (error) {
      console.error('Speech generation error:', error);
      throw new Error('Could not generate speech');
    }
  }

  /**
   * Process complete voice interaction (transcribe + respond + generate speech) with Memory v2
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {string} mimetype - Audio MIME type
   * @param {string} userId - User identifier for memory system
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Complete voice interaction result
   */
  async processVoiceInteraction(audioBuffer, mimetype, userId = 'default', sessionId = null) {
    try {
      // Step 1: Transcribe audio
      const transcriptionResult = await this.processAudioMessage(audioBuffer, mimetype, userId, sessionId);
      
      // Step 2: Generate AI text response using Memory v2
      const chatController = require('../chat/ChatController');
      const chatResponse = await chatController.processMessage(
        transcriptionResult.text, 
        sessionId, 
        userId
      );
      
      // Step 3: Generate speech audio
      const speechBuffer = await this.generateSpeech(chatResponse.response, chatResponse.emotion);
      
      return {
        transcription: transcriptionResult,
        chatResponse: chatResponse,
        audioResponse: {
          buffer: speechBuffer,
          emotion: chatResponse.emotion,
          size: speechBuffer.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Voice interaction error:', error);
      throw new Error(`Voice interaction failed: ${error.message}`);
    }
  }
}

module.exports = new VoiceController();