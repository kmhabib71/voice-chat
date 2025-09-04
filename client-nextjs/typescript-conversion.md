# TypeScript Conversion Guide

## Systematic Approach to Convert Your Voice Chat Application

Your application is already in `.tsx/.ts` format, but needs proper type annotations. Here's the complete conversion strategy:

### 1. ✅ COMPLETED: Basic Setup
- [x] Updated tsconfig.json with strict settings
- [x] Added comprehensive type definitions in global.d.ts
- [x] Fixed React imports and basic component types

### 2. 🔄 IN PROGRESS: VoiceChat.tsx Conversion
Current strategy: Fix types section by section

**Key Type Patterns:**
```typescript
// Event handlers
const handleSomething = (event: React.MouseEvent<HTMLButtonElement>): void => {}

// Async functions
const someFunction = async (param: string): Promise<void> => {}

// Error handling
catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
}

// Array operations
setMessages((prev: Message[]) => [...prev, newMessage]);

// Object operations with proper typing
const data: SomeInterface = { key: value };
```

### 3. TODO: Complete Conversion Steps

#### A. Fix Function Parameters & Return Types
- Add types to all function parameters
- Add return types to all functions
- Fix callback parameters in event handlers

#### B. Fix Error Handling
- Replace `catch (error)` with `catch (error: unknown)`
- Add proper type guards for error objects

#### C. Fix State Updates
- Type all setState callback parameters
- Ensure proper typing for state update functions

#### D. Fix API Calls & Responses
- Type all API request/response objects
- Add proper error handling for axios calls

#### E. Fix Audio/Media Types
- Type MediaRecorder events
- Type WebRTC/Audio API interactions
- Add proper nullable checks

### 4. Automated Conversion Commands

You can run these TypeScript fixes in sequence:

```bash
# 1. Check current errors
npx tsc --noEmit

# 2. Run ESLint with TypeScript rules
npx eslint . --ext .ts,.tsx --fix

# 3. Use TypeScript compiler for detailed error reporting
npx tsc --noEmit --pretty
```

### 5. Production-Ready Configuration

After conversion, update your build configuration:

```json
// package.json scripts
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "build": "npm run type-check && next build"
  }
}
```

### 6. Best Practices for Large Applications

**For large codebases like yours:**

1. **Gradual Conversion**: Convert one component/utility at a time
2. **Type First**: Define interfaces before implementing
3. **Strict Checking**: Keep strict mode enabled for new code
4. **Documentation**: Use JSDoc with TypeScript for better IDE support
5. **Testing**: Add unit tests with proper typing

### 7. File-by-File Conversion Plan

1. ✅ **global.d.ts** - Type definitions
2. 🔄 **VoiceChat.tsx** - Main component (large file, needs systematic approach)
3. ⏳ **conversationMemory.ts** - Utility class
4. ⏳ **layout.tsx** - Layout component
5. ⏳ **page.tsx** - Page component

### 8. When You Have Many Files

For larger applications with 50+ files:

1. **Use TypeScript Migration Tool**:
   ```bash
   npx typescript-migration-helper
   ```

2. **Automated Type Generation**:
   ```bash
   # Generate types from API responses
   npx openapi-typescript ./api-schema.json -o ./types/api.ts
   ```

3. **Incremental Adoption**:
   - Keep `allowJs: true` in tsconfig.json
   - Convert high-impact files first (utilities, shared components)
   - Use `// @ts-ignore` sparingly for legacy code

4. **Team Coordination**:
   - Establish TypeScript coding standards
   - Use pre-commit hooks for type checking
   - Regular TypeScript training sessions

### Current Status: 
- **Files converted**: 1/5 (partial)
- **TypeScript errors**: ~100+ → targeting 0
- **Next step**: Complete VoiceChat.tsx conversion

Would you like me to continue with the systematic conversion of your files?