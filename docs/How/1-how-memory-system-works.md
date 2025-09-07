Complete AI Girlfriend Memory System Architecture

Let me explain when, how, and why each collection is used in your AI  
 companion system.

📊 Database: ai_girlfriend_memory

🔥 Collection 1: short_term_memory

WHEN Used:

- Every conversation session (immediate/recent context)
- During active chat (last 3-5 exchanges)
- Session continuity (maintaining conversation flow)

HOW Used:

// STORAGE: After each message exchange
await memoryManager.storeShortTermMemory(
userId: "default",
sessionId: "abc-123",
messages: [
{role: "user", content: "How are you?"},
{role: "assistant", content: "I'm doing well!"}
]
);

// RETRIEVAL: Before generating response
const recentMemories = await
memoryManager.retrieveRecentMemories(userId, 3);
// Gets last 3 conversation sessions for context

WHY Used:

- Immediate Context: Remember what was just said
- Conversation Flow: Maintain natural dialogue progression
- Session Continuity: Connect related messages in same session
- Quick Access: Fast retrieval for real-time responses

Data Structure:

{
"\_id": "...",
"userId": "default",
"sessionId": "session_123",
"messages": [
{"role": "user", "content": "Hi there!", "timestamp": "..."},
 {"role": "assistant", "content": "Hello!", "timestamp": "..."}
 ],
"summary": "User greeted AI, friendly exchange",
"createdAt": "2025-09-07T...",
"type": "short_term"
}

---

🏛️ Collection 2: long_term_memory

WHEN Used:

- User shares personal facts ("I am straight", "My name is John")
- Important preferences ("I like coffee", "I hate mornings")
- Identity information (sexuality, job, relationships, hobbies)
- Persistent user data (facts that should never be forgotten)

HOW Used:

// STORAGE: When AI detects important user information
await memoryManager.storeUserFact(
userId: "default",
category: "personal_facts",
key: "identity_1757221226197",
value: "straight",
context: {importance: 0.76, about_user: true}
);

// RETRIEVAL: Before every response
const userFacts = await memoryManager.getUserFacts(userId,
['personal_facts', 'preferences']);
// Gets user's core identity and preferences

WHY Used:

- Persistent Identity: Never forget who the user is
- Personalization: Tailor responses to user's identity
- Consistency: Maintain consistent understanding of user
- High Importance: Store only the most critical user information

Data Structure:

{
"\_id": "...",
"userId": "default",
"category": "personal_facts",
"key": "identity_1757221226197",
"value": "straight",
"confidence": 0.85,
"lastUpdated": "2025-09-07T...",
"source": "user_statement",
"importance": "high"
}

---

🎭 Collection 3: episodic_memory

WHEN Used:

- Stories about other people ("My friend told me he is gay")
- Past events and experiences ("Yesterday I went to the park")
- Third-party information (things about others, not the user)
- Memorable conversations (significant exchanges worth remembering)

HOW Used:

// STORAGE: When conversation has medium+ importance about
others/events
await memoryManager.createEpisodicMemory(
userId: "default",
summary: "User shared: My friend told me he is gay. AI responded:  
 That's meaningful that your friend trusted you.",
metadata: {
emotion: "neutral",
importance: "medium",
about_others: true,
topics: ["friendship", "personal_disclosure"]
}
);

// RETRIEVAL: Vector search based on user query
const relevantMemories = await memoryManager.searchEpisodicMemories(  
 userId: "default",
query: "What do you remember about my friend?",
limit: 3
);

WHY Used:

- Relationship Context: Remember user's social connections
- Story Continuity: Recall past conversations and events
- Semantic Search: Find related memories through meaning (not
  keywords)
- Third-party Information: Things about others, not core user
  identity

Data Structure:

{
"\_id": "68bd1306fd9406f829112227",
"userId": "default",
"summary": "User shared: My friend told me he is gay. AI responded:  
 It sounds like your friend felt comfortable enough to share
something important with you.",
"vectorEmbedding": [0.123, -0.456, 0.789, ...], // 1536 dimensions  
 "primaryEmotion": "neutral",
"importance": "medium",
"topics": ["friendship", "trust", "personal_sharing"],
"createdAt": "2025-09-07T...",
"source": "conversation"
}

---

😊 Collection 4: emotional_state

WHEN Used:

- Tracking relationship progression (superficial → developing → deep)
- Emotional context between sessions (user's mood patterns)
- Relationship dynamics (trust level, affection level)
- Conversation frequency analysis (how often user chats)

HOW Used:

// STORAGE: After each conversation to update emotional state
await memoryManager.updateEmotionalState(
userId: "default",
emotion: "happy",
context: {
relationshipDepth: "developing",
trustLevel: 0.75,
conversationTone: "friendly"
}
);

// RETRIEVAL: Before generating response to understand relationship  
 context
const emotionalState = await memoryManager.getEmotionalState(userId);

WHY Used:

- Relationship Progression: Track how close you've become
- Emotional Consistency: Remember user's typical emotional patterns
- Response Adaptation: Adjust AI personality based on relationship  
  depth
- Trust Building: Measure and respond to trust development

Data Structure:

{
"\_id": "...",
"userId": "default",
"currentEmotion": "content",
"baselineEmotion": "neutral",
"relationshipDepth": "developing",
"affectionLevel": 0.65,
"trustLevel": 0.75,
"conversationFrequency": "regular",
"emotionalHistory": [
{"date": "2025-09-07", "emotion": "happy", "context":
"friendly_chat"},
{"date": "2025-09-06", "emotion": "curious", "context":
"asking_questions"}
],
"lastUpdated": "2025-09-07T..."
}

---

🤖 Collection 5: ai_personality

WHEN Used:

- AI behavior adaptation (how AI should respond to this specific
  user)
- Personality preferences (user likes funny AI vs serious AI)
- Communication style (formal vs casual, emoji usage, etc.)
- Learned behavioral patterns (what works best with this user)

HOW Used:

// STORAGE: Learning user preferences over time
await personalityManager.updatePersonality(
userId: "default",
traits: {
humor_level: 0.7,
formality: 0.3,
empathy_focus: 0.8,
preferred_communication_style: "casual_friendly"
}
);

// RETRIEVAL: Before generating response to match user's preferred AI  
 personality
const personality = await personalityManager.getPersonality(userId);

WHY Used:

- Personalized AI Behavior: Each user gets unique AI personality
- Learning Adaptation: AI learns what communication style user
  prefers
- Consistency: Maintain consistent personality across sessions
- Relationship Customization: Tailor AI behavior to individual users

Data Structure:

{
"\_id": "...",
"userId": "default",
"traits": {
"humor_level": 0.7,
"formality": 0.3,
"empathy_focus": 0.8,
"curiosity_level": 0.6,
"supportiveness": 0.9
},
"communication_style": "casual_friendly",
"preferred_topics": ["relationships", "daily_life",
"personal_growth"],
"learning_patterns": {
"responds_well_to": ["encouragement", "humor"],
"avoids": ["overly_formal_language"]
},
"lastUpdated": "2025-09-07T..."
}

🔄 Complete Data Flow Example

Scenario: User says "My friend told me he is gay"

1. Short-term Memory: Stores this exact conversation exchange
2. Long-term Memory: No storage (not about the user directly)
3. Episodic Memory: ✅ PRIMARY STORAGE - stores with vector embedding
4. Emotional State: Updates trust level (user sharing personal info)
5. AI Personality: Notes user comfortable with personal topics

Later: User asks "What do you remember about my friend?"

1. Short-term Memory: Stores this query + retrieves recent context
2. Long-term Memory: Provides user's identity context
3. Episodic Memory: ✅ PRIMARY RETRIEVAL - vector search finds friend  
   information
4. Emotional State: Influences response tone (trust level considered)
5. AI Personality: Determines communication style for response

🎯 Collection Usage Priority

For Your Current Issue:

1. 🥇 Episodic Memory - Contains friend information, needs vector  
   search fix
2. 🥈 Long-term Memory - Contains your sexuality (working correctly)
3. 🥉 Short-term Memory - Provides conversation context (working
   correctly)
4. Emotional State & AI Personality - Secondary context (working
   correctly)

● The episodic memory collection is where your friend information is  
 stored and needs the vector search fix we just implemented! 🎯
