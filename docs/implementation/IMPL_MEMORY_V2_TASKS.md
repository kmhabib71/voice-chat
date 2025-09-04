# AI Girlfriend Memory System v2 - Implementation Tasks

## Overview
Upgrade the existing keyword-based memory system to include layered memory (episodic, emotional, semantic) while maintaining efficiency and using MongoDB as the unified data store.

## Phase 1: Foundation & Quick Wins (1-2 weeks)

### Task 1.1: MongoDB Memory Collections Setup
- [ ] Design MongoDB collections schema:
  - `short_term_memory` (TTL collection for working memory)
  - `episodic_memory` (session summaries with embeddings)
  - `long_term_memory` (user profile, milestones, facts)
  - `emotional_state` (mood tracking, relationship depth)
  - `ai_personality` (consistency layer)
- [ ] Set up MongoDB connection and basic CRUD operations
- [ ] Implement TTL (Time To Live) for short-term memory auto-cleanup

### Task 1.2: Emotional State Tracking
- [ ] Create emotional state machine:
  - `currentEmotion` (real-time sentiment)
  - `baselineEmotion` (7-day average)
  - `relationshipDepth` (casual → close → intimate)
- [ ] Implement emotion detection from user messages
- [ ] Store and update emotional states in MongoDB
- [ ] Add emotion influence on AI response tone

### Task 1.3: Memory Importance Scoring
- [ ] Implement importance scoring system:
  - High: Emotional events, milestones, personal crises
  - Medium: Preferences, regular topics, opinions
  - Low: Small talk, weather, trivial exchanges
- [ ] Add scoring logic to keyword extraction
- [ ] Filter memory retrieval by importance levels

### Task 1.4: Episodic Memory (Session Summaries)
- [ ] Create daily/session summarization system
- [ ] Store summaries with metadata:
  - Date/time
  - Emotional tone
  - Key topics discussed
  - Importance level
- [ ] Implement episodic memory retrieval for context building

## Phase 2: Semantic & Advanced Features (3-4 weeks)

### Task 2.1: Vector Embeddings Integration
- [ ] Set up text embeddings generation (text-embedding-3-small)
- [ ] Configure MongoDB Atlas Vector Search
- [ ] Store episodic summaries and facts as vectors
- [ ] Implement semantic similarity search for memory retrieval

### Task 2.2: User Profile & Milestone Database
- [ ] Design comprehensive user profile schema:
  - Personal facts (name, birthday, preferences)
  - Relationship milestones (first chat, anniversaries)
  - Important life events (achievements, losses)
- [ ] Implement milestone detection and storage
- [ ] Create profile-aware context building

### Task 2.3: AI Personality Consistency Layer
- [ ] Define AI personality traits and backstory
- [ ] Store personality facts in MongoDB
- [ ] Implement personality consistency checks
- [ ] Ensure AI maintains character across sessions

### Task 2.4: Enhanced Context Builder
- [ ] Upgrade context prompt generation to include:
  - Recent short-term memory
  - Relevant episodic memories
  - Important user facts
  - Current emotional state
  - AI personality context
- [ ] Optimize context length for token efficiency
- [ ] Test context quality and relevance

## Phase 3: Advanced Features & Optimization (1-2 months)

### Task 3.1: Memory Decay & Forgetting
- [ ] Implement realistic memory decay:
  - Recent memories stay vivid
  - Old trivial memories fade
  - Important memories persist longer
- [ ] Add memory consolidation (merge similar memories)
- [ ] Optimize storage by removing low-importance old data

### Task 3.2: Cross-Device Sync (Optional)
- [ ] Design user authentication system
- [ ] Implement encrypted memory sync
- [ ] Add privacy controls (local-only mode)
- [ ] Handle memory conflicts across devices

### Task 3.3: Advanced Emotional Modeling
- [ ] Track relationship progression over time
- [ ] Implement affection depth modeling
- [ ] Add emotional memory triggers
- [ ] Create emotion-based conversation steering

### Task 3.4: Performance Optimization
- [ ] Implement memory caching layer
- [ ] Optimize vector search queries
- [ ] Add memory compression for old data
- [ ] Monitor and optimize token usage

## Technical Requirements

### Dependencies to Add
- `mongodb` - Database connection and operations
- `@mongodb-js/vector-search` - Vector search capabilities
- `openai` - Text embeddings generation
- `sentiment` or similar - Emotion detection
- `node-schedule` - Automated summarization tasks

### Configuration
- MongoDB Atlas connection string
- OpenAI API key for embeddings
- Memory retention policies
- Importance scoring thresholds
- Emotional state parameters

### Files to Modify/Create
- `memory-v2.js` - New memory system controller
- `emotional-state.js` - Emotion tracking module
- `episodic-memory.js` - Session summarization
- `vector-search.js` - Semantic memory retrieval
- `mongodb-setup.js` - Database initialization
- Update existing `memory.js` to integrate with v2 system

## Success Metrics
- 90%+ token reduction maintained
- 85%+ context retention improved
- Emotional continuity across sessions
- Personality consistency maintained
- Memory relevance and accuracy
- Response time < 2 seconds with memory retrieval

## Migration Strategy
- Keep existing keyword system as fallback
- Gradually migrate users to v2 system
- A/B testing for quality comparison
- Rollback capability if issues arise

## Next Steps After Review
1. Review and approve task breakdown
2. Prioritize tasks based on impact
3. Set up development environment
4. Begin Phase 1 implementation
5. Regular progress reviews and adjustments