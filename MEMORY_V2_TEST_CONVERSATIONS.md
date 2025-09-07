# Memory v2 Context-Aware Testing Guide

## Test Setup Requirements

1. **Environment Variables** (ensure these are set in `.env`):
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ai_girlfriend_memory
MEMORY_V2_ENABLED=true
EMOTIONAL_INTELLIGENCE_ENABLED=true
```

2. **Start Server** with debugging enabled:
```bash
node server.js
```

3. **Watch for Debug Output** - Look for these key debug sections:
   - 🎯 CHAT CONTROLLER phases
   - 🧠 MEMORY RETRIEVAL
   - 🔍 KEYWORD EXTRACTION  
   - 🎯 MEMORY MANAGER phases
   - 💾 STORAGE EXECUTION

---

## Test Conversation #1: Context-Aware Personal vs Third-Party Information

### Scenario: Testing "I am X" vs "My friend told me he is X"

**Test Messages (send one at a time):**

1. **User**: "Hi there, how are you?"
   - **Expected**: General greeting response, stored in short-term memory
   - **Debug Watch**: Basic conversation flow, no special context routing

2. **User**: "I am straight"
   - **Expected**: HIGH IMPORTANCE (personal identity), stored as LONG-TERM fact
   - **Debug Watch**: 
     - Context Analysis: `about_user: true, belongs_to_user: true`
     - Importance Score: High (0.7-0.9)
     - Memory Type: `long_term` (user facts)
     - Storage: User fact in `preferences` category

3. **User**: "My friend told me he is gay"
   - **Expected**: MEDIUM-LOW importance (third-party info), stored as EPISODIC memory
   - **Debug Watch**:
     - Context Analysis: `about_user: false, about_others: true`
     - Routing Decision: Third-party information → episodic
     - Memory Type: `episodic` (story about others)

4. **User**: "What do you remember about my sexuality?"
   - **Expected**: AI recalls "I am straight" from user facts
   - **Debug Watch**: Memory retrieval shows user's personal preference

5. **User**: "What do you remember about my friend?"
   - **Expected**: AI recalls the friend's story from episodic memory
   - **Debug Watch**: Memory retrieval shows episodic story, not user data

---

## Test Conversation #2: Hypothetical vs Factual Information

### Scenario: Testing temporal context and certainty analysis

**Test Messages:**

1. **User**: "If I were rich, I would travel the world"
   - **Expected**: LOW importance (hypothetical), short-term or episodic
   - **Debug Watch**:
     - Temporal Context: `timeframe: hypothetical, certainty: speculative`
     - Reduced importance score due to hypothetical nature
     - Memory Type: Likely `short_term` or `episodic` with low importance

2. **User**: "I am planning to travel to Japan next month"
   - **Expected**: HIGH importance (factual future plans), long-term storage
   - **Debug Watch**:
     - Temporal Context: `timeframe: future, certainty: factual`
     - High importance score for concrete plans
     - Memory Type: `long_term` as user fact

3. **User**: "I traveled to France last year"
   - **Expected**: HIGH importance (factual past experience), long-term/episodic
   - **Debug Watch**:
     - Temporal Context: `timeframe: past, certainty: factual`
     - High importance for personal experience
     - Storage as user fact or episodic memory

---

## Test Conversation #3: Emotional vs Factual Information

### Scenario: Testing importance scoring and emotional context

**Test Messages:**

1. **User**: "I love pizza"
   - **Expected**: MEDIUM importance (preference), long-term storage
   - **Debug Watch**:
     - Category: `preferences`
     - Emotion: `love` or `joy`
     - Memory Type: `long_term` user fact

2. **User**: "My mother passed away last month"
   - **Expected**: VERY HIGH importance (major life event), episodic memory
   - **Debug Watch**:
     - Importance Score: Very high (0.8-1.0)
     - Emotional milestone detection
     - Memory Type: `episodic` (significant life event)

3. **User**: "It's a nice day today"
   - **Expected**: LOW importance (casual observation), short-term
   - **Debug Watch**:
     - Low importance score
     - Casual conversation marker
     - Memory Type: `short_term`

---

## Test Conversation #4: Memory Persistence and Retrieval

### Scenario: Testing cross-session memory persistence

**Test Messages (Session 1):**

1. **User**: "My name is Alex and I'm 25 years old"
2. **User**: "I work as a software engineer at Google"
3. **User**: "I have a dog named Max"

**Stop the server, restart, then continue (Session 2):**

4. **User**: "Do you remember my name?"
   - **Expected**: AI recalls "Alex" from persistent storage
   
5. **User**: "What do you know about my job?"
   - **Expected**: AI recalls Google software engineer info

6. **User**: "Tell me about my pet"
   - **Expected**: AI recalls dog named Max

---

## Test Conversation #5: Complex Context Scenarios

### Scenario: Mixed personal and third-party information

**Test Messages:**

1. **User**: "I am vegetarian, but my friend John eats meat"
   - **Expected**: Two separate pieces of information processed differently
   - **Debug Watch**:
     - User's vegetarian preference: High importance, long-term
     - Friend's eating habit: Lower importance, episodic

2. **User**: "If I were not vegetarian, I might try sushi, but my sister loves sushi"
   - **Expected**: Complex parsing of hypothetical vs factual information
   - **Debug Watch**:
     - Hypothetical about user: Low importance
     - Sister's preference: Medium importance, episodic

---

## Debug Output Interpretation Guide

### Key Debug Patterns to Look For:

**🎯 Context Analysis Success:**
```
🧠 Context: self about USER  // User talking about themselves
🧠 Context: friend about OTHERS  // User talking about others
```

**⚖️ Importance Scoring:**
```
📊 Importance Score: 0.8 (Level: high)  // Should store in long-term/episodic
📊 Importance Score: 0.3 (Level: low)   // Should store in short-term
```

**🎯 Smart Routing:**
```
✅ Context-aware routing: User personal information → long_term
✅ Context-aware routing: Third-party information → episodic
⚖️ Importance-based routing: score 0.4 → short_term
```

**💾 Storage Confirmation:**
```
📝 Storing in LONG-TERM memory...     // User facts
🎭 Storing in EPISODIC memory...      // Stories and events  
📝 Storing in SHORT-TERM memory...    // Recent conversations
```

### Expected Database Collections After Testing:

1. **short_term_memory**: Recent casual conversations
2. **user_facts**: Personal preferences, identity, concrete plans
3. **episodic_memory**: Stories about others, significant life events

---

## Troubleshooting Common Issues

### Issue: No debug output
- **Solution**: Ensure `MEMORY_V2_ENABLED=true` in `.env`
- **Check**: Server logs show "Memory v2 system: ✅ Active"

### Issue: All messages go to short-term
- **Solution**: Check OpenAI API key is working for keyword extraction
- **Check**: Debug logs show successful keyword extraction

### Issue: Context analysis not working
- **Solution**: Verify ContextAnalyzer is properly integrated
- **Check**: Debug logs show "Running enhanced context analysis"

### Issue: Database not storing data
- **Solution**: Check MongoDB connection and database initialization
- **Check**: Server logs show "Database initialized successfully"

---

## Expected Results Summary

After running these test conversations, you should see:

1. **Intelligent Context Routing**: Personal information goes to user facts, third-party to episodic
2. **Importance-Based Storage**: High-importance events in episodic/long-term, casual chat in short-term
3. **Temporal Awareness**: Hypothetical statements get lower importance than factual ones
4. **Cross-Session Persistence**: Information stored in previous sessions is retrievable
5. **Debug Visibility**: Complete flow from input → analysis → routing → storage clearly visible

The system should demonstrate clear distinction between "I am gay" (stored as user fact) vs "My friend told me he is gay" (stored as episodic story), solving the original context awareness problem.