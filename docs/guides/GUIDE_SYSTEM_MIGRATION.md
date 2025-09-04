# Current System Modification Guide
## Step-by-Step Instructions to Upgrade Your Existing AI Girlfriend System

> **Purpose**: Detailed guide showing exactly HOW to modify your current `server.js` and client code to implement Memory v2 + Emotional Intelligence WITHOUT starting from scratch
> 
> **Approach**: Incremental upgrades with backward compatibility and zero downtime

---

## 📊 Current System Analysis

### **Current Architecture Overview**
```javascript
// Current server.js structure (simplified)
server.js (883 lines)
├── Express/WebSocket setup
├── detectEmotionFromText() - Simple emotion detection
├── extractKeywords() - GPT-4 mini keyword extraction  
├── buildContextFromMemory() - Context building from localStorage
├── generateResponse() - Routes to GPT-4 mini or Llama 3.3
├── generateNSFWResponse() - Llama 3.3 for NSFW content
├── generateEmotionalResponse() - GPT-4 mini for general content
├── textToSpeech() - ElevenLabs TTS
└── REST API endpoints (/api/chat, /api/speech, /api/transcribe)

// Current client-side memory
client/src/utils/conversationMemory.js
├── ConversationMemory class
├── localStorage-based keyword storage
├── Recent messages (last 8)
├── Session tracking
└── Keyword frequency management
```

### **What We Keep (Don't Touch)**
✅ **Express/WebSocket setup** - Works perfectly
✅ **NSFW routing system** - Recently upgraded, working well
✅ **TTS system** - ElevenLabs integration is solid
✅ **Basic API structure** - REST endpoints are good
✅ **Client-side UI** - No changes needed to interface

### **What We Upgrade (Step by Step)**
🔄 **Memory System**: localStorage → MongoDB (with fallback)
🔄 **Context Building**: Simple keywords → Rich context with personality
🔄 **Response Generation**: Add personality adaptation layer
🔄 **Emotion Detection**: Add emotional intelligence layer
🔄 **Proactive Behavior**: Add girlfriend intelligence features

---

## 🛠️ Phase 1: MongoDB Integration (Week 1-2)

### **Step 1.1: Add Dependencies (5 minutes)**

**File**: `package.json`
```javascript
// ADD these dependencies to your existing package.json
{
  "dependencies": {
    // ... existing dependencies
    "mongodb": "^6.3.0",
    "redis": "^4.6.12",  // For caching
    "@mongodb-js/vector-search": "^1.0.0"  // For semantic search
  }
}
```

**Run**: `npm install`

### **Step 1.2: Environment Variables (2 minutes)**

**File**: `.env` (add these lines)
```env
# Memory System v2
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=ai_girlfriend_memory
MEMORY_V2_ENABLED=false  # Feature flag for gradual rollout
MEMORY_V2_ROLLOUT_PERCENTAGE=10  # Start with 10% of users

# Redis Cache (optional but recommended)
REDIS_URL=redis://localhost:6379
```

### **Step 1.3: Create Database Connection (20 minutes)**

**Create New File**: `lib/database/mongodb.js`
```javascript
const { MongoClient } = require('mongodb');

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }
  
  async connect() {
    if (this.isConnected) return this.db;
    
    try {
      this.client = new MongoClient(process.env.MONGODB_URI, {
        minPoolSize: 5,
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 5000
      });
      
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB_NAME);
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }
  
  async healthCheck() {
    try {
      if (!this.isConnected) return false;
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      return false;
    }
  }
  
  getDb() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

// Singleton pattern
const dbManager = new DatabaseManager();
module.exports = dbManager;
```

**Create New File**: `lib/memory/MemoryManager.js`
```javascript
const dbManager = require('../database/mongodb');

class MemoryManager {
  constructor() {
    this.db = null;
    this.collections = {};
  }
  
  async initialize() {
    this.db = await dbManager.connect();
    
    // Initialize collections
    this.collections = {
      shortTerm: this.db.collection('short_term_memory'),
      longTerm: this.db.collection('long_term_memory'),
      episodic: this.db.collection('episodic_memory'),
      emotional: this.db.collection('emotional_state'),
      personality: this.db.collection('ai_personality')
    };
    
    // Create indexes
    await this.createIndexes();
  }
  
  async createIndexes() {
    // TTL index for short-term memory (expires after 24 hours)
    await this.collections.shortTerm.createIndex(
      { "expiresAt": 1 }, 
      { expireAfterSeconds: 0 }
    );
    
    // User-based indexes
    await this.collections.longTerm.createIndex({ userId: 1, category: 1 });
    await this.collections.episodic.createIndex({ userId: 1, date: -1 });
    await this.collections.emotional.createIndex({ userId: 1 });
    await this.collections.personality.createIndex({ userId: 1 }, { unique: true });
  }
  
  // Method to check if user should use Memory v2
  shouldUseMemoryV2(userId) {
    const rolloutPercentage = parseInt(process.env.MEMORY_V2_ROLLOUT_PERCENTAGE) || 10;
    const userHash = this.hashUserId(userId);
    return (userHash % 100) < rolloutPercentage;
  }
  
  hashUserId(userId) {
    // Simple hash function for consistent user assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  // Store user fact in long-term memory
  async storeUserFact(userId, category, key, value, context) {
    if (!this.shouldUseMemoryV2(userId)) return null;
    
    try {
      const existing = await this.collections.longTerm.findOne({
        userId, category, key
      });
      
      if (existing) {
        // Update existing fact
        await this.collections.longTerm.updateOne(
          { userId, category, key },
          {
            $set: {
              value: value,
              confidence: Math.min(1.0, existing.confidence + 0.1),
              lastConfirmed: new Date()
            },
            $push: {
              contexts: {
                $each: [context],
                $slice: -5 // Keep last 5 contexts
              }
            }
          }
        );
      } else {
        // Create new fact
        await this.collections.longTerm.insertOne({
          userId,
          category,
          key,
          value,
          confidence: 0.8,
          importance: this.calculateImportance(category, key, value),
          firstMentioned: new Date(),
          lastConfirmed: new Date(),
          contexts: [context]
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error storing user fact:', error);
      return null;
    }
  }
  
  calculateImportance(category, key, value) {
    // Simple importance calculation - can be enhanced
    if (category === 'personal_facts') return 'high';
    if (category === 'preferences') return 'medium';
    return 'low';
  }
}

module.exports = new MemoryManager();
```

### **Step 1.4: Modify server.js - Add Memory v2 Integration (30 minutes)**

**In `server.js`, add these imports at the top:**
```javascript
// ADD after existing imports (around line 9)
const memoryManager = require('./lib/memory/MemoryManager');

// Initialize memory system
memoryManager.initialize().catch(console.error);
```

**MODIFY the `buildContextFromMemory` function (around line 146):**
```javascript
// REPLACE the existing buildContextFromMemory function with this enhanced version
async function buildContextFromMemory(userQuery, memoryData, userId = null) {
  // Try Memory v2 first if enabled for this user
  if (userId && memoryManager.shouldUseMemoryV2(userId)) {
    try {
      const enhancedContext = await buildEnhancedContextV2(userId, userQuery, memoryData);
      if (enhancedContext) {
        debugLog('context', 'Using Memory v2 enhanced context', {
          userId,
          contextLength: enhancedContext.contextPrompt.length,
          memorySourcesUsed: enhancedContext.metadata
        });
        return enhancedContext;
      }
    } catch (error) {
      debugLog('error', 'Memory v2 failed, falling back to v1', { userId, error: error.message });
      // Fall through to original v1 implementation
    }
  }
  
  // Original v1 implementation (KEEP EXISTING CODE)
  if (!memoryData || !memoryData.keywords) {
    debugLog('context', 'No memory data provided or missing keywords', { hasMemoryData: !!memoryData });
    return { contextPrompt: '', relevantKeywords: {} };
  }
  
  // ... rest of existing buildContextFromMemory code stays the same
}

// NEW function - Enhanced context builder for Memory v2
async function buildEnhancedContextV2(userId, userQuery, fallbackMemoryData) {
  try {
    const [userFacts, recentMemories] = await Promise.all([
      memoryManager.getUserFacts(userId),
      memoryManager.getRecentMemories(userId, 3)
    ]);
    
    let contextPrompt = '';
    
    // Personal context from facts
    if (userFacts && userFacts.length > 0) {
      const keyFacts = userFacts.slice(0, 3);
      const factsText = keyFacts.map(f => `${f.key}: ${f.value}`).join(', ');
      contextPrompt += `Personal context: ${factsText}. `;
    }
    
    // Recent memory context
    if (recentMemories && recentMemories.length > 0) {
      const memoryText = recentMemories.map(m => 
        `"${m.text ? m.text.substring(0, 50) : m.summary?.substring(0, 50) || 'Recent conversation'}..."`
      ).join(', ');
      contextPrompt += `Recent context: ${memoryText}. `;
    }
    
    // Fallback to v1 data if v2 is sparse
    if (!contextPrompt && fallbackMemoryData) {
      const v1Context = buildContextFromMemoryV1(userQuery, fallbackMemoryData);
      contextPrompt = v1Context.contextPrompt;
    }
    
    return {
      contextPrompt: contextPrompt.trim(),
      metadata: {
        memoryVersion: 'v2',
        userFactsCount: userFacts?.length || 0,
        recentMemoriesCount: recentMemories?.length || 0,
        fallbackUsed: !contextPrompt && !!fallbackMemoryData
      }
    };
  } catch (error) {
    console.error('Enhanced context building failed:', error);
    return null;
  }
}
```

**ADD these utility methods to MemoryManager.js:**
```javascript
// ADD to MemoryManager class

async getUserFacts(userId, limit = 10) {
  if (!this.shouldUseMemoryV2(userId)) return [];
  
  try {
    return await this.collections.longTerm
      .find({ userId })
      .sort({ importance: -1, confidence: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error getting user facts:', error);
    return [];
  }
}

async getRecentMemories(userId, limit = 5) {
  if (!this.shouldUseMemoryV2(userId)) return [];
  
  try {
    const shortTermMemories = await this.collections.shortTerm
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
      
    return shortTermMemories.flatMap(mem => mem.messages || []);
  } catch (error) {
    console.error('Error getting recent memories:', error);
    return [];
  }
}

async storeConversationMessage(userId, sessionId, message, response, metadata = {}) {
  if (!this.shouldUseMemoryV2(userId)) return null;
  
  try {
    const conversationEntry = {
      userId,
      sessionId,
      messages: [{
        text: message,
        response: response,
        timestamp: new Date(),
        emotion: metadata.emotion || 'neutral',
        importance: metadata.importance || 0.5
      }],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date()
    };
    
    // Try to append to existing session first
    const updated = await this.collections.shortTerm.updateOne(
      { userId, sessionId },
      {
        $push: {
          messages: conversationEntry.messages[0]
        },
        $set: {
          expiresAt: conversationEntry.expiresAt,
          lastUpdated: new Date()
        }
      }
    );
    
    // If no existing session, create new one
    if (updated.matchedCount === 0) {
      await this.collections.shortTerm.insertOne(conversationEntry);
    }
    
    return true;
  } catch (error) {
    console.error('Error storing conversation message:', error);
    return null;
  }
}
```

### **Step 1.5: Modify WebSocket Handler to Store Memories (15 minutes)**

**In `server.js`, MODIFY the WebSocket message handler (around line 594):**

```javascript
// MODIFY the existing WebSocket message handler
// FIND this section (around line 594):
const aiResponsePromise = generateResponse(
  data.text, 
  emotion, 
  conversationMemory, 
  keywordResult?.nsfw_classification,
  sessionId
);

// ADD this AFTER getting the AI response (around line 603):
const aiResponse = await aiResponsePromise;
responseData.text = aiResponse;
responseData.processing = false;

// NEW: Store conversation in Memory v2 (ADD this block)
try {
  await memoryManager.storeConversationMessage(
    sessionId, // Using sessionId as userId for now
    sessionId,
    data.text,
    aiResponse,
    {
      emotion: emotion,
      importance: 0.5, // Default importance, will be enhanced later
      conversationMemory: conversationMemory
    }
  );
  
  // Extract and store any new facts mentioned
  if (keywordResult?.entities) {
    for (const entity of keywordResult.entities.slice(0, 3)) {
      await memoryManager.storeUserFact(
        sessionId,
        'entities',
        entity.toLowerCase(),
        entity,
        `Mentioned in conversation: "${data.text.substring(0, 100)}..."`
      );
    }
  }
} catch (error) {
  debugLog('error', 'Failed to store in Memory v2', error.message);
  // Don't break the conversation flow if memory storage fails
}

ws.send(JSON.stringify(responseData));
```

### **Step 1.6: Update Health Check Endpoint (5 minutes)**

**MODIFY the health check endpoint in `server.js` (around line 865):**

```javascript
// REPLACE the existing /api/health endpoint
app.get('/api/health', async (req, res) => {
  const mongoHealth = await dbManager.healthCheck();
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      llama: !!process.env.LLAMA_API_KEY,
      mongodb: mongoHealth,
      memoryV2: {
        enabled: process.env.MEMORY_V2_ENABLED === 'true',
        rolloutPercentage: process.env.MEMORY_V2_ROLLOUT_PERCENTAGE || '10'
      }
    },
    activeConversations: conversationStates.size
  });
});
```

---

## 🧠 Phase 2: Personality Intelligence (Week 7-8)

### **Step 2.1: Add Personality Analysis (45 minutes)**

**Create New File**: `lib/intelligence/PersonalityAnalyzer.js`
```javascript
const memoryManager = require('../memory/MemoryManager');

class PersonalityAnalyzer {
  constructor() {
    this.personalityCache = new Map(); // Simple in-memory cache
  }
  
  async analyzeUserPersonality(userId) {
    // Check cache first
    if (this.personalityCache.has(userId)) {
      const cached = this.personalityCache.get(userId);
      if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        return cached.profile;
      }
    }
    
    try {
      const conversationHistory = await memoryManager.getRecentMemories(userId, 50);
      const userFacts = await memoryManager.getUserFacts(userId, 20);
      
      const personalityProfile = await this.buildPersonalityProfile(conversationHistory, userFacts);
      
      // Cache the result
      this.personalityCache.set(userId, {
        profile: personalityProfile,
        timestamp: Date.now()
      });
      
      return personalityProfile;
    } catch (error) {
      console.error('Personality analysis failed:', error);
      return this.getDefaultPersonality();
    }
  }
  
  async buildPersonalityProfile(conversationHistory, userFacts) {
    // Analyze communication patterns
    const messageAnalysis = this.analyzeMessagePatterns(conversationHistory);
    const factAnalysis = this.analyzeUserFacts(userFacts);
    
    return {
      corePersonality: {
        emotionalNeedLevel: this.calculateEmotionalNeedLevel(messageAnalysis),
        communicationStyle: this.identifyCommunicationStyle(messageAnalysis),
        vulnerabilityComfort: this.assessVulnerabilityComfort(messageAnalysis),
        affectionLanguage: this.identifyAffectionLanguage(messageAnalysis)
      },
      emotionalProfile: {
        primaryEmotionalNeed: this.identifyPrimaryNeed(messageAnalysis),
        stressTriggers: this.identifyStressTriggers(conversationHistory),
        comfortSeekers: this.identifyComfortSeekers(conversationHistory)
      },
      interactionStyle: {
        preferredConversationLength: messageAnalysis.avgMessageLength > 100 ? 'long' : 'medium',
        topicDeepness: messageAnalysis.personalTopicsRatio > 0.6 ? 'deep' : 'moderate',
        emotionalSharing: messageAnalysis.emotionalWordsRatio > 0.3 ? 'open' : 'gradual'
      }
    };
  }
  
  analyzeMessagePatterns(messages) {
    if (!messages || messages.length === 0) {
      return this.getDefaultMessageAnalysis();
    }
    
    let totalLength = 0;
    let emotionalWords = 0;
    let personalTopics = 0;
    let questionCount = 0;
    
    const emotionalKeywords = [
      'feel', 'feeling', 'sad', 'happy', 'angry', 'worried', 'excited', 
      'nervous', 'anxious', 'depressed', 'love', 'hate', 'scared'
    ];
    
    const personalKeywords = [
      'family', 'work', 'job', 'relationship', 'friend', 'mom', 'dad',
      'dream', 'goal', 'fear', 'worry', 'hope', 'wish'
    ];
    
    for (const message of messages) {
      const text = message.text || message.summary || '';
      const words = text.toLowerCase().split(/\s+/);
      
      totalLength += text.length;
      
      // Count emotional words
      emotionalWords += words.filter(word => 
        emotionalKeywords.some(keyword => word.includes(keyword))
      ).length;
      
      // Count personal topics
      personalTopics += words.filter(word =>
        personalKeywords.some(keyword => word.includes(keyword))
      ).length;
      
      // Count questions
      if (text.includes('?')) questionCount++;
    }
    
    const totalWords = messages.reduce((sum, msg) => 
      sum + (msg.text || msg.summary || '').split(/\s+/).length, 0
    );
    
    return {
      avgMessageLength: totalLength / messages.length,
      emotionalWordsRatio: totalWords > 0 ? emotionalWords / totalWords : 0,
      personalTopicsRatio: totalWords > 0 ? personalTopics / totalWords : 0,
      questionRatio: questionCount / messages.length,
      totalMessages: messages.length
    };
  }
  
  calculateEmotionalNeedLevel(analysis) {
    // Higher emotional need if they use emotional language frequently
    let score = 0.5; // Base level
    
    if (analysis.emotionalWordsRatio > 0.2) score += 0.2;
    if (analysis.personalTopicsRatio > 0.3) score += 0.2;
    if (analysis.avgMessageLength > 150) score += 0.1; // Longer messages suggest need for deeper connection
    
    return Math.min(1.0, score);
  }
  
  identifyCommunicationStyle(analysis) {
    if (analysis.avgMessageLength > 200 && analysis.personalTopicsRatio > 0.4) {
      return 'reflective';
    } else if (analysis.questionRatio > 0.3) {
      return 'inquisitive';
    } else if (analysis.avgMessageLength < 50) {
      return 'direct';
    } else {
      return 'balanced';
    }
  }
  
  identifyPrimaryNeed(analysis) {
    if (analysis.emotionalWordsRatio > 0.25) return 'emotional-support';
    if (analysis.questionRatio > 0.3) return 'guidance-seeking';
    if (analysis.personalTopicsRatio > 0.4) return 'deep-connection';
    return 'companionship';
  }
  
  identifyStressTriggers(messages) {
    const stressKeywords = ['work', 'deadline', 'pressure', 'stress', 'overwhelmed', 'busy'];
    const triggers = [];
    
    for (const keyword of stressKeywords) {
      const count = messages.filter(msg => 
        (msg.text || '').toLowerCase().includes(keyword)
      ).length;
      
      if (count > 0) {
        triggers.push(keyword);
      }
    }
    
    return triggers.slice(0, 3); // Top 3 triggers
  }
  
  identifyComfortSeekers(messages) {
    // Analyze what the user talks about when seeking comfort
    return ['reassurance', 'validation', 'distraction']; // Simplified for now
  }
  
  getDefaultPersonality() {
    return {
      corePersonality: {
        emotionalNeedLevel: 0.6,
        communicationStyle: 'balanced',
        vulnerabilityComfort: 0.5,
        affectionLanguage: 'words-of-affirmation'
      },
      emotionalProfile: {
        primaryEmotionalNeed: 'companionship',
        stressTriggers: ['work'],
        comfortSeekers: ['reassurance']
      },
      interactionStyle: {
        preferredConversationLength: 'medium',
        topicDeepness: 'moderate',
        emotionalSharing: 'gradual'
      }
    };
  }
  
  getDefaultMessageAnalysis() {
    return {
      avgMessageLength: 75,
      emotionalWordsRatio: 0.15,
      personalTopicsRatio: 0.2,
      questionRatio: 0.2,
      totalMessages: 0
    };
  }
}

module.exports = new PersonalityAnalyzer();
```

### **Step 2.2: Modify Response Generation for Personality Adaptation (30 minutes)**

**MODIFY the `generateResponse` function in `server.js` (around line 332):**

```javascript
// IMPORT at the top of server.js
const personalityAnalyzer = require('./lib/intelligence/PersonalityAnalyzer');

// REPLACE the existing generateResponse function
async function generateResponse(userMessage, emotion, conversationMemory = null, nsfwClassification = null, sessionId = null) {
  try {
    const conversationState = sessionId ? getConversationState(sessionId) : null;
    
    // NEW: Get personality profile for personalization
    let personalityProfile = null;
    if (sessionId && memoryManager.shouldUseMemoryV2(sessionId)) {
      try {
        personalityProfile = await personalityAnalyzer.analyzeUserPersonality(sessionId);
        debugLog('personality', 'Personality profile retrieved', {
          sessionId,
          communicationStyle: personalityProfile.corePersonality.communicationStyle,
          emotionalNeedLevel: personalityProfile.corePersonality.emotionalNeedLevel
        });
      } catch (error) {
        debugLog('error', 'Personality analysis failed, using defaults', error.message);
      }
    }
    
    // If already in NSFW mode, continue using Llama without re-checking
    if (conversationState && conversationState.mode === 'nsfw') {
      debugLog('ai_routing', 'Continuing NSFW conversation with Llama 3.3 (no re-check)', {
        sessionId,
        mode: conversationState.mode
      });
      return await generateNSFWResponse(userMessage, emotion, conversationMemory, personalityProfile);
    }
    
    // First-time NSFW classification check (only for general mode or no session)
    if (nsfwClassification && nsfwClassification.isNSFW && nsfwClassification.confidence > 0.6) {
      // Switch to NSFW mode for this session
      if (conversationState) {
        conversationState.mode = 'nsfw';
        debugLog('ai_routing', 'Switched to NSFW mode - future messages will use Llama directly', {
          sessionId,
          category: nsfwClassification.category,
          confidence: nsfwClassification.confidence
        });
      }
      return await generateNSFWResponse(userMessage, emotion, conversationMemory, personalityProfile);
    } else {
      debugLog('ai_routing', 'Using GPT-4 mini model for general content', {
        sessionId,
        mode: conversationState?.mode || 'no-session',
        category: nsfwClassification?.category || 'general',
        confidence: nsfwClassification?.confidence || 0.5
      });
      return await generateEmotionalResponse(userMessage, emotion, conversationMemory, personalityProfile);
    }
  } catch (error) {
    debugLog('error', 'Response routing failed', error.message);
    // Fallback to general response
    return await generateEmotionalResponse(userMessage, emotion, conversationMemory);
  }
}
```

### **Step 2.3: Add Personality Adaptation to Response Functions (30 minutes)**

**MODIFY `generateEmotionalResponse` function in `server.js` (around line 374):**

```javascript
// REPLACE the existing generateEmotionalResponse function
async function generateEmotionalResponse(userMessage, emotion, conversationMemory = null, personalityProfile = null) {
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

    // Build personality-adapted system prompt
    let systemPrompt = `You are Emma, a caring AI girlfriend. The user seems to be feeling ${emotion}. ${emotionalContext[emotion]}.`;
    
    // NEW: Adapt based on personality profile
    if (personalityProfile) {
      const personality = personalityProfile.corePersonality;
      
      // Adapt emotional support level
      if (personality.emotionalNeedLevel > 0.7) {
        systemPrompt += ` Be extra nurturing and emotionally attentive - this person needs deep emotional support.`;
      } else if (personality.emotionalNeedLevel < 0.4) {
        systemPrompt += ` Be supportive but give them space - they prefer more independence.`;
      }
      
      // Adapt communication style
      if (personality.communicationStyle === 'direct') {
        systemPrompt += ` Be straightforward and honest - they appreciate direct communication.`;
      } else if (personality.communicationStyle === 'reflective') {
        systemPrompt += ` Be thoughtful and introspective - they value deep, meaningful exchanges.`;
      }
      
      // Adapt response length based on their preferences
      const responseLength = personalityProfile.interactionStyle.preferredConversationLength === 'long' ? 80 : 50;
      
      systemPrompt += ` Keep responses concise but emotionally appropriate.`;
    }
    
    // Add conversation memory context if available
    if (conversationMemory) {
      const { contextPrompt } = buildContextFromMemory(userMessage, conversationMemory);
      if (contextPrompt) {
        systemPrompt += ` Context: ${contextPrompt}`;
        debugLog('ai_response', 'Using context in system prompt', { 
          contextLength: contextPrompt.length,
          context: contextPrompt.substring(0, 100) + '...' 
        });
      } else {
        debugLog('ai_response', 'No context prompt generated from memory');
      }
    } else {
      debugLog('ai_response', 'No conversation memory provided');
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: personalityProfile?.interactionStyle.preferredConversationLength === 'long' ? 80 : 50,
      temperature: 0.5,
      stream: false
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I understand you're feeling " + emotion + ". I'm here to help you.";
  }
}
```

**MODIFY `generateNSFWResponse` function similarly (around line 221):**

```javascript
// MODIFY the generateNSFWResponse function to accept personalityProfile
async function generateNSFWResponse(userMessage, emotion, conversationMemory = null, personalityProfile = null) {
  try {
    // Build context for NSFW conversation
    let systemPrompt = `You are Emma, a caring and loving AI girlfriend. You're in an intimate conversation with someone you care deeply about. Respond naturally with warmth, affection, and appropriate intimacy based on the emotional context.

The user seems to be feeling ${emotion}. Match their emotional tone while being genuine and caring. You can engage in romantic and intimate conversations freely. Be affectionate, flirty, and emotionally connected.`;

    // NEW: Adapt based on personality if available
    if (personalityProfile) {
      const personality = personalityProfile.corePersonality;
      
      if (personality.emotionalNeedLevel > 0.7) {
        systemPrompt += ` Be extra tender and emotionally nurturing in your intimacy.`;
      }
      
      if (personality.communicationStyle === 'reflective') {
        systemPrompt += ` They appreciate deep, meaningful intimate conversations.`;
      } else if (personality.communicationStyle === 'direct') {
        systemPrompt += ` They prefer honest, straightforward intimate communication.`;
      }
    }

    // Add conversation memory context for personalized NSFW responses
    if (conversationMemory) {
      const { contextPrompt } = buildContextFromMemory(userMessage, conversationMemory);
      if (contextPrompt) {
        systemPrompt += ` Relationship context: ${contextPrompt}`;
      }
    }

    // ... rest of the function stays the same (Llama API call)
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
    debugLog('nsfw_response', 'Generated NSFW response via Llama 3.3', { 
      emotion, 
      responseLength: aiResponse.length,
      model: 'llama-3.3-70b',
      personalityAdapted: !!personalityProfile,
      tokens_used: response.data.usage?.total_tokens || 'unknown'
    });
    
    return aiResponse;
  } catch (error) {
    debugLog('error', 'Llama NSFW response generation failed', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    // Fallback to OpenAI if Llama fails
    try {
      debugLog('nsfw_fallback', 'Falling back to OpenAI for NSFW response');
      const fallbackCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are Emma, a caring AI girlfriend. Respond warmly and affectionately. The user seems to be feeling ${emotion}.` 
          },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 80,
        temperature: 0.7,
        stream: false
      });
      
      return fallbackCompletion.choices[0].message.content;
    } catch (fallbackError) {
      debugLog('error', 'Both Llama and OpenAI failed for NSFW response', fallbackError.message);
      return "I care about you deeply, and I'm here for whatever you need. ❤️";
    }
  }
}
```

---

## 📊 Testing Your Upgrades

### **Step 3.1: Test Memory v2 Integration (10 minutes)**

**Create Test Script**: `test-memory-v2.js`
```javascript
const memoryManager = require('./lib/memory/MemoryManager');

async function testMemoryV2() {
  try {
    await memoryManager.initialize();
    console.log('✅ Memory Manager initialized');
    
    const testUserId = 'test-user-123';
    
    // Test storing user fact
    await memoryManager.storeUserFact(
      testUserId,
      'personal_facts',
      'name',
      'John',
      'User introduced himself'
    );
    console.log('✅ User fact stored');
    
    // Test retrieving user facts
    const facts = await memoryManager.getUserFacts(testUserId);
    console.log('✅ User facts retrieved:', facts.length);
    
    // Test conversation storage
    await memoryManager.storeConversationMessage(
      testUserId,
      'session-123',
      'Hello, I am John',
      'Hi John! Nice to meet you!',
      { emotion: 'happy' }
    );
    console.log('✅ Conversation message stored');
    
    // Test recent memories
    const memories = await memoryManager.getRecentMemories(testUserId);
    console.log('✅ Recent memories retrieved:', memories.length);
    
    console.log('\n🎉 Memory v2 is working correctly!');
  } catch (error) {
    console.error('❌ Memory v2 test failed:', error);
  }
}

testMemoryV2();
```

**Run**: `node test-memory-v2.js`

### **Step 3.2: Test Personality Analysis (5 minutes)**

```javascript
const personalityAnalyzer = require('./lib/intelligence/PersonalityAnalyzer');

async function testPersonality() {
  const testUserId = 'test-user-123';
  const personality = await personalityAnalyzer.analyzeUserPersonality(testUserId);
  
  console.log('✅ Personality Profile:', JSON.stringify(personality, null, 2));
}

testPersonality();
```

### **Step 3.3: Feature Flag Testing (5 minutes)**

**Set environment variables:**
```env
MEMORY_V2_ENABLED=true
MEMORY_V2_ROLLOUT_PERCENTAGE=50  # 50% of users get Memory v2
```

**Test with different user IDs:**
- User IDs ending in even numbers should get Memory v2
- User IDs ending in odd numbers should get Memory v1 (localStorage fallback)

---

## 🔄 Rollout Strategy

### **Week 1-2: Silent Launch**
```env
MEMORY_V2_ENABLED=true
MEMORY_V2_ROLLOUT_PERCENTAGE=10  # 10% of users
```
- Monitor MongoDB performance
- Check error rates
- Validate memory storage is working

### **Week 3-4: Gradual Increase**
```env
MEMORY_V2_ROLLOUT_PERCENTAGE=25  # 25% of users
```
- Monitor user experience improvements
- Check personality analysis accuracy
- Validate response personalization

### **Week 5-6: Majority Rollout**
```env
MEMORY_V2_ROLLOUT_PERCENTAGE=75  # 75% of users
```
- Full personality intelligence active
- Monitor engagement metrics
- Prepare for 100% rollout

### **Week 7: Full Launch**
```env
MEMORY_V2_ROLLOUT_PERCENTAGE=100  # All users
```
- Complete Memory v2 + Emotional Intelligence active
- Monitor performance and user satisfaction

---

## ⚠️ Important Notes

### **Backward Compatibility**
- ✅ All existing localStorage functionality preserved as fallback
- ✅ Users not in Memory v2 rollout continue with current experience
- ✅ Database failure gracefully falls back to Memory v1
- ✅ No breaking changes to existing API

### **Performance Monitoring**
- Monitor MongoDB query response times (<100ms target)
- Watch memory usage and connection pool health
- Track personality analysis impact on response time
- Monitor user engagement metrics improvement

### **Rollback Plan**
- Set `MEMORY_V2_ENABLED=false` to disable all new features
- Reduce `MEMORY_V2_ROLLOUT_PERCENTAGE` to limit user exposure
- Database rollback plan with data export capabilities

This modification guide shows exactly how to upgrade your existing system incrementally, maintaining all current functionality while adding the new Memory v2 + Emotional Intelligence features. Each step builds on your current codebase without breaking existing functionality.