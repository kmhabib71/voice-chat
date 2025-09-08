[2025-09-08T11:55:25.909Z] [SOCKETIO] 📨 Received voice message { type: undefined, textLength: 77, socketId: 'ZdfiiLi6kY7sLFkLAAAH' }
[2025-09-08T11:55:25.909Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: 'Hi Emma, I want to test how well you remember diff...',
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "Hi Emma, I want to test how well you remember different types of information."
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757332525910}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 0
🧠 User facts count: 0
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "Hi Emma, I want to test how well you remember different types of information."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": ["Emma"],
"topics": ["memory", "information", "testing"],
"intents": ["greeting", "request"],
"emotions": [],
"context": ["casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": ["Emma: friend"],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [ 'Emma' ],
topics: [ 'memory', 'information', 'testing' ],
intents: [ 'greeting', 'request' ],
emotions: [],
context: [ 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 0.9 },
information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
temporal_context: { timeframe: 'current', certainty: 'factual' },
relationship_context: { mentioned_people: [ 'Emma: friend' ], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 1 entities, 3 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [
"Emma"
],
"topics": [
"memory",
"information",
"testing"
],
"intents": [
"greeting",
"request"
],
"emotions": [],
"context": [
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [
"Emma: friend"
],
"user_involvement": "direct"
}
}
😊 Emotion detected: neutral (from keywords, mode: general)  
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: Hi Emma, I want to test how well you remember different types of information.  
🔢 Generating vector embedding for text: Hi Emma, I want to test how well you remember diff...
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 0 results
✅ Found 0 relevant episodic memories via intelligent search

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: neutral
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "Hi Emma, I want to test how well you remember diff..."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: Hi Emma, I want to test how well you remember different types of information.  
🔢 Generating vector embedding for text: Hi Emma, I want to test how well you remember diff...
📨 Retrieved 0 recent memories
💬 Processed 0 recent messages
📊 Retrieved 0 user facts
ℹ️ No emotional state found, using defaults
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 0 results
📚 Found 0 semantically relevant memories
⏱️ Context built in 1510ms
🔨 Assembling context prompt...
📊 Context assembled: 104 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: Hi Emma, I want to test how well you remember different types of information.
😊 Emotion: neutral
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 0,
recentMemoriesCount: 0,
episodicMemoriesCount: 0,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling neutral. Respond naturally and helpfully. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships.
👤 User message: Hi Emma, I want to test how well you remember different types of information.
✅ OpenAI response: Hi there! I’m here and ready to help. What kind of information would you like to test me on?
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "Hi there! I’m here and ready to help. What kind of information would you like to test me on?"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "Hi Emma, I want to test how well you remember different types of information."
🤖 AI Response: "Hi there! I’m here and ready to help. What kind of information would you like to test me on?"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 0.27 (Level: low)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": true
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "participant"
},
"certainty_analysis": {
"level": "speculative",
"confidence": 0.2
},
"context_confidence": 0.8
}
🎯 Routing Decision: {
"memoryType": "episodic",
"reasoning": "Hypothetical or speculative content",
"metadata": {
"isSpeculative": true,
"importance": 0.135
}
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Hypothetical or speculative content → episodic

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: episodic
🎭 Storing in EPISODIC memory...
📄 Created summary: User shared: Hi Emma, I want to test how well you remember different types of information. AI responded: Hi there! I’m here and ready to help. What kind of information would you like to test me on? [Goal or aspiration discussed]
🧠 Reusing existing keyword analysis for memory classification
✅ Memory classification from existing analysis: {
isQuery: false,
primarySubject: 'self',
subjectConfidence: 0.9,
aboutUser: true,
aboutOthers: false,
context: [ 'casual' ],
mentionedPeople: [ 'Emma: friend' ]
}
🔢 Generating vector embedding for episodic memory...
🔢 Generating vector embedding for text: User shared: Hi Emma, I want to test how well you ...
✅ Generated embedding with 1536 dimensions
✅ Vector embedding generated successfully
✅ Episodic storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'episodic',
importance: 0.27,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: neutral
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.54
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T11:55:37.614Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '11705ms',
emotion: 'neutral',
textLength: 92,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:55:37.617Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 92,
text: 'Hi there! I’m here and ready to help. What kind of information would you like to test me on?...'
}
[AUDIO] ElevenLabs TTS request - emotion: neutral, length: 92
[VOICE] Speech generated - emotion: neutral, size: 71098
[2025-09-08T11:55:38.573Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 71098,
emotion: 'neutral',
generationTime: '954ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:55:38.573Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 94800,
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:55:38.576Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 71098,
emotion: 'neutral',
generationTime: '954ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

[2025-09-08T11:56:56.804Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: "I just got diagnosed with anxiety last week. It's ...",
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it."
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757332616805}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 0
🧠 User facts count: 0
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": [],
"topics": ["anxiety", "mental health", "diagnosis", "management"],
"intents": ["statement", "request"],
"emotions": ["overwhelmed"],
"context": ["personal", "casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1.0
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "past",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [],
topics: [ 'anxiety', 'mental health', 'diagnosis', 'management' ],
intents: [ 'statement', 'request' ],
emotions: [ 'overwhelmed' ],
context: [ 'personal', 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 1 },
information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
temporal_context: { timeframe: 'past', certainty: 'factual' },
relationship_context: { mentioned_people: [], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 0 entities, 4 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [],
"topics": [
"anxiety",
"mental health",
"diagnosis",
"management"
],
"intents": [
"statement",
"request"
],
"emotions": [
"overwhelmed"
],
"context": [
"personal",
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "past",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
😊 Emotion detected: overwhelmed (from keywords, mode: general)
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.
🔢 Generating vector embedding for text: I just got diagnosed with anxiety last week. It's ...
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.600, intelligence: 0.540)
✅ Found 1 relevant episodic memories via intelligent search  
 Episode 1: "User shared: Hi Emma, I want to test how well you ..." (low)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: overwhelmed
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "I just got diagnosed with anxiety last week. It's ..."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.
🔢 Generating vector embedding for text: I just got diagnosed with anxiety last week. It's ...
📊 Retrieved 0 user facts
📊 Emotional state: neutral (depth: superficial)
📨 Retrieved 0 recent memories
💬 Processed 0 recent messages
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.600, intelligence: 0.540)
📚 Found 1 semantically relevant memories
Memory 1: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 1327ms
🔨 Assembling context prompt...
📊 Context assembled: 176 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.
😊 Emotion: overwhelmed
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 0,
recentMemoriesCount: 0,
episodicMemoriesCount: 1,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: Hi Emma, I want to test how well you remember different types of in..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling overwhelmed. undefined. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. Previous relevant conversations: Hi Emma, I want to test how well you remember different types of information..
👤 User message: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.
✅ OpenAI response: I'm really sorry to hear that you're feeling overwhelmed. It’s completely understandable to feel this way after a diagnosis. Take things one step at a time. Have you considered talking to a professional or exploring some coping strategies, like mindfulness or breathing exercises? I  
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "I'm really sorry to hear that you're feeling overwhelmed. It’s completely understandable to feel this way after a diagnosis. Take things one step at a time. Have you considered talking to a professional or exploring some coping strategies, like mindfulness or breathing exercises? I"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it."
🤖 AI Response: "I'm really sorry to hear that you're feeling overwhelmed. It’s completely understandable to feel this way after a diagnosis. Take things one step at a time. Have you considered talking to a professional or exploring some coping strategies, like mindfulness or breathing exercises? I"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 1 (Level: high)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": true
},
"temporal_context": {
"timeframe": "past",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "participant"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.5
},
"context_confidence": 0.8
}
🎯 Routing Decision: {
"memoryType": "long_term",
"reasoning": "Past factual information about user",
"metadata": {
"isPastEvent": true,
"temporal": {
"timeframe": "past",
"certainty": "factual"
},
"importance": 0.8
}
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Past factual information about user → long_term

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: long_term
🧠 Storing in LONG-TERM memory...
📊 Extracted fact data: {
category: 'personal_facts',
key: 'important_statement_1757332626092',
value: "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.",
metadata: {
extractedFrom: "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.",
type: 'general',
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',  
 emotion: 'overwhelmed',
extractedKeywords: {
entities: [],
topics: [Array],
intents: [Array],
emotions: [Array],
context: [Array],
nsfw_classification: [Object],
subject_analysis: [Object],
information_ownership: [Object],
temporal_context: [Object],
relationship_context: [Object]
},
timestamp: 2025-09-08T11:57:06.088Z,
conversationId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',  
 importance: 'high',
importanceScore: 1,
importanceFactors: {
emotionalMilestone: true,
personalRevelation: true,
lifeEvent: false,
preferenceDeclaration: false,
goalSetting: false,
smallTalk: false,
repetitiveContent: false,
deepQuestion: false,
hasEmotionalContext: undefined,
isFirstMention: false
},
importanceReasoning: [ 'Contains emotional milestone', 'Personal revelation detected' ],
contextAnalysis: {
subject_analysis: [Object],
information_ownership: [Object],
temporal_context: [Object],
relationship_context: [Object],
certainty_analysis: [Object],
context_confidence: 0.8
},
routingDecision: {
memoryType: 'long_term',
reasoning: 'Past factual information about user',  
 metadata: [Object]
}
}
}
✅ Long-term fact storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'long_term',
importance: 1,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: overwhelmed  
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.57
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T11:57:06.479Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '9675ms',
emotion: 'overwhelmed',
textLength: 282,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:57:06.480Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'overwhelmed',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 282,
text: "I'm really sorry to hear that you're feeling overwhelmed. It’s completely understandable to feel thi..."
}
[AUDIO] ElevenLabs TTS request - emotion: overwhelmed, length: 282
[VOICE] Speech generated - emotion: overwhelmed, size: 240789
[2025-09-08T11:57:07.999Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 240789,
emotion: 'overwhelmed',
generationTime: '1518ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:57:08.000Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 321052,
emotion: 'overwhelmed',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:57:08.002Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 240789,
emotion: 'overwhelmed',
generationTime: '1518ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

[2025-09-08T11:58:53.764Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: 'Oh, and by the way, my favorite color is blue. I j...',
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before."
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757332733765}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 0
🧠 User facts count: 1
Fact 1: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (personal_facts)
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": [],
"topics": ["favorite color"],
"intents": ["statement"],
"emotions": [],
"context": ["casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1.0
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [],
topics: [ 'favorite color' ],
intents: [ 'statement' ],
emotions: [],
context: [ 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 1 },
information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
temporal_context: { timeframe: 'current', certainty: 'factual' },
relationship_context: { mentioned_people: [], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 0 entities, 1 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [],
"topics": [
"favorite color"
],
"intents": [
"statement"
],
"emotions": [],
"context": [
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
😊 Emotion detected: neutral (from keywords, mode: general)  
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before.
🔢 Generating vector embedding for text: Oh, and by the way, my favorite color is blue. I j...
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.590, intelligence: 0.536)
✅ Found 1 relevant episodic memories via intelligent search  
 Episode 1: "User shared: Hi Emma, I want to test how well you ..." (low)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: neutral
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "Oh, and by the way, my favorite color is blue. I j..."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before.
🔢 Generating vector embedding for text: Oh, and by the way, my favorite color is blue. I j...
📊 Retrieved 1 user facts
Fact 1: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (high)
📨 Retrieved 0 recent memories
💬 Processed 0 recent messages
📊 Emotional state: overwhelmed (depth: superficial)
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.590, intelligence: 0.536)
📚 Found 1 semantically relevant memories
Memory 1: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 780ms
🔨 Assembling context prompt...
📊 Context assembled: 237 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before.
😊 Emotion: neutral
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 1,
recentMemoriesCount: 0,
episodicMemoriesCount: 1,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: Hi Emma, I want to test how well you remember different types of in..."
👤 User facts:
Fact 1: "I just got diagnosed with anxiety last week. It's been reall..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling neutral. Respond naturally and helpfully. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. What you know about the user: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it.. Previous relevant conversations: Hi Emma, I want to test how well you remember different types of information..
👤 User message: Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before.
✅ OpenAI response: Thanks for sharing that! Blue is such a calming color. It’s nice to know a little more about you. If you ever want to talk about how you’re feeling or anything else, I’m here for you.
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "Thanks for sharing that! Blue is such a calming color. It’s nice to know a little more about you. If you ever want to talk about how you’re feeling or anything else, I’m here for you."

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before."
🤖 AI Response: "Thanks for sharing that! Blue is such a calming color. It’s nice to know a little more about you. If you ever want to talk about how you’re feeling or anything else, I’m here for you."
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 0.65 (Level: medium)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": true
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "participant"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.5
},
"context_confidence": 0.8
}
🎯 Routing Decision: {
"memoryType": "long_term",
"reasoning": "Medium-importance user facts",
"metadata": {
"isUserData": true,
"importance": 0.65
}
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Medium-importance user facts → long_term

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: long_term
🧠 Storing in LONG-TERM memory...
📊 Extracted fact data: {
category: 'preferences',
key: 'favorite_1757332740446',
value: 'color',
metadata: {
extractedFrom: 'Oh, and by the way, my favorite color is blue. I just realized I never mentioned that before.',
type: 'favorite',
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',  
 emotion: 'neutral',
extractedKeywords: {
entities: [],
topics: [Array],
intents: [Array],
emotions: [],
context: [Array],
nsfw_classification: [Object],
subject_analysis: [Object],
information_ownership: [Object],
temporal_context: [Object],
relationship_context: [Object]
},
timestamp: 2025-09-08T11:59:00.429Z,
conversationId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',  
 importance: 'medium',
importanceScore: 0.65,
importanceFactors: {
emotionalMilestone: undefined,
personalRevelation: false,
lifeEvent: false,
preferenceDeclaration: true,
goalSetting: false,
smallTalk: false,
repetitiveContent: false,
deepQuestion: false,
hasEmotionalContext: undefined,
isFirstMention: false
},
importanceReasoning: [ 'Preference declared' ],
contextAnalysis: {
subject_analysis: [Object],
information_ownership: [Object],
temporal_context: [Object],
relationship_context: [Object],
certainty_analysis: [Object],
context_confidence: 0.8
},
routingDecision: {
memoryType: 'long_term',
reasoning: 'Medium-importance user facts',
metadata: [Object]
}
}
}
✅ Long-term fact storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'long_term',
importance: 0.65,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: neutral
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.54
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T11:59:00.828Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '7064ms',
emotion: 'neutral',
textLength: 183,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:59:00.829Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 183,
text: 'Thanks for sharing that! Blue is such a calming color. It’s nice to know a little more about you. If...'
}
[AUDIO] ElevenLabs TTS request - emotion: neutral, length: 183
[VOICE] Speech generated - emotion: neutral, size: 145494
[2025-09-08T11:59:02.112Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 145494,
emotion: 'neutral',
generationTime: '1282ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:59:02.112Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 193992,
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T11:59:02.114Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 145494,
emotion: 'neutral',
generationTime: '1282ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

[2025-09-08T12:00:22.747Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: 'The weather is nice today, pretty sunny outside....',
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "The weather is nice today, pretty sunny outside."  
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757332822748}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 0
🧠 User facts count: 2
Fact 1: favorite_1757332740446 = "color" (preferences)  
 Fact 2: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (personal_facts)
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "The weather is nice today, pretty sunny outside."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": [],
"topics": ["weather", "sunshine"],
"intents": ["statement"],
"emotions": ["cheerful"],
"context": ["casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [],
topics: [ 'weather', 'sunshine' ],
intents: [ 'statement' ],
emotions: [ 'cheerful' ],
context: [ 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 0.9 },
information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
temporal_context: { timeframe: 'current', certainty: 'factual' },
relationship_context: { mentioned_people: [], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 0 entities, 2 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [],
"topics": [
"weather",
"sunshine"
],
"intents": [
"statement"
],
"emotions": [
"cheerful"
],
"context": [
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
😊 Emotion detected: cheerful (from keywords, mode: general)  
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: The weather is nice today, pretty sunny outside.
🔢 Generating vector embedding for text: The weather is nice today, pretty sunny outside....
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.550, intelligence: 0.520)
✅ Found 1 relevant episodic memories via intelligent search  
 Episode 1: "User shared: Hi Emma, I want to test how well you ..." (low)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: cheerful
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "The weather is nice today, pretty sunny outside...."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: The weather is nice today, pretty sunny outside.
🔢 Generating vector embedding for text: The weather is nice today, pretty sunny outside....
📊 Retrieved 2 user facts
Fact 1: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (high)
Fact 2: favorite_1757332740446 = "color" (medium)
📊 Emotional state: neutral (depth: superficial)
📨 Retrieved 0 recent memories
💬 Processed 0 recent messages
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.550, intelligence: 0.520)
📚 Found 1 semantically relevant memories
Memory 1: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 1196ms
🔨 Assembling context prompt...
📊 Context assembled: 264 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: The weather is nice today, pretty sunny outside.
😊 Emotion: cheerful
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 2,
recentMemoriesCount: 0,
episodicMemoriesCount: 1,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: Hi Emma, I want to test how well you remember different types of in..."
👤 User facts:
Fact 1: "I just got diagnosed with anxiety last week. It's been reall..."
Fact 2: "color..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling cheerful. undefined. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. What you know about the user: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it., color. Previous relevant conversations: Hi Emma, I want to test how well you remember different types of information..
👤 User message: The weather is nice today, pretty sunny outside.
✅ OpenAI response: That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "The weather is nice today, pretty sunny outside."
🤖 AI Response: "That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 0.3 (Level: low)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": true
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "participant"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.5
},
"context_confidence": 0.7
}
🎯 Routing Decision: {
"memoryType": "short_term",
"reasoning": "Low importance"
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Low importance → short_term

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: short_term
📝 Storing in SHORT-TERM memory...
✅ Short-term storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'short_term',
importance: 0.3,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: cheerful  
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.54
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T12:00:32.148Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '9402ms',
emotion: 'cheerful',
textLength: 110,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:00:32.151Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'cheerful',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 110,
text: 'That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nic...'
}
[AUDIO] ElevenLabs TTS request - emotion: cheerful, length: 110
[VOICE] Speech generated - emotion: cheerful, size: 91996
[2025-09-08T12:00:33.325Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 91996,
emotion: 'cheerful',
generationTime: '1173ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:00:33.326Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 122664,
emotion: 'cheerful',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:00:33.326Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 91996,
emotion: 'cheerful',
generationTime: '1173ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:04:40.019Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: "My friend told me he's getting married next month....",
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed."
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757333080020}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 1
Recent 1: "That sounds lovely! A sunny day can really lift yo" (short_term)
🧠 User facts count: 2
Fact 1: favorite_1757332740446 = "color" (preferences)  
 Fact 2: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (personal_facts)
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": {
"people": ["friend", "girlfriend"],
"places": [],
"things": [],
"brands": []
},
"topics": ["marriage", "relationships", "engagement", "friendship"],
"intents": ["statement"],
"emotions": ["happiness", "excitement"],
"context": ["personal", "casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "friend",
"confidence": 0.8
},
"information_ownership": {
"belongs_to_user": false,
"about_user": false,
"about_others": true
},
"temporal_context": {
"timeframe": "future",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": ["friend: friend", "girlfriend: partner"],
"user_involvement": "indirect"
}
}
✅ Successfully parsed keywords: {
entities: {
people: [ 'friend', 'girlfriend' ],
places: [],
things: [],
brands: []
},
topics: [ 'marriage', 'relationships', 'engagement', 'friendship' ],
intents: [ 'statement' ],
emotions: [ 'happiness', 'excitement' ],
context: [ 'personal', 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'friend', confidence: 0.8 },
information_ownership: { belongs_to_user: false, about_user:
false, about_others: true },
temporal_context: { timeframe: 'future', certainty: 'factual' },
relationship_context: {
mentioned_people: [ 'friend: friend', 'girlfriend: partner' ],
user_involvement: 'indirect'
}
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: undefined entities, 4 topics
🏷️ NSFW: false (general)
🧠 Context: friend about OTHERS
📊 Keyword extraction result: {
"entities": {
"people": [
"friend",
"girlfriend"
],
"places": [],
"things": [],
"brands": []
},
"topics": [
"marriage",
"relationships",
"engagement",
"friendship"
],
"intents": [
"statement"
],
"emotions": [
"happiness",
"excitement"
],
"context": [
"personal",
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "friend",
"confidence": 0.8
},
"information_ownership": {
"belongs_to_user": false,
"about_user": false,
"about_others": true
},
"temporal_context": {
"timeframe": "future",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [
"friend: friend",
"girlfriend: partner"
],
"user_involvement": "indirect"
}
}
😊 Emotion detected: happiness (from keywords, mode: general)
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed.
🔢 Generating vector embedding for text: My friend told me he's getting married next month....
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.545, intelligence: 0.518)
✅ Found 1 relevant episodic memories via intelligent search  
 Episode 1: "User shared: Hi Emma, I want to test how well you ..." (low)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: happiness
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "My friend told me he's getting married next month...."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed.
🔢 Generating vector embedding for text: My friend told me he's getting married next month....
📊 Emotional state: cheerful (depth: superficial)
📊 Retrieved 2 user facts
Fact 1: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (high)
Fact 2: favorite_1757332740446 = "color" (medium)
📨 Retrieved 1 recent memories
💬 Processed 2 recent messages
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 1 results
Result 1: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.545, intelligence: 0.518)
📚 Found 1 semantically relevant memories
Memory 1: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 799ms
🔨 Assembling context prompt...
📊 Context assembled: 338 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed.
😊 Emotion: happiness
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 2,
recentMemoriesCount: 2,
episodicMemoriesCount: 1,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: Hi Emma, I want to test how well you remember different types of in..."
👤 User facts:
Fact 1: "I just got diagnosed with anxiety last week. It's been reall..."
Fact 2: "color..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling happiness. undefined. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. What you know about the user: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it., color. Previous relevant conversations: Hi Emma, I want to test how well you remember different types of information.. Recent conversation: The weather is nice today, pretty sunny outside., That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?.
👤 User message: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed.
✅ OpenAI response: That's wonderful news! It sounds like a beautiful moment for your friend and his girlfriend. Celebrating love is always uplifting! Are you planning to attend the wedding?
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "That's wonderful news! It sounds like a beautiful moment for your friend and his girlfriend. Celebrating love is always uplifting! Are you planning to attend the wedding?"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed."
🤖 AI Response: "That's wonderful news! It sounds like a beautiful moment for your friend and his girlfriend. Celebrating love is always uplifting! Are you planning to attend the wedding?"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 0.18 (Level: low)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "related_person",
"confidence": 0.85
},
"information_ownership": {
"belongs_to_user": false,
"about_user": false,
"about_others": true
},
"temporal_context": {
"timeframe": "future",
"certainty": "speculative"
},
"relationship_context": {
"mentioned_people": [
"friend",
"romanti"
],
"user_involvement": "observer"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.5
},
"context_confidence": 1
}
🎯 Routing Decision: {
"memoryType": "episodic",
"reasoning": "Third-party information",
"metadata": {
"isThirdParty": true,
"relationship": {
"mentioned_people": [
"friend",
"romanti"
],
"user_involvement": "observer"
},
"importance": 0.126
}
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Third-party information → episodic

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: episodic
🎭 Storing in EPISODIC memory...
📄 Created summary: User shared: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed. AI responded: That's wonderful news! It sounds like a beautiful moment for your friend and his girlfriend. Celebrating love is always uplifting! Are you planning to attend the wedding? [Life event mentioned]
🧠 Reusing existing keyword analysis for memory classification
✅ Memory classification from existing analysis: {
isQuery: false,
primarySubject: 'friend',
subjectConfidence: 0.8,
aboutUser: false,
aboutOthers: true,
context: [ 'personal', 'casual' ],
mentionedPeople: [ 'friend: friend', 'girlfriend: partner' ]
}
🔢 Generating vector embedding for episodic memory...
🔢 Generating vector embedding for text: User shared: My friend told me he's getting marrie...
✅ Generated embedding with 1536 dimensions
✅ Vector embedding generated successfully
✅ Episodic storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'episodic',
importance: 0.18,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: happiness  
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.55
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T12:04:48.582Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '8564ms',
emotion: 'happiness',
textLength: 170,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:04:48.583Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'happiness',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 170,
text: "That's wonderful news! It sounds like a beautiful moment for your friend and his girlfriend. Celebra..."
}
[AUDIO] ElevenLabs TTS request - emotion: happiness, length: 170
[VOICE] Speech generated - emotion: happiness, size: 147584
[2025-09-08T12:04:49.723Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 147584,
emotion: 'happiness',
generationTime: '1140ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:04:49.724Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 196780,
emotion: 'happiness',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:04:49.725Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 147584,
emotion: 'happiness',
generationTime: '1140ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

[2025-09-08T12:06:12.516Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: "I'm feeling anxious about social situations lately...",
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "I'm feeling anxious about social situations lately."
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757333172518}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 1
Recent 1: "That sounds lovely! A sunny day can really lift yo" (short_term)
🧠 User facts count: 2
Fact 1: favorite_1757332740446 = "color" (preferences)  
 Fact 2: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (personal_facts)
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "I'm feeling anxious about social situations lately."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": [],
"topics": ["anxiety", "social situations"],
"intents": ["statement"],
"emotions": ["anxious"],
"context": ["personal"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1.0
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [],
topics: [ 'anxiety', 'social situations' ],
intents: [ 'statement' ],
emotions: [ 'anxious' ],
context: [ 'personal' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 1 },
information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
temporal_context: { timeframe: 'current', certainty: 'factual' },
relationship_context: { mentioned_people: [], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 0 entities, 2 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [],
"topics": [
"anxiety",
"social situations"
],
"intents": [
"statement"
],
"emotions": [
"anxious"
],
"context": [
"personal"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
😊 Emotion detected: anxious (from keywords, mode: general)  
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: I'm feeling anxious about social situations lately.
🔢 Generating vector embedding for text: I'm feeling anxious about social situations lately...
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 2 results
Result 1: "User shared: My friend told me he's getting married next mon..." (vector: 0.623, intelligence: 0.749)
Result 2: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.619, intelligence: 0.547)
✅ Found 2 relevant episodic memories via intelligent search  
 Episode 1: "User shared: My friend told me he's getting marrie..." (low)
Episode 2: "User shared: Hi Emma, I want to test how well you ..." (low)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: anxious
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "I'm feeling anxious about social situations lately..."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: I'm feeling anxious about social situations lately.
🔢 Generating vector embedding for text: I'm feeling anxious about social situations lately...
📊 Emotional state: happiness (depth: superficial)
📊 Retrieved 2 user facts
Fact 1: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (high)
Fact 2: favorite_1757332740446 = "color" (medium)
📨 Retrieved 1 recent memories
💬 Processed 2 recent messages
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 2 results
Result 1: "User shared: My friend told me he's getting married next mon..." (vector: 0.623, intelligence: 0.749)
Result 2: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.619, intelligence: 0.547)
📚 Found 2 semantically relevant memories
Memory 1: "User shared: My friend told me he's getting married next mon..."
Memory 2: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 728ms
🔨 Assembling context prompt...
📊 Context assembled: 440 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: I'm feeling anxious about social situations lately.
😊 Emotion: anxious
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 2,
recentMemoriesCount: 2,
episodicMemoriesCount: 2,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: My friend told me he's getting married next month. He's been with h..."
Memory 2: "User shared: Hi Emma, I want to test how well you remember different types of in..."
👤 User facts:
Fact 1: "I just got diagnosed with anxiety last week. It's been reall..."
Fact 2: "color..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling anxious. undefined. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. What you know about the user: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it., color. Previous relevant conversations: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed., Hi Emma, I want to test how well you remember different types of information.. Recent conversation: The weather is nice today, pretty sunny outside., That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?.
👤 User message: I'm feeling anxious about social situations lately.
✅ OpenAI response: I'm really sorry to hear that you're feeling this way. Social situations can be tough, especially when you're managing anxiety. It might help to take small steps, like starting with low-pressure gatherings or talking to supportive friends. Remember, it's okay to take breaks
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "I'm really sorry to hear that you're feeling this way. Social situations can be tough, especially when you're managing anxiety. It might help to take small steps, like starting with low-pressure gatherings or talking to supportive friends. Remember, it's okay to take breaks"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "I'm feeling anxious about social situations lately."
🤖 AI Response: "I'm really sorry to hear that you're feeling this way. Social situations can be tough, especially when you're managing anxiety. It might help to take small steps, like starting with low-pressure gatherings or talking to supportive friends. Remember, it's okay to take breaks"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 1 (Level: high)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": true
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "participant"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.5
},
"context_confidence": 1
}
🎯 Routing Decision: {
"memoryType": "episodic",
"reasoning": "High-importance user information",
"metadata": {
"isUserData": true,
"importance": 1
}
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: High-importance user information → episodic

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: episodic
🎭 Storing in EPISODIC memory...
📄 Created summary: User shared: I'm feeling anxious about social situations lately. AI responded: I'm really sorry to hear that you're feeling this way. Social situations can be tough, especially when you're managing anxiety. It might help to take small steps, like starting with low-pressure gatherings or talking to supportive friends. Remember, it's okay to take breaks [Emotional milestone detected] [Personal revelation shared]
🧠 Reusing existing keyword analysis for memory classification
✅ Memory classification from existing analysis: {
isQuery: false,
primarySubject: 'self',
subjectConfidence: 1,
aboutUser: true,
aboutOthers: false,
context: [ 'personal' ],
mentionedPeople: []
}
🔢 Generating vector embedding for episodic memory...
🔢 Generating vector embedding for text: User shared: I'm feeling anxious about social situ...
✅ Generated embedding with 1536 dimensions
✅ Vector embedding generated successfully
✅ Episodic storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'episodic',
importance: 1,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: anxious
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.57
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T12:06:19.769Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '7254ms',
emotion: 'anxious',
textLength: 274,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:06:19.770Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'anxious',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 274,
text: "I'm really sorry to hear that you're feeling this way. Social situations can be tough, especially wh..."
}
[AUDIO] ElevenLabs TTS request - emotion: anxious, length: 274
[VOICE] Speech generated - emotion: anxious, size: 227832
[2025-09-08T12:06:21.754Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 227832,
emotion: 'anxious',
generationTime: '1984ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:06:21.754Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 303776,
emotion: 'anxious',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:06:21.756Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 227832,
emotion: 'anxious',
generationTime: '1984ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

[2025-09-08T12:08:44.364Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: "I've been thinking about mental health resources....",
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "I've been thinking about mental health resources."
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757333324366}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 1
Recent 1: "That sounds lovely! A sunny day can really lift yo" (short_term)
🧠 User facts count: 2
Fact 1: favorite_1757332740446 = "color" (preferences)  
 Fact 2: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (personal_facts)
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "I've been thinking about mental health resources."
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": [],
"topics": ["mental health", "resources"],
"intents": ["statement"],
"emotions": [],
"context": ["casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [],
topics: [ 'mental health', 'resources' ],
intents: [ 'statement' ],
emotions: [],
context: [ 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 0.9 },
information_ownership: { belongs_to_user: true, about_user: true, about_others: false },
temporal_context: { timeframe: 'current', certainty: 'factual' },
relationship_context: { mentioned_people: [], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 0 entities, 2 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [],
"topics": [
"mental health",
"resources"
],
"intents": [
"statement"
],
"emotions": [],
"context": [
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
😊 Emotion detected: neutral (from keywords, mode: general)  
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: I've been thinking about mental health resources.
🔢 Generating vector embedding for text: I've been thinking about mental health resources....
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 2 results
Result 1: "User shared: My friend told me he's getting married next mon..." (vector: 0.583, intelligence: 0.733)
Result 2: "User shared: I'm feeling anxious about social situations lat..." (vector: 0.674, intelligence: 0.669)
✅ Found 2 relevant episodic memories via intelligent search  
 Episode 1: "User shared: My friend told me he's getting marrie..." (low)
Episode 2: "User shared: I'm feeling anxious about social situ..." (high)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: neutral
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "I've been thinking about mental health resources...."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: I've been thinking about mental health resources.
🔢 Generating vector embedding for text: I've been thinking about mental health resources....
📊 Retrieved 2 user facts
Fact 1: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (high)
Fact 2: favorite_1757332740446 = "color" (medium)
📊 Emotional state: anxious (depth: superficial)
📨 Retrieved 1 recent memories
💬 Processed 2 recent messages
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 3 results
Result 1: "User shared: My friend told me he's getting married next mon..." (vector: 0.583, intelligence: 0.733)
Result 2: "User shared: I'm feeling anxious about social situations lat..." (vector: 0.674, intelligence: 0.669)
Result 3: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.619, intelligence: 0.548)
📚 Found 3 semantically relevant memories
Memory 1: "User shared: My friend told me he's getting married next mon..."
Memory 2: "User shared: I'm feeling anxious about social situations lat..."
Memory 3: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 1384ms
🔨 Assembling context prompt...
📊 Context assembled: 560 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: I've been thinking about mental health resources.
😊 Emotion: neutral
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 2,
recentMemoriesCount: 2,
episodicMemoriesCount: 3,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: My friend told me he's getting married next month. He's been with h..."
Memory 2: "User shared: I'm feeling anxious about social situations lately. AI responded: I..."
Memory 3: "User shared: Hi Emma, I want to test how well you remember different types of in..."
👤 User facts:
Fact 1: "I just got diagnosed with anxiety last week. It's been reall..."
Fact 2: "color..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling neutral. Respond naturally and helpfully. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. What you know about the user: I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it., color. Previous relevant conversations: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed., I'm feeling anxious about social situations lately.. Recent conversation: The weather is nice today, pretty sunny outside., That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?.
👤 User message: I've been thinking about mental health resources.
✅ OpenAI response: That’s a great step! Exploring mental health resources can really help you manage your anxiety. Have you considered talking to a therapist or looking into support groups? There are also apps and online resources that can offer guidance and coping strategies. What kind of resources
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "That’s a great step! Exploring mental health resources can really help you manage your anxiety. Have you considered talking to a therapist or looking into support groups? There are also apps and online resources that can offer guidance and coping strategies. What kind of resources"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "I've been thinking about mental health resources."
🤖 AI Response: "That’s a great step! Exploring mental health resources can really help you manage your anxiety. Have you considered talking to a therapist or looking into support groups? There are also apps and online resources that can offer guidance and coping strategies. What kind of resources"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 0.7 (Level: high)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 0.9
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": true
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.7
},
"context_confidence": 0.7
}
🎯 Routing Decision: {
"memoryType": "long_term",
"reasoning": "Medium importance"
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Medium importance → long_term

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: long_term
🧠 Storing in LONG-TERM memory...
📊 Extracted fact data: {
category: 'personal_facts',
key: 'important_statement_1757333335145',
value: "I've been thinking about mental health resources.",
metadata: {
extractedFrom: "I've been thinking about mental health resources.",
type: 'general',
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',  
 emotion: 'neutral',
extractedKeywords: {
entities: [],
topics: [Array],
intents: [Array],
emotions: [],
context: [Array],
nsfw_classification: [Object],
subject_analysis: [Object],
information_ownership: [Object],
temporal_context: [Object],
relationship_context: [Object]
},
timestamp: 2025-09-08T12:08:55.133Z,
conversationId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',  
 importance: 'high',
importanceScore: 0.7,
importanceFactors: {
emotionalMilestone: undefined,
personalRevelation: true,
lifeEvent: false,
preferenceDeclaration: false,
goalSetting: false,
smallTalk: false,
repetitiveContent: false,
deepQuestion: false,
hasEmotionalContext: undefined,
isFirstMention: false
},
importanceReasoning: [ 'Personal revelation detected' ],  
 contextAnalysis: {
subject_analysis: [Object],
information_ownership: [Object],
temporal_context: [Object],
relationship_context: [Object],
certainty_analysis: [Object],
context_confidence: 0.7
},
routingDecision: { memoryType: 'long_term', reasoning: 'Medium importance' }
}
}
✅ Long-term fact storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'long_term',
importance: 0.7,
intelligentRouting: true
}
============================================================  
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: neutral
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.54
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T12:08:55.492Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '11131ms',
emotion: 'neutral',
textLength: 281,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
textLength: 281,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:08:55.493Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 281,
text: 'That’s a great step! Exploring mental health resources can really help you manage your anxiety. Have...'
}
[AUDIO] ElevenLabs TTS request - emotion: neutral, length: 281[VOICE] Speech generated - emotion: neutral, size: 254164  
[2025-09-08T12:08:56.971Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 254164,
emotion: 'neutral',
generationTime: '1477ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:08:56.972Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 338888,
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:08:56.976Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 254164,
emotion: 'neutral',
generationTime: '1477ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:18:32.705Z] [PROCESSING] 🎭 Processing voice message {
sessionId: '8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4',
text: 'what you remembered about me?...',
userId: 'default',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}

🎯 === CHAT CONTROLLER: processMessage START ===
📝 Input: "what you remembered about me?"
👤 UserId: default
🔗 SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4
🆔 Active SessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4  
💬 Conversation State: {"mode":"general","lastActivity":1757333912707}

🧠 === MEMORY RETRIEVAL PHASE ===
📚 Recent memories count: 1
Recent 1: "That sounds lovely! A sunny day can really lift yo" (short_term)
🧠 User facts count: 3
Fact 1: favorite_1757332740446 = "color" (preferences)  
 Fact 2: important_statement_1757333335145 = "I've been thinking about mental health resources." (personal_facts)  
 Fact 3: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (personal_facts)
🏷️ Context topics: []

🔍 === KEYWORD EXTRACTION PHASE ===
🤖 Using OpenAI for keyword extraction (memory retrieval needs this)...

🎯 === OPENAI: extractKeywords START ===
📝 Input text: "what you remembered about me?"
📚 Context topics: []
🤖 Calling OpenAI GPT-4o-mini for keyword extraction...  
✅ OpenAI response received
🔄 Parsing OpenAI JSON response...
📋 Raw OpenAI response: {
"entities": [],
"topics": ["memory", "identity", "personal history"],  
 "intents": ["question"],
"emotions": [],
"context": ["casual"],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0.0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1.0
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
✅ Successfully parsed keywords: {
entities: [],
topics: [ 'memory', 'identity', 'personal history' ],  
 intents: [ 'question' ],
emotions: [],
context: [ 'casual' ],
nsfw_classification: { isNSFW: false, category: 'general', confidence: 0 },
subject_analysis: { primary_subject: 'self', confidence: 1 },
information_ownership: { belongs_to_user: true, about_user:
true, about_others: false },
temporal_context: { timeframe: 'current', certainty: 'factual' },
relationship_context: { mentioned_people: [], user_involvement: 'direct' }
}
🎉 === OPENAI: extractKeywords COMPLETE ===
📊 Extracted: 0 entities, 3 topics
🏷️ NSFW: false (general)
🧠 Context: self about USER
📊 Keyword extraction result: {
"entities": [],
"topics": [
"memory",
"identity",
"personal history"
],
"intents": [
"question"
],
"emotions": [],
"context": [
"casual"
],
"nsfw_classification": {
"isNSFW": false,
"category": "general",
"confidence": 0
},
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
}
}
😊 Emotion detected: neutral (from keywords, mode: general)  
🔍 Retrieving episodic memories with existing keyword analysis...
🔍 Attempting intelligent vector search for: what you remembered about me?
🔢 Generating vector embedding for text: what you remembered about me?...
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 2 results
Result 1: "User shared: My friend told me he's getting married next mon..." (vector: 0.563, intelligence: 0.725)  
 Result 2: "User shared: I'm feeling anxious about social situations lat..." (vector: 0.581, intelligence: 0.633)  
✅ Found 2 relevant episodic memories via intelligent search
Episode 1: "User shared: My friend told me he's getting marrie..." (low)
Episode 2: "User shared: I'm feeling anxious about social situ..." (high)

🤖 === AI RESPONSE GENERATION PHASE ===
🎭 Generating response for emotion: neutral
\n🧠 === ENHANCED CONTEXT BUILDER: Building context ===  
👤 UserId: default
💬 Message: "what you remembered about me?..."
🔍 Searching for 3 relevant semantic memories using existing EpisodicMemory search...
🧠 Retrieving user facts (limit: 8)...
😊 Retrieving emotional state...
💬 Retrieving recent messages (limit: 5)...
🔍 Attempting intelligent vector search for: what you remembered about me?
🔢 Generating vector embedding for text: what you remembered about me?...
📨 Retrieved 1 recent memories
💬 Processed 2 recent messages
📊 Emotional state: neutral (depth: superficial)
📊 Retrieved 3 user facts
Fact 1: important_statement_1757333335145 = "I've been thinking about mental health resources." (high)
Fact 2: important_statement_1757332626092 = "I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it." (high)  
 Fact 3: favorite_1757332740446 = "color" (medium)
✅ Generated embedding with 1536 dimensions
🧠 No existing analysis provided, using basic semantic search
🎯 Executing intelligent vector search pipeline...
✅ Intelligent vector search found 3 results
Result 1: "User shared: My friend told me he's getting married next mon..." (vector: 0.563, intelligence: 0.725)  
 Result 2: "User shared: I'm feeling anxious about social situations lat..." (vector: 0.581, intelligence: 0.633)  
 Result 3: "User shared: Hi Emma, I want to test how well you remember d..." (vector: 0.679, intelligence: 0.571)  
📚 Found 3 semantically relevant memories
Memory 1: "User shared: My friend told me he's getting married next mon..."
Memory 2: "User shared: I'm feeling anxious about social situations lat..."
Memory 3: "User shared: Hi Emma, I want to test how well you remember d..."
⏱️ Context built in 1008ms
🔨 Assembling context prompt...
📊 Context assembled: 602 estimated tokens
✅ Enhanced context assembled successfully
🧠 Using memory context: provided from processMessage  
[AI_ROUTING] Using GPT-4 mini for general content - sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

🎯 === OPENAI: generateEmotionalResponse START ===
📝 Input message: what you remembered about me?
😊 Emotion: neutral
🧠 Memory context received: YES
📊 Memory context structure: {
contextBuilt: true,
userFactsCount: 3,
recentMemoriesCount: 2,
episodicMemoriesCount: 3,
hasEmotionalContext: true,
builderType: 'Enhanced'
}
🎭 Relevant memories content:
Memory 1: "User shared: My friend told me he's getting married next month. He's been with h..."
Memory 2: "User shared: I'm feeling anxious about social situations lately. AI responded: I..."
Memory 3: "User shared: Hi Emma, I want to test how well you remember different types of in..."
👤 User facts:
Fact 1: "I've been thinking about mental health resources...."
Fact 2: "I just got diagnosed with anxiety last week. It's been reall..."
Fact 3: "color..."
📋 Final system prompt: You are Emma, a caring and empathetic AI companion. The user seems to be feeling neutral. Respond naturally and helpfully. Keep your response concise but emotionally appropriate.

IMPORTANT: Use the context information below to provide accurate, personalized responses based on what you know about the user and their relationships. What you know about the user: I've been thinking about mental health resources., I just got diagnosed with anxiety last week. It's been really overwhelming and I'm trying to figure out how to manage it., color. Previous relevant conversations: My friend told me he's getting married next month. He's been with his girlfriend for like 3 years and finally proposed., I'm feeling anxious about social situations lately.. Recent conversation: The weather is nice today, pretty sunny outside., That sounds lovely! A sunny day can really lift your spirits. Do you have any plans to enjoy the nice weather?.
👤 User message: what you remembered about me?
✅ OpenAI response: I remember that you recently got diagnosed with anxiety, and it’s been overwhelming for you as you figure out how to manage it. You also mentioned your friend is getting married next month after being with his girlfriend for three years. Plus, you’ve been
🎉 === OPENAI: generateEmotionalResponse COMPLETE ===

💬 AI Response: "I remember that you recently got diagnosed with anxiety, and it’s been overwhelming for you as you figure out how to manage it. You also mentioned your friend is getting married next month after being with his girlfriend for three years. Plus, you’ve been"

💾 === MEMORY STORAGE PHASE ===

🎯 === MEMORY MANAGER: storeWithImportance START ===
👤 UserId: default
📝 User Message: "what you remembered about me?"
🤖 AI Response: "I remember that you recently got diagnosed with anxiety, and it’s been overwhelming for you as you figure out how to manage it. You also mentioned your friend is getting married next month after being with his girlfriend for three years. Plus, you’ve been"
🔄 Memory Type: auto
📊 Context Keys: [sessionId, emotion, extractedKeywords, timestamp, conversationId]

⚖️ === IMPORTANCE SCORING PHASE ===
📊 Importance Score: 0.3 (Level: low)

🧠 === CONTEXT ANALYSIS PHASE ===
🔍 Running enhanced context analysis...
📊 Context Analysis Result: {
"subject_analysis": {
"primary_subject": "self",
"confidence": 1
},
"information_ownership": {
"belongs_to_user": true,
"about_user": true,
"about_others": false
},
"temporal_context": {
"timeframe": "current",
"certainty": "factual"
},
"relationship_context": {
"mentioned_people": [],
"user_involvement": "direct"
},
"certainty_analysis": {
"level": "medium",
"confidence": 0.5
},
"context_confidence": 0.7
}
🎯 Routing Decision: {
"memoryType": "short_term",
"reasoning": "Low importance"
}

🎯 === MEMORY TYPE ROUTING PHASE ===
✅ Context-aware routing: Low importance → short_term

💾 === MEMORY STORAGE EXECUTION PHASE ===
🎯 Final memory type: short_term
📝 Storing in SHORT-TERM memory...
✅ Short-term storage complete: true

🎉 === MEMORY MANAGER: storeWithImportance COMPLETE ===  
✅ Storage successful: true
📊 Final result: {
success: true,
memoryType: 'short_term',
importance: 0.3,
intelligentRouting: true
}
============================================================
[MEMORY_V2] Conversation stored with context-aware routing - userId: default, sessionId: 8dbbe9b7-67e1-4d85-8fce-a11980f0b8a4

😊 === EMOTIONAL STATE UPDATE ===
😊 Updating emotional state for user default: neutral  
📈 Relationship depth progressing: superficial → developing
✅ Emotional state updated: depth=developing, affection=0.50, trust=0.54
✅ === CHAT CONTROLLER: processMessage COMPLETE ===

[2025-09-08T12:18:41.605Z] [SOCKETIO] 📤 Sent AI response to client {
responseTime: '8901ms',
emotion: 'neutral',
textLength: 255,
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:18:41.606Z] [AUDIO] 🔊 Generating speech audio (parallel) {
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH',
textLength: 255,
text: 'I remember that you recently got diagnosed with anxiety, and it’s been overwhelming for you as you f...'
}
[AUDIO] ElevenLabs TTS request - emotion: neutral, length: 255
[VOICE] Speech generated - emotion: neutral, size: 213204
[2025-09-08T12:18:42.987Z] [AUDIO] ✅ Audio buffer generated successfully {
audioSize: 213204,
emotion: 'neutral',
generationTime: '1380ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:18:42.988Z] [AUDIO] 📤 Sending audio response to client {
base64Length: 284272,
emotion: 'neutral',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
[2025-09-08T12:18:42.989Z] [AUDIO] ✅ Audio response sent {  
 audioSize: 213204,
emotion: 'neutral',
generationTime: '1380ms',
socketId: 'ZdfiiLi6kY7sLFkLAAAH'
}
