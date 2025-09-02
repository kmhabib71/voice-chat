Memory v2 Implementation Strategy

Functions to UPDATE:

1. conversationMemory.js:


    - UPDATE processMessage() → Add importance scoring,

emotional state tracking - UPDATE buildContextForAI() → Enhanced multi-layer  
 context building - CREATE EmotionalStateManager class - CREATE EpisodicMemoryManager class - CREATE MongoDBConnector class 2. server.js: - UPDATE buildContextFromMemory() → Handle new
memory structure - UPDATE generateEmotionalResponse() → Use enhanced  
 context - CREATE VectorSearchManager for semantic retrieval  
 - CREATE SessionSummarizer for episodic memories  
 3. App.js: - UPDATE Memory initialization to use MongoDB - CREATE Emotional state UI indicators - CREATE Relationship depth visual feedback

Functions to DELETE:

- Current localStorage-only memory functions (keep as  
  fallback initially)

New Dependencies:

npm install mongodb @mongodb-js/vector-search
openai-embeddings

🐛 Emotion Detection Bug Fix

You're absolutely right! I found the bug:

In server.js lines 106, 116:
emotions: [emotion], // ← 'emotion' variable is
undefined here!

Should be:
const detectedEmotion = detectEmotionFromText(text);  
 return {
emotions: [detectedEmotion],
// ...
};

Quick Fix Strategy:

1. Fix emotion detection in extractKeywords() function
2. Ensure emotion flows properly through the entire  
   chain
3. Test with various emotional inputs

🤖 Dual AI Model System Design

Implementation Architecture:

// server.js - New Content Classification System
async function classifyContent(userMessage,
conversationMemory) {
// Use GPT-4 mini to classify content intent
const classification = await
openai.chat.completions.create({
model: 'gpt-4o-mini',
messages: [
{
role: 'system',
content: 'Classify if this message contains
 NSFW intent. Return JSON: {"isNSFW": boolean,
"category": "romantic|sexual|general"}'
},
{ role: 'user', content: userMessage }
],
max_tokens: 50
});

    return

JSON.parse(classification.choices[0].message.content);  
 }

async function generateResponse(userMessage, emotion,  
 conversationMemory) {
const contentClassification = await
classifyContent(userMessage, conversationMemory);

    if (contentClassification.isNSFW) {
      // Use Llama 3.3 for NSFW content
      return await generateNSFWResponse(userMessage,

emotion, conversationMemory);
} else {
// Use GPT-4 mini for general content
return await
generateEmotionalResponse(userMessage, emotion,
conversationMemory);
}
}

async function generateNSFWResponse(userMessage,
emotion, conversationMemory) {
// Call meta-llama/llama-3.3-70b-instruct:free via  
 OpenRouter or similar
const response = await axios.post('https://openroute  
 r.ai/api/v1/chat/completions', {
model: 'meta-llama/llama-3.3-70b-instruct:free',  
 messages: [
{ role: 'system', content: 'You are a caring AI
 girlfriend. Respond appropriately to intimate
conversations.' },
{ role: 'user', content: userMessage }
]
});

    return response.data.choices[0].message.content;

}

📋 Implementation Order Strategy

● I recommend this order:

1. IMMEDIATE (This week):

- Fix emotion detection bug (critical - affects
  current functionality)
- Implement dual AI model system (adds NSFW
  capability)

2. PHASE 1 Memory v2 (Next 1-2 weeks):

- MongoDB setup + emotional state machine
- The dual AI system will benefit from enhanced memory  
  immediately

3. PHASE 2-3 Memory v2 (Following weeks):

- Advanced features building on the foundation

🎯 Why This Order:

1. Bug fix first - Current emotion detection is broken
2. Dual AI models next - Adds key AI girlfriend
   functionality (NSFW handling)
3. Memory v2 after - Enhanced memory will make both AI  
   models more effective

The dual AI system will actually benefit from better  
 memory because:

- Better context for NSFW classification
- More personalized intimate responses
- Relationship depth affects appropriate response
  levels
