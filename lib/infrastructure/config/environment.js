/**
 * @fileoverview Environment configuration and validation
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * 
 * @example
 * const config = require('./environment');
 * console.log(config.openai.apiKey);
 */

require('dotenv').config();
const { validateEnvironmentVariables } = require('../../utils/helpers');

// Required environment variables
const REQUIRED_VARS = [
  'OPENAI_API_KEY',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID'
];

// Optional environment variables with defaults
const DEFAULT_CONFIG = {
  PORT: 3002,
  CORS_ORIGIN: 'http://localhost:3003',
  OPENAI_MODEL: 'gpt-4o-mini',
  NODE_ENV: 'development'
};

// Validate required environment variables on startup
try {
  validateEnvironmentVariables(REQUIRED_VARS);
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

// Configuration object
const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || DEFAULT_CONFIG.PORT,
    corsOrigin: process.env.CORS_ORIGIN || DEFAULT_CONFIG.CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV || DEFAULT_CONFIG.NODE_ENV,
    isDevelopment: (process.env.NODE_ENV || DEFAULT_CONFIG.NODE_ENV) === 'development',
    isProduction: (process.env.NODE_ENV || DEFAULT_CONFIG.NODE_ENV) === 'production'
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || DEFAULT_CONFIG.OPENAI_MODEL
  },

  // ElevenLabs configuration
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID
  },

  // Llama/OpenRouter configuration (optional for NSFW)
  llama: {
    apiUrl: process.env.LLAMA_API_URL,
    apiKey: process.env.LLAMA_API_KEY,
    model: process.env.LLAMA_MODEL
  },

  // Site configuration
  site: {
    url: process.env.SITE_URL || 'http://localhost:3003'
  },

  // MongoDB configuration (for future Memory v2)
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'ai_girlfriend_memory'
  },

  // Feature flags
  features: {
    memoryV2Enabled: process.env.MEMORY_V2_ENABLED === 'true',
    memoryV2RolloutPercent: parseInt(process.env.MEMORY_V2_ROLLOUT) || 10,
    emotionalIntelligenceEnabled: process.env.EMOTIONAL_INTELLIGENCE_ENABLED === 'true'
  }
};

// Log configuration status (without sensitive data)
console.log('[CONFIG] Environment configuration loaded:', {
  nodeEnv: config.server.nodeEnv,
  port: config.server.port,
  corsOrigin: config.server.corsOrigin,
  openaiModel: config.openai.model,
  hasOpenaiKey: !!config.openai.apiKey,
  hasElevenLabsKey: !!config.elevenlabs.apiKey,
  hasLlamaConfig: !!(config.llama.apiUrl && config.llama.apiKey),
  memoryV2Enabled: config.features.memoryV2Enabled,
  emotionalIntelligenceEnabled: config.features.emotionalIntelligenceEnabled
});

module.exports = config;