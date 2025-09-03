/**
 * @fileoverview Shared utility functions and helpers
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * 
 * @example
 * const { debugLog, detectEmotionFromText } = require('./helpers');
 */

/**
 * Debug logging helper with timestamp and category
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
const debugLog = (category, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category.toUpperCase()}] ${message}`, data || '');
};

/**
 * Simple emotion detection from text
 * @param {string} text - Text to analyze for emotions
 * @returns {string} Detected emotion
 */
function detectEmotionFromText(text) {
  const emotions = {
    joy: ['happy', 'excited', 'wonderful', 'amazing', 'great', 'fantastic', 'awesome', 'brilliant'],
    sadness: ['sad', 'depressed', 'unhappy', 'down', 'miserable', 'upset', 'crying'],
    anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'hate'],
    fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified', 'panic'],
    surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'wow', 'incredible'],
    love: ['love', 'adore', 'cherish', 'romantic', 'affection', 'heart', 'caring'],
    neutral: ['okay', 'fine', 'normal', 'regular', 'standard', 'average']
  };

  const textLower = text.toLowerCase();
  let detectedEmotion = 'neutral';
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotions)) {
    const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
    }
  }

  return detectedEmotion;
}

/**
 * Validate required environment variables
 * @param {Array<string>} requiredVars - Array of required environment variable names
 * @throws {Error} If any required variables are missing
 */
function validateEnvironmentVariables(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Sanitize text for logging (remove sensitive information)
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeForLog(text) {
  if (!text) return text;
  
  return text
    .replace(/Bearer\s+[\w.-]+/gi, 'Bearer ***')
    .replace(/api[_-]?key["\s]*[:=]["\s]*[\w.-]+/gi, 'api_key: ***')
    .replace(/password["\s]*[:=]["\s]*[\w.-]+/gi, 'password: ***')
    .replace(/token["\s]*[:=]["\s]*[\w.-]+/gi, 'token: ***');
}

/**
 * Create a delay/sleep function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, i);
        debugLog('retry', `Attempt ${i + 1} failed, retrying in ${delayTime}ms`, { error: error.message });
        await delay(delayTime);
      }
    }
  }
  
  throw lastError;
}

/**
 * Generate a random session ID
 * @returns {string} Random session identifier
 */
function generateSessionId() {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
}

module.exports = {
  debugLog,
  detectEmotionFromText,
  validateEnvironmentVariables,
  sanitizeForLog,
  delay,
  retryWithBackoff,
  generateSessionId
};