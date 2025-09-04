# AI Girlfriend Project Architecture Guide
## Clean, Scalable Code Organization for Intelligent Memory System

> **Purpose**: Prevent messy architecture and lost functions during development of Memory v2 + Emotional Intelligence system. Every file and function has a clear home and purpose.

---

## 🏗️ **Master Architecture Overview**

### **High-Level System Design**
```
┌─────────────────────────────────────────────────────────────┐
│                    AI GIRLFRIEND SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: UI (React Components, Chat Interface)             │
│ Layer 4: Features (Chat, NSFW, Memory, Personality)        │  
│ Layer 3: Core (AI Engine, Memory System, Intelligence)     │
│ Layer 2: API (OpenAI, Llama, ElevenLabs, MongoDB)         │
│ Layer 1: Infrastructure (Database, Auth, Config)           │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow Rules** (NEVER BREAK THESE)
```
✅ CORRECT FLOW:
UI → Features → Core → API → Infrastructure

❌ FORBIDDEN FLOW: 
Infrastructure → Features (creates spaghetti code)
API → UI (bypasses business logic)
Features calling other Features directly (creates dependencies)
```

---

## 📁 **Complete Folder Structure**

### **Root Project Structure**
```
/voicechat (your current root)
├── /client                    # Frontend React application
│   ├── /src
│   │   ├── /components        # UI components
│   │   ├── /features          # Feature-specific UI
│   │   ├── /utils            # Frontend utilities
│   │   └── /assets           # Images, styles, etc.
│   └── package.json
├── /server                    # Backend Node.js (your current server.js)
├── /lib                       # NEW: Organized business logic
│   ├── /api                   # External API integrations
│   ├── /core                  # Core AI and memory systems
│   ├── /features              # Business feature logic
│   ├── /infrastructure        # Database, auth, config
│   └── /utils                 # Shared utilities
├── /docs                      # Documentation
├── /tests                     # Test files
└── package.json
```

### **NEW: /lib Folder Organization**
```javascript
/lib
├── /api                       # External service integrations
│   ├── openai.js             # OpenAI GPT-4 mini calls
│   ├── llama.js              # Llama 3.3 NSFW calls  
│   ├── elevenlabs.js         # Text-to-speech
│   ├── mongodb.js            # Database operations
│   └── weatherapi.js         # Contextual awareness APIs
│
├── /core                      # Core AI intelligence systems
│   ├── /memory               # Memory system (your main differentiator)
│   │   ├── MemoryManager.js  # Main memory controller
│   │   ├── ShortTermMemory.js # Recent conversations (24h)
│   │   ├── LongTermMemory.js  # User facts, preferences
│   │   ├── EpisodicMemory.js  # Session summaries
│   │   ├── SemanticSearch.js  # Vector search capabilities
│   │   └── index.js          # Unified memory interface
│   ├── /intelligence         # Emotional intelligence engine
│   │   ├── PersonalityAnalyzer.js    # User personality profiling
│   │   ├── EmotionalPredictor.js     # Predict user needs
│   │   ├── AdaptiveResponse.js       # Personalized responses
│   │   └── ProactiveEngine.js        # Girlfriend-like behaviors
│   ├── /context              # Contextual awareness
│   │   ├── UserContext.js    # Location, time, weather detection
│   │   ├── ContextualGreeting.js # Smart opening messages
│   │   └── EnvironmentAware.js   # Situational responses
│   └── aiEngine.js           # Main AI orchestrator
│
├── /features                  # Business features (isolated)
│   ├── /chat                 # Core chat functionality
│   │   ├── ChatController.js # Chat business logic
│   │   ├── ChatService.js    # Chat helper methods
│   │   └── MessageProcessor.js # Message handling
│   ├── /nsfw                 # NSFW content handling
│   │   ├── NSFWRouter.js     # Route to appropriate AI
│   │   ├── ContentFilter.js  # NSFW classification
│   │   └── ConversationMode.js # NSFW mode persistence
│   ├── /personality          # User personality features
│   │   ├── PersonalityBuilder.js # Build user profiles
│   │   ├── AdaptationEngine.js   # Adapt AI personality
│   │   └── BehaviorAnalyzer.js   # Analyze user patterns
│   ├── /voice                # Voice chat features
│   │   ├── VoiceController.js # Voice processing
│   │   ├── SpeechSynthesis.js # TTS with personality
│   │   └── VoiceRecognition.js # STT processing
│   └── /memory               # Memory feature layer
│       ├── MemoryController.js # Memory CRUD operations
│       ├── ImportanceScorer.js # Memory importance analysis
│       └── ContextBuilder.js   # Enhanced context building
│
├── /infrastructure           # System infrastructure
│   ├── /database            # Database configuration
│   │   ├── connection.js    # MongoDB connection
│   │   ├── models.js        # Data models
│   │   └── migrations.js    # Database setup
│   ├── /auth               # Authentication (future)
│   │   ├── sessionManager.js # Session handling
│   │   └── security.js     # Security utilities
│   ├── /config             # Configuration management
│   │   ├── environment.js  # Environment variables
│   │   ├── constants.js    # System constants
│   │   └── settings.js     # App settings
│   └── /monitoring         # Health checks, logging
│       ├── logger.js       # Centralized logging
│       ├── metrics.js      # Performance metrics
│       └── healthCheck.js  # System health
│
└── /utils                    # Shared utilities
    ├── validation.js        # Input validation
    ├── errors.js           # Error handling
    ├── helpers.js          # Common functions
    ├── constants.js        # Shared constants
    └── types.js            # Type definitions
```

---

## 🎯 **Function Naming Conventions**

### **Verb + Object Pattern** (ALWAYS USE)
```javascript
// ✅ GOOD: Clear purpose immediately obvious
createUserFact()
updateEmotionalState()  
retrieveRelevantMemories()
generatePersonalizedResponse()
scheduleProactiveMessage()
analyzeUserPersonality()
buildContextualGreeting()

// ❌ BAD: Vague, unclear purpose
handleData()
processInput()
doStuff()
manageThings()
runSystem()
```

### **Feature-Specific Prefixes**
```javascript
// Memory functions
memory_store()
memory_retrieve()
memory_search()
memory_update()

// Personality functions  
personality_analyze()
personality_adapt()
personality_predict()

// NSFW functions
nsfw_classify()
nsfw_route()
nsfw_moderate()

// Context functions
context_detect()
context_build()  
context_enhance()
```

---

## 🔄 **Data Flow Architecture**

### **Request Processing Flow**
```javascript
// User sends message: "I had a rough day at work"

1. UI Layer (client/src/components/Chat.js)
   ↓ User types message
   
2. Feature Layer (lib/features/chat/ChatController.js)
   ↓ Processes chat request
   
3. Core Layer (lib/core/aiEngine.js)
   ↓ Orchestrates AI response
   
4. Memory Core (lib/core/memory/MemoryManager.js)
   ↓ Retrieves relevant memories
   
5. Intelligence Core (lib/core/intelligence/PersonalityAnalyzer.js)
   ↓ Analyzes user personality and needs
   
6. API Layer (lib/api/openai.js OR lib/api/llama.js)
   ↓ Calls appropriate AI model
   
7. Response flows back up the chain
   ↓ Enhanced with memory and personality context
   
8. UI Layer displays personalized response
```

### **Memory System Data Flow**
```javascript
// Example: Storing and retrieving user information

1. User mentions: "My birthday is March 15th"

2. ChatController.js 
   → Identifies important user fact
   
3. MemoryController.js (feature layer)
   → Processes fact for storage
   
4. ImportanceScorer.js 
   → Assigns importance level (high for birthday)
   
5. MemoryManager.js (core layer)
   → Orchestrates storage across memory types
   
6. LongTermMemory.js 
   → Stores birthday as permanent fact
   
7. SemanticSearch.js 
   → Creates vector embedding for future retrieval
   
8. MongoDB (infrastructure)
   → Persists data with proper indexing
```

---

## 📋 **Implementation Strategy**

### **Phase 1: Reorganize Current Code (Week 1)**

#### **Step 1: Create New Folder Structure**
```bash
# From your current voicechat directory
mkdir -p lib/{api,core,features,infrastructure,utils}
mkdir -p lib/core/{memory,intelligence,context}
mkdir -p lib/features/{chat,nsfw,personality,voice,memory}
mkdir -p lib/infrastructure/{database,auth,config,monitoring}
mkdir -p docs tests
```

#### **Step 2: Move Existing Functions**
```javascript
// Current server.js has mixed responsibilities - split them:

// Move to lib/api/
- OpenAI integration → lib/api/openai.js
- Llama integration → lib/api/llama.js  
- ElevenLabs integration → lib/api/elevenlabs.js

// Move to lib/features/
- Chat handling → lib/features/chat/ChatController.js
- NSFW routing → lib/features/nsfw/NSFWRouter.js
- Memory building → lib/features/memory/ContextBuilder.js

// Move to lib/core/
- Memory management → lib/core/memory/MemoryManager.js
- AI orchestration → lib/core/aiEngine.js

// Keep in server.js:
- Express setup
- WebSocket handling  
- Route definitions
- Middleware configuration
```

#### **Step 3: Create Index Files** (Entry Points)
```javascript
// lib/core/memory/index.js - Unified memory interface
const MemoryManager = require('./MemoryManager');
const ShortTermMemory = require('./ShortTermMemory');
const LongTermMemory = require('./LongTermMemory');

module.exports = {
  // Simple, consistent API
  store: (userId, data, type) => MemoryManager.store(userId, data, type),
  retrieve: (userId, query) => MemoryManager.retrieve(userId, query),
  search: (userId, query, limit) => MemoryManager.search(userId, query, limit),
  // ... other memory operations
};

// Usage from anywhere in the app:
const Memory = require('../core/memory');
const userMemories = await Memory.retrieve(userId, 'work stress');
```

### **Phase 2: Implement Clean Interfaces (Week 2)**

#### **Core System Interface**
```javascript
// lib/core/aiEngine.js - Main AI orchestrator
class AIEngine {
  async processMessage(userId, message, sessionContext) {
    // 1. Get user personality and memory
    const [personality, memories] = await Promise.all([
      this.personality.analyze(userId),
      this.memory.retrieve(userId, message)
    ]);
    
    // 2. Build enhanced context
    const context = await this.context.build({
      message, personality, memories, sessionContext
    });
    
    // 3. Determine AI routing (GPT vs Llama)
    const aiModel = this.routing.determineModel(context);
    
    // 4. Generate response
    const response = await this.api[aiModel].generate(context);
    
    // 5. Store interaction in memory
    await this.memory.store(userId, { message, response }, 'conversation');
    
    return response;
  }
}
```

### **Phase 3: Add Architecture Documentation (Week 2)**

#### **Create Architecture Map**
```javascript
// docs/architecture.md
# AI Girlfriend System Architecture

## Core Principles
1. Separation of Concerns: Each folder has single responsibility
2. Dependency Flow: UI → Features → Core → API → Infrastructure  
3. Memory-First Design: Memory system is the core differentiator
4. Feature Isolation: Features don't directly call each other
5. Clear Naming: Function names immediately reveal purpose

## File Purposes
- /api: External service integrations only
- /core: Business logic and AI intelligence  
- /features: User-facing functionality
- /infrastructure: System concerns (DB, config, monitoring)
- /utils: Shared helper functions

## Adding New Features
1. Create feature folder in /lib/features/[feature-name]
2. Add Controller.js (business logic) and Service.js (helpers)
3. Connect to core systems via /lib/core interfaces
4. Never call other features directly - go through core
5. Add tests in /tests/features/[feature-name]
```

---

## 🛡️ **Code Quality Rules**

### **File Header Template** (Add to every file)
```javascript
/**
 * @fileoverview [Short description of file purpose]
 * @author [Your name]  
 * @created [Date]
 * 
 * @example
 * // How to use this file
 * const result = await someFunction(params);
 */

// Dependencies (organized by type)
// External libraries
const express = require('express');
const mongoose = require('mongoose');

// Internal core systems
const Memory = require('../core/memory');
const Intelligence = require('../core/intelligence');

// Feature dependencies  
const ChatService = require('./ChatService');

// Utilities
const { validateInput, logError } = require('../utils/helpers');
```

### **Function Documentation Template**
```javascript
/**
 * Generates personalized AI response based on user personality and memory
 * @param {string} userId - Unique user identifier
 * @param {string} message - User's input message
 * @param {Object} context - Additional context (location, time, etc.)
 * @returns {Promise<string>} Personalized AI response
 * @throws {ValidationError} When userId or message is invalid
 * 
 * @example
 * const response = await generatePersonalizedResponse(
 *   'user123', 
 *   'I had a rough day',
 *   { location: 'San Francisco', time: '2PM' }
 * );
 */
async function generatePersonalizedResponse(userId, message, context) {
  // Implementation here
}
```

### **Error Handling Pattern**
```javascript
// lib/utils/errors.js - Centralized error handling
class AIGirlfriendError extends Error {
  constructor(message, type, code) {
    super(message);
    this.type = type;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AIGirlfriendError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
}

// Usage in any file:
const { ValidationError } = require('../utils/errors');

if (!userId) {
  throw new ValidationError('User ID is required', 'userId');
}
```

---

## 🔧 **Development Tools Setup**

### **Add to package.json**
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint lib/ --fix",
    "docs": "jsdoc lib/ -d docs/api",
    "check-arch": "node scripts/checkArchitecture.js"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.0.0", 
    "jest": "^29.0.0",
    "jsdoc": "^4.0.0",
    "nodemon": "^3.0.0"
  }
}
```

### **ESLint Configuration** (.eslintrc.js)
```javascript
module.exports = {
  rules: {
    // Enforce naming conventions
    'camelcase': ['error', { properties: 'always' }],
    
    // Require function documentation
    'valid-jsdoc': ['error', { 
      requireReturn: true,
      requireParamDescription: true 
    }],
    
    // Prevent circular dependencies
    'import/no-cycle': ['error'],
    
    // Enforce consistent file structure
    'import/no-relative-parent-imports': ['error']
  }
};
```

---

## 🎯 **Migration Checklist**

### **Week 1: Structure Setup**
- [ ] Create new folder structure
- [ ] Move existing functions to appropriate folders  
- [ ] Create index.js files for each module
- [ ] Update import statements throughout codebase
- [ ] Test that everything still works

### **Week 2: Clean Interfaces** 
- [ ] Create unified memory interface
- [ ] Implement AI engine orchestrator
- [ ] Add proper error handling
- [ ] Write function documentation
- [ ] Add architecture documentation

### **Week 3: Quality Tools**
- [ ] Set up ESLint and Prettier
- [ ] Add Jest testing framework
- [ ] Create development scripts
- [ ] Add architecture validation script
- [ ] Test full system integration

---

## 🚀 **Benefits of This Architecture**

### **For Development:**
✅ **Never Lost Again**: Every function has a clear home
✅ **Easy Debugging**: Follow data flow from UI → Core → API
✅ **Faster Development**: Know exactly where to add new features
✅ **AI Assistant Friendly**: Clear structure helps AI tools place code correctly

### **For Business:**
✅ **Scalable Codebase**: Can handle Memory v2 + Emotional Intelligence complexity
✅ **Team Ready**: New developers can understand system quickly  
✅ **Maintainable**: Easy to fix bugs and add features
✅ **JVZoo Ready**: Clean codebase packages better for product sales

This architecture will transform your development experience from chaotic to organized, ensuring you never lose track of functions or break features during development. It's specifically designed for the complexity of your AI girlfriend system with Memory v2 and Emotional Intelligence.

**Implement this structure before continuing with Memory v2 development - it will save you weeks of debugging and rework!**