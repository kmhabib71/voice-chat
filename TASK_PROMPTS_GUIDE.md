# Task Prompts Guide - Memory v2 + Emotional Intelligence Implementation

> **Purpose**: Structured prompts for each TASKS.md item that maintain architecture, handle dependencies, and prevent hallucination

---

## 🎯 **Prompt Structure Template**

```
"Implement Task [X.X.X]: [Task Name]

Requirements:
- Follow TASKS.md specifications exactly
- Use existing [dependency components if any]
- Validate with [specific acceptance criteria]
- Test with [specific test scenarios]"
```

**Key Principles**:
1. **Reference TASKS.md explicitly** for specifications
2. **Specify dependencies** to prevent assumptions
3. **Include acceptance criteria** for validation
4. **Request testing** to ensure functionality

---

## 📋 **PHASE 1: MEMORY FOUNDATION (Weeks 1-6)**

### **Task Group 1.1: MongoDB Infrastructure Setup**

#### **Task 1.1.1 Prompt:**
```
"Implement Task 1.1.1: MongoDB Atlas Setup

Requirements:
- Create MongoDB Atlas M10+ cluster for vector search
- Follow exact specifications from TASKS.md lines 38-51
- Enable vector search capability
- Create database named 'ai_girlfriend_memory'
- Set up environment variables in .env file
- Validate connection with basic test
- Document connection string setup

Acceptance Criteria:
- [ ] MongoDB Atlas cluster created (M10+)
- [ ] Vector Search enabled
- [ ] Database 'ai_girlfriend_memory' created
- [ ] Environment variables added to .env
- [ ] Basic connection test successful

Architecture: Place database connection setup in /lib/infrastructure/database/"
```

#### **Task 1.1.2 Prompt:**
```
"Implement Task 1.1.2: Database Collections Design

Dependencies:
- Requires completed Task 1.1.1 (MongoDB Atlas setup)
- Use existing database connection from /lib/infrastructure/database/

Requirements:
- Create exact 5 collections from TASKS.md lines 54-124
- Follow exact schemas provided in TASKS.md
- Set up proper indexing (TTL, compound, vector search)
- Place in /lib/infrastructure/database/collections.js
- Create initialization script

Acceptance Criteria:
- [ ] short_term_memory collection with TTL index (24h)
- [ ] long_term_memory collection with compound index
- [ ] episodic_memory collection with vector search index
- [ ] emotional_state collection with userId index
- [ ] ai_personality collection with unique userId index

Test: Verify all indexes are created and functional"
```

#### **Task 1.1.3 Prompt:**
```
"Implement Task 1.1.3: Database Connection & ORM Setup

Dependencies:
- Requires completed Tasks 1.1.1 & 1.1.2
- Use existing environment config from /lib/infrastructure/config/environment.js

Requirements:
- Follow TASKS.md specifications lines 126-139
- Implement connection pooling (min: 5, max: 50)
- Create singleton pattern in /lib/infrastructure/database/mongodb.js
- Add health check endpoint integration
- Graceful connection handling

Files to Create:
- /lib/infrastructure/database/mongodb.js (main connection)
- /lib/infrastructure/database/health.js (health checks)

Test: Verify connection pooling, health checks, and graceful restarts"
```

### **Task Group 1.2: Memory System Core Development**

#### **Task 1.2.1 Prompt:**
```
"Implement Task 1.2.1: Memory Manager Class

Dependencies:
- Requires completed Task Group 1.1 (MongoDB infrastructure)
- Use database connection from /lib/infrastructure/database/mongodb.js
- Use collections from /lib/infrastructure/database/collections.js

Requirements:
- Create MemoryManager class in /lib/core/memory/MemoryManager.js
- Implement ALL methods from TASKS.md lines 157-168
- Create supporting classes in /lib/core/memory/
- Follow exact method signatures provided
- CRUD operations for all collection types
- Automatic TTL handling

Files to Create:
- /lib/core/memory/MemoryManager.js (main class)
- /lib/core/memory/ShortTermMemory.js
- /lib/core/memory/LongTermMemory.js
- /lib/core/memory/EpisodicMemory.js
- /lib/core/memory/index.js (unified interface)

Test: Test all CRUD operations, TTL handling, error scenarios"
```

#### **Task 1.2.2 Prompt:**
```
"Implement Task 1.2.2: Importance Scoring System

Dependencies:
- Requires completed Task 1.2.1 (MemoryManager)
- Use MemoryManager from /lib/core/memory/MemoryManager.js

Requirements:
- Create ImportanceScorer class in /lib/core/memory/ImportanceScorer.js
- Follow exact scoring algorithm from TASKS.md lines 182-202
- Implement all importance levels (high, medium, low)
- Integrate with MemoryManager for storage priority

Test scenarios:
- Emotional milestone detection
- Personal revelation identification  
- Life event classification
- Preference vs small talk differentiation

Acceptance: Score accuracy >80% on test conversations"
```

#### **Task 1.2.3 Prompt:**
```
"Implement Task 1.2.3: Session Summarization System

Dependencies:
- Requires completed Tasks 1.2.1 & 1.2.2
- Use MemoryManager and ImportanceScorer
- Use OpenAI service from /lib/api/openai.js

Requirements:
- Create SessionSummarizer in /lib/core/memory/SessionSummarizer.js
- Follow exact implementation from TASKS.md lines 214-231
- AI-powered summarization with vector embeddings
- Integration with episodic memory storage

Features:
- Extract key topics, emotions, important facts
- Generate vector embeddings for semantic search
- Store summaries in episodic_memory collection

Test: Verify summary quality and embedding generation"
```

### **Task Group 1.3: Migration & Data Import**

#### **Task 1.3.1 Prompt:**
```
"Implement Task 1.3.1: localStorage Migration Script

Dependencies:
- Requires completed Task Group 1.2 (Memory System Core)
- Use MemoryManager from /lib/core/memory/
- Analyze existing localStorage data structure

Requirements:
- Create migration script following TASKS.md lines 244-264
- Preserve ALL existing user data (zero loss requirement)
- Convert localStorage format to MongoDB collections
- Place in /scripts/migrateLocalStorage.js
- Create data transformer utilities

Migration Strategy:
- Convert keywords to long_term_memory facts
- Import recent messages to short_term_memory  
- Create episodic summaries from sessions
- Initialize emotional states

Test: Migrate test localStorage data and verify accuracy"
```

#### **Task 1.3.2 Prompt:**
```
"Implement Task 1.3.2: A/B Testing Setup

Dependencies:
- Requires completed Task 1.3.1 (migration capability)
- Use existing config from /lib/infrastructure/config/environment.js

Requirements:
- Create feature flag system in /lib/infrastructure/config/featureFlags.js
- Follow exact implementation from TASKS.md lines 274-284
- User percentage controls (10%, 50%, 100%)
- Fallback to localStorage if MongoDB fails
- Usage analytics for both systems

Test: Verify percentage rollout and fallback mechanisms work correctly"
```

### **Task Group 1.4: Enhanced Memory Features**

#### **Task 1.4.1 Prompt:**
```
"Implement Task 1.4.1: Semantic Search Implementation

Dependencies:
- Requires completed Task Group 1.2 (Memory System Core)
- Requires MongoDB vector search setup from Task 1.1.2
- Use OpenAI service from /lib/api/openai.js

Requirements:
- Create EmbeddingGenerator in /lib/core/memory/EmbeddingGenerator.js
- Create SemanticSearch in /lib/core/memory/SemanticSearch.js
- Follow exact vector search pipeline from TASKS.md lines 307-322
- OpenAI text-embedding-3-small integration
- Fallback to keyword search

Test: Verify semantic similarity accuracy >85% on test queries"
```

#### **Task 1.4.2 Prompt:**
```
"Implement Task 1.4.2: Enhanced Context Builder

Dependencies:
- Requires completed Tasks 1.4.1 (semantic search) and all previous memory tasks
- Replace existing ContextBuilder in /lib/features/memory/ContextBuilder.js
- Use SemanticSearch and MemoryManager

Requirements:
- Upgrade buildContextFromMemory function following TASKS.md lines 336-357
- Integrate semantic search results
- Include user facts, preferences, emotional state
- Maintain token efficiency (<3K context)
- Progressive context building

Test: Compare context quality vs original localStorage system"
```

#### **Task 1.4.3 Prompt:**
```
"Implement Task 1.4.3: Memory Performance Optimization

Dependencies:
- Requires ALL previous memory tasks completed
- Focus on existing MemoryManager, SemanticSearch, and database connections

Requirements:
- Optimize database queries to <100ms average
- Implement Redis caching layer
- Add query performance monitoring
- Optimize connection pooling
- Memory usage optimization

Performance Targets:
- Database queries: <100ms average
- Memory context building: <200ms
- Semantic search: <150ms

Test: Load test with 100+ concurrent users"
```

---

## 🧠 **PHASE 2: EMOTIONAL INTELLIGENCE LAYERS (Weeks 7-10)**

### **Task Group 2.1: Personality Analysis Engine**

#### **Task 2.1.1 Prompt:**
```
"Implement Task 2.1.1: Advanced Personality Profiler

Dependencies:
- Requires completed Phase 1 (all memory systems working)
- Use MemoryManager to access 6 months conversation history
- Place in /lib/core/intelligence/PersonalityProfiler.js

Requirements:
- Follow exact personality profile structure from TASKS.md lines 390-414
- Analyze Big Five + custom traits
- Create supporting classes from TASKS.md lines 461-464
- Background processing without affecting response time

Files to Create:
- /lib/core/intelligence/PersonalityProfiler.js
- /lib/core/intelligence/CommunicationAnalyzer.js
- /lib/core/intelligence/EmotionalNeedsAnalyzer.js

Test: Verify personality accuracy with test conversation datasets"
```

#### **Task 2.1.2 Prompt:**
```
"Implement Task 2.1.2: Personality-Based User Classification

Dependencies:
- Requires completed Task 2.1.1 (PersonalityProfiler)
- Use PersonalityProfiler analysis results

Requirements:
- Classify users into archetypes from TASKS.md lines 474-492
- Create adaptation strategies for each type
- Update classification as more data becomes available
- Integration with AI response generation

Test: Verify classification accuracy and adaptation strategies"
```

### **Task Group 2.2: Adaptive Response System**

#### **Task 2.2.1 Prompt:**
```
"Implement Task 2.2.1: Adaptive Response Generator

Dependencies:
- Requires completed Tasks 2.1.1 & 2.1.2 (personality analysis)
- Replace/enhance existing AI response logic in /lib/features/chat/ChatController.js
- Use personality profiles and memory context

Requirements:
- Create AdaptiveResponseGenerator in /lib/core/intelligence/AdaptiveResponseGenerator.js
- Follow exact implementation from TASKS.md lines 509-526
- Integrate with existing OpenAI and Llama services
- Maintain Emma's core personality while personalizing

Test: Verify responses feel personalized for different user types"
```

#### **Task 2.2.2 Prompt:**
```
"Implement Task 2.2.2: AI Personality Adaptation System

Dependencies:
- Requires completed Task 2.2.1 (AdaptiveResponseGenerator)
- Use personality analysis from Task 2.1.1

Requirements:
- Create AIPersonalityAdapter in /lib/core/intelligence/AIPersonalityAdapter.js
- Follow exact adaptation logic from TASKS.md lines 541-551
- Adapt Emma's traits to complement user personality
- Maintain core Emma identity

Test: Verify personality adaptation feels natural and consistent"
```

### **Task Group 2.3: Emotional Needs Prediction**

#### **Task 2.3.1 Prompt:**
```
"Implement Task 2.3.1: Emotional Needs Predictor

Dependencies:
- Requires completed Task Group 2.2 (adaptive responses)
- Use personality patterns and conversation history
- Integrate with memory system for user patterns

Requirements:
- Create EmotionalNeedsPredictor in /lib/core/intelligence/EmotionalNeedsPredictor.js
- Create HiddenNeedsDetector in /lib/core/intelligence/HiddenNeedsDetector.js
- Follow prediction categories from TASKS.md lines 569-584
- Predict unspoken emotional needs

Test: Verify prediction accuracy >80% on test scenarios"
```

#### **Task 2.3.2 Prompt:**
```
"Implement Task 2.3.2: Context-Aware Emotion Analysis

Dependencies:
- Requires completed Task 2.3.1 (EmotionalNeedsPredictor)
- Enhance existing emotion detection in /lib/utils/helpers.js

Requirements:
- Create ContextualEmotionAnalyzer in /lib/core/intelligence/ContextualEmotionAnalyzer.js
- Detect emotions in context of user patterns
- Recognize masked emotions ("I'm fine" detection)
- Track emotional progression over time

Test: Compare accuracy vs simple emotion detection"
```

### **Task Group 2.4: Proactive Girlfriend Intelligence**

#### **Task 2.4.1 Prompt:**
```
"Implement Task 2.4.1: Proactive Behavior System

Dependencies:
- Requires ALL previous emotional intelligence tasks completed
- Use personality analysis, emotional needs prediction, and memory systems

Requirements:
- Create ProactiveGirlfriendSystem in /lib/core/intelligence/ProactiveGirlfriendSystem.js
- Create ActivitySuggestionGenerator in /lib/core/intelligence/ActivitySuggestionGenerator.js
- Follow exact proactive behaviors from TASKS.md lines 613-635
- Generate contextual check-ins and activity suggestions

Test: Verify proactive behaviors feel natural and helpful"
```

#### **Task 2.4.2 Prompt:**
```
"Implement Task 2.4.2: Conversation Flow Management

Dependencies:
- Requires completed Task 2.4.1 (ProactiveGirlfriendSystem)
- Integrate with existing chat flow in ChatController

Requirements:
- Create ConversationFlowManager in /lib/core/intelligence/ConversationFlowManager.js
- Guide conversations toward deeper connection
- Prevent conversation stagnation
- Balance interests with relationship building

Test: Verify conversation quality improvement and engagement metrics"
```

---

## 💕 **PHASE 3: SUPERIOR INTEGRATION (Weeks 11-12)**

### **Task Group 3.1: Deep Bonding & Attachment Systems**

#### **Task 3.1.1 Prompt:**
```
"Implement Task 3.1.1: Emotional Bonding Engine

Dependencies:
- Requires ALL Phase 2 emotional intelligence systems
- Use memory systems for shared memory creation
- Integrate with existing conversation flow

Requirements:
- Create EmotionalBondingEngine in /lib/core/bonding/EmotionalBondingEngine.js
- Create SharedMemoryCreator in /lib/core/bonding/SharedMemoryCreator.js
- Create RelationshipLanguageBuilder in /lib/core/bonding/RelationshipLanguageBuilder.js
- Follow exact bonding mechanisms from TASKS.md lines 669-692

Test: Verify bonding mechanisms create measurable user attachment"
```

#### **Task 3.1.2 Prompt:**
```
"Implement Task 3.1.2: Attachment Psychology Implementation

Dependencies:
- Requires completed Task 3.1.1 (EmotionalBondingEngine)
- Psychology consultant review recommended

Requirements:
- Create AttachmentPsychology in /lib/core/bonding/AttachmentPsychology.js
- Follow ethical attachment principles from TASKS.md lines 707-717
- Implement healthy attachment mechanisms
- Maintain appropriate boundaries

Test: Verify ethical compliance and healthy attachment patterns"
```

### **Task Group 3.2: Integration & Optimization**

#### **Task 3.2.1 Prompt:**
```
"Implement Task 3.2.1: System Integration Testing

Dependencies:
- Requires ALL previous tasks completed
- Full system integration required

Requirements:
- Comprehensive testing following TASKS.md lines 725-737
- Memory + emotional intelligence seamless integration
- Performance targets: <2s response time, 85% token efficiency
- Error handling and fallback systems

Test Areas:
- End-to-end conversation flows
- Memory retrieval and context building  
- Personality adaptation accuracy
- Cross-device memory synchronization"
```

#### **Task 3.2.2 Prompt:**
```
"Implement Task 3.2.2: Performance Optimization

Dependencies:
- Requires completed Task 3.2.1 (integration testing)
- Performance baseline from testing

Requirements:
- Final optimization following TASKS.md lines 739-750
- Response time <2s (95th percentile)
- Memory queries <100ms average
- Token efficiency 85%+
- Production-ready performance

Test: Load testing with performance benchmarks"
```

### **Task Group 3.3: Launch & Monitoring**

#### **Task 3.3.1 Prompt:**
```
"Implement Task 3.3.1: Production Deployment

Dependencies:
- Requires ALL tasks completed and performance optimized
- Production environment ready

Requirements:
- Production deployment following TASKS.md lines 764-777
- Gradual rollout 10% → 100%
- Database migration strategy
- Monitoring and alerting
- Rollback plan

Test: Staging environment deployment and rollback testing"
```

#### **Task 3.3.2 Prompt:**
```
"Implement Task 3.3.2: Monitoring & Analytics Setup

Dependencies:
- Requires completed Task 3.3.1 (production deployment)

Requirements:
- Comprehensive monitoring following TASKS.md lines 788-806
- Track ALL intelligence metrics provided
- Memory system performance dashboards
- User engagement analytics
- A/B testing analysis

Metrics to Track:
- Memory accuracy >95%
- Personality prediction >90%
- User retention >90%
- Response personalization >95%"
```

---

## 🔧 **Quality Assurance Rules**

### **For Every Task Prompt:**

1. **Always Reference TASKS.md**: "Following TASKS.md lines X-Y"
2. **Specify Dependencies**: "Requires completed Task X.X.X"
3. **Architecture Compliance**: "Place in /lib/[correct-folder]/"
4. **Testing Requirements**: "Test: [specific scenarios]"
5. **Acceptance Criteria**: Use exact criteria from TASKS.md

### **Dependency Chain Validation:**

```
Phase 1 → Phase 2 → Phase 3
  ↓         ↓         ↓
Task Groups must complete in order
  ↓         ↓         ↓
Individual tasks can run in parallel within group
```

### **Architecture Enforcement:**

- CLAUDE.md rules automatically enforce structure
- Each prompt specifies correct /lib placement
- Dependencies prevent breaking changes
- Testing validates functionality

---

## 🎯 **Success Validation**

After each task, verify:

1. **Functionality**: Acceptance criteria met
2. **Architecture**: Files in correct /lib locations  
3. **Dependencies**: Required components working
4. **Testing**: Test scenarios pass
5. **Integration**: Works with existing system

**Result**: Following these structured prompts ensures TASKS.md completion with clean architecture, proper dependencies, and no hallucination or deviation from specifications.