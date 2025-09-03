# AI Girlfriend Project - Claude Code Rules

## Project Architecture Enforcement

### Mandatory Data Flow Rules
- **ALWAYS** follow: UI → Features → Core → API → Infrastructure
- **NEVER** bypass layers: Infrastructure → Features, API → UI, Features → Features
- **ALWAYS** use proper layer interfaces when moving between layers

### File Structure Rules

#### /lib Organization
```
/lib
├── /api           # External service integrations ONLY
├── /core          # Core AI and memory systems ONLY  
├── /features      # Business feature logic ONLY
├── /infrastructure # Database, auth, config ONLY
└── /utils         # Shared utilities ONLY
```

#### Function Placement Rules
- **Memory functions** → `/lib/core/memory/`
- **AI intelligence** → `/lib/core/intelligence/`
- **API integrations** → `/lib/api/`
- **Business features** → `/lib/features/`
- **Database operations** → `/lib/infrastructure/database/`

### Naming Conventions (MANDATORY)
- **Functions**: `verb + object` (e.g., `createUserFact()`, `retrieveRelevantMemories()`)
- **Classes**: `PascalCase` with clear purpose (e.g., `MemoryManager`, `PersonalityAnalyzer`)
- **Files**: `PascalCase.js` for classes, `camelCase.js` for utilities
- **Folders**: `lowercase` or `kebab-case`

### Development Rules

#### Before Any Code Changes
1. **ALWAYS** determine which layer the change belongs to
2. **ALWAYS** check if proper files exist in correct folders
3. **ALWAYS** use existing patterns and conventions
4. **NEVER** create files outside the established structure

#### Memory System Development
- All memory operations go through `MemoryManager` class
- Use unified memory interface from `/lib/core/memory/index.js`
- Follow MongoDB collection schemas from TASKS.md
- Maintain separation: ShortTermMemory, LongTermMemory, EpisodicMemory

#### Emotional Intelligence Development  
- All personality analysis in `/lib/core/intelligence/`
- Use PersonalityAnalyzer for user profiling
- Route through AdaptiveResponseGenerator for personalized responses
- Keep emotional state tracking separate from memory storage

#### API Integration Rules
- External services ONLY in `/lib/api/`
- Each service gets its own file (openai.js, llama.js, elevenlabs.js, mongodb.js)
- Use connection pooling and error handling
- Never expose API keys in logs or responses

#### Feature Development Rules
- Business logic in `/lib/features/` with dedicated folders
- Features communicate through Core layer only
- Keep features isolated - no direct feature-to-feature calls
- Use Controllers for business logic, Services for helpers

### Error Handling Requirements
- **ALWAYS** implement proper error handling with fallbacks
- **NEVER** let database errors crash the application
- **ALWAYS** log errors but never expose internal details to users
- Use graceful degradation (fallback to localStorage if MongoDB fails)

### Performance Requirements
- Database queries must average <100ms
- Memory context building must stay under 3K tokens
- Use caching for frequently accessed data
- Implement connection pooling for all external services

### Security Rules
- **NEVER** commit API keys or secrets
- **ALWAYS** validate user inputs
- Use environment variables for configuration
- Implement rate limiting for API calls
- Never log sensitive user data

### Testing Requirements
- Write tests for all Core layer components
- Mock external API calls in tests
- Test error handling and fallback scenarios
- Maintain test coverage >80% for critical paths

## Current System Integration

### Existing Files to Respect
- Keep current `server.js` as main entry point
- Preserve existing WebSocket functionality  
- Maintain backward compatibility during migration
- Use feature flags for gradual rollout

### Migration Strategy
- Move functions to appropriate `/lib` folders gradually
- Create index files for clean imports
- Update imports throughout codebase systematically
- Test each migration step thoroughly

## Implementation Priority
1. **First**: Create `/lib` folder structure
2. **Second**: Move core functions to proper locations
3. **Third**: Update imports and dependencies
4. **Fourth**: Implement new Memory v2 and Emotional Intelligence features
5. **Fifth**: Optimize and clean up legacy code

## Quality Gates
- All code must follow established architecture
- No file should exceed 300 lines (split if needed)
- Each function should have single responsibility
- All external dependencies must be properly abstracted
- Performance requirements must be met before deployment

## Forbidden Patterns
- ❌ Direct database calls from Feature layer
- ❌ Business logic in API layer
- ❌ UI components calling Core layer directly
- ❌ Mixing memory types in single files
- ❌ Hard-coded API endpoints or credentials
- ❌ Circular dependencies between layers
- ❌ Global variables for state management
- ❌ Synchronous database operations

## Encouraged Patterns  
- ✅ Dependency injection for testability
- ✅ Factory patterns for complex object creation
- ✅ Observer pattern for event handling
- ✅ Strategy pattern for AI model selection
- ✅ Chain of responsibility for message processing
- ✅ Command pattern for user actions
- ✅ Repository pattern for data access

This architecture ensures the AI girlfriend system remains maintainable, scalable, and prevents the "messy codebase" problem during Memory v2 + Emotional Intelligence development.