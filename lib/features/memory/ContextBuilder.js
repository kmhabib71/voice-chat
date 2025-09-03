/**
 * @fileoverview Build efficient context for AI from conversation memory
 * @author AI Girlfriend Project
 * @created 2024-01-15
 * 
 * @example
 * const { buildContextFromMemory } = require('./ContextBuilder');
 * const context = buildContextFromMemory(userQuery, memoryData);
 */

/**
 * Build efficient context for AI from conversation memory
 * @param {string} userQuery - Current user query
 * @param {Object} memoryData - Memory data object
 * @returns {Object} Context prompt and relevant keywords
 */
function buildContextFromMemory(userQuery, memoryData) {
  if (!memoryData || !memoryData.keywords) {
    console.log('[CONTEXT] No memory data provided or missing keywords');
    return { contextPrompt: '', relevantKeywords: {} };
  }

  console.log('[CONTEXT] Processing memory data:', {
    hasKeywords: !!memoryData.keywords,
    hasSession: !!memoryData.session,
    hasRecentMessages: !!memoryData.recentMessages,
    keywordCategories: Object.keys(memoryData.keywords),
    messageCount: memoryData.session?.messageCount
  });

  const { keywords, recentMessages, recentContext, session } = memoryData;
  // Support both recentMessages (client format) and recentContext (legacy)
  const recentData = recentMessages || recentContext || [];
  
  // Get top keywords by frequency (limited for token efficiency)
  const topEntities = Object.entries(keywords.entities || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([key]) => key);
    
  const topTopics = Object.entries(keywords.topics || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([key]) => key);
    
  const dominantIntents = Object.entries(keywords.intents || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 2)
    .map(([key]) => key);

  // Build compact context prompt
  let contextPrompt = '';
  
  if (topTopics.length > 0) {
    contextPrompt += `User often discusses: ${topTopics.join(', ')}. `;
  }
  
  if (topEntities.length > 0) {
    contextPrompt += `Key entities: ${topEntities.join(', ')}. `;
  }
  
  if (session && session.conversationTone) {
    contextPrompt += `Conversation tone: ${session.conversationTone}. `;
  }
  
  if (recentData && recentData.length > 0) {
    const recentMessageTexts = recentData.slice(-3).map(msg => 
      `"${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}"`
    ).join(', ');
    contextPrompt += `Recent context: ${recentMessageTexts}. `;
  }
  
  console.log('[CONTEXT] Built context from memory:', {
    promptLength: contextPrompt.length,
    topicsUsed: topTopics,
    entitiesUsed: topEntities,
    conversationTone: session?.conversationTone
  });
  
  return {
    contextPrompt: contextPrompt.trim(),
    relevantKeywords: {
      entities: topEntities,
      topics: topTopics,
      intents: dominantIntents
    }
  };
}

module.exports = {
  buildContextFromMemory
};