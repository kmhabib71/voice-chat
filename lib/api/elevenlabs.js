/**
 * @fileoverview ElevenLabs Text-to-Speech API integration
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * 
 * @example
 * const ttsService = require('./elevenlabs');
 * const audioBuffer = await ttsService.textToSpeech(text, emotion);
 */

const axios = require('axios');

class ElevenLabsService {
  constructor() {
    // Rate limiting for ElevenLabs API
    this.lastAudioRequest = 0;
    this.AUDIO_REQUEST_DELAY = 500; // 500ms for faster generation
  }

  /**
   * Convert text to speech using ElevenLabs
   * @param {string} text - Text to convert to speech
   * @param {string} emotion - Emotion for voice modulation
   * @returns {Promise<Buffer>} Audio buffer
   */
  async textToSpeech(text, emotion = 'neutral') {
    try {
      // Rate limiting to prevent API abuse detection
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastAudioRequest;
      if (timeSinceLastRequest < this.AUDIO_REQUEST_DELAY) {
        const waitTime = this.AUDIO_REQUEST_DELAY - timeSinceLastRequest;
        console.log(`[AUDIO] Rate limiting: waiting ${waitTime}ms before request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.lastAudioRequest = Date.now();
      
      // Validate inputs
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text provided for TTS');
      }
      
      // Clean text for TTS - remove markdown and extend length limit
      let cleanedText = text
        .replace(/\*\*/g, '') // Remove bold markdown
        .replace(/\*/g, '') // Remove asterisks  
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
        .replace(/`([^`]+)`/g, '$1') // Remove code backticks
        .trim();
      
      // Allow longer text for better complete message coverage
      const maxLength = 800;
      const processedText = cleanedText.length > maxLength ? cleanedText.substring(0, maxLength) + '...' : cleanedText;
      
      console.log(`[AUDIO] ElevenLabs TTS request - emotion: ${emotion}, length: ${processedText.length}`);

      // Adjust voice settings based on emotion
      const voiceSettings = {
        joy: { stability: 0.8, similarity_boost: 0.8, style: 0.7 },
        sadness: { stability: 0.9, similarity_boost: 0.7, style: 0.3 },
        anger: { stability: 0.7, similarity_boost: 0.8, style: 0.8 },
        fear: { stability: 0.9, similarity_boost: 0.6, style: 0.4 },
        surprise: { stability: 0.6, similarity_boost: 0.8, style: 0.8 },
        love: { stability: 0.8, similarity_boost: 0.9, style: 0.6 },
        neutral: { stability: 0.7, similarity_boost: 0.7, style: 0.5 }
      };

      const settings = voiceSettings[emotion] || voiceSettings.neutral;

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
        {
          text: processedText,
          model_id: 'eleven_turbo_v2', // Fastest model for speed
          voice_settings: {
            stability: 0.5, // Lower values for faster generation
            similarity_boost: 0.5,
            style: 0.0, // Remove style for speed
            use_speaker_boost: false // Disable for speed
          },
          optimize_streaming_latency: 4, // Maximum optimization
          output_format: 'mp3_22050_32' // Lower quality for speed
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          responseType: 'arraybuffer',
          timeout: 5000 // 5 seconds timeout
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error in text-to-speech:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  }
}

module.exports = new ElevenLabsService();