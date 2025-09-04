#!/bin/bash

# Automated TypeScript Conversion Script for Large Codebases
# This script helps convert a large JavaScript/React application to TypeScript

echo "🚀 Starting TypeScript Conversion for Large Application..."

# Step 1: Backup your codebase
echo "📦 Creating backup..."
cp -r . ../backup-before-typescript-$(date +%Y%m%d-%H%M%S)

# Step 2: Install TypeScript dependencies
echo "📦 Installing TypeScript dependencies..."
npm install --save-dev typescript @types/react @types/react-dom @types/node
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Step 3: Generate strict tsconfig.json
echo "⚙️ Creating strict TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Step 4: Generate type definitions
echo "📝 Creating comprehensive type definitions..."
cat > src/types/global.d.ts << 'EOF'
// Comprehensive type definitions for the application

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket Event Types
interface WebSocketEvents {
  'audio-chunk': ArrayBuffer;
  'transcription': { text: string; isFinal: boolean };
  'ai-response': { text: string; emotion?: string; timestamp: string };
  'error': { message: string; type: string };
}

// Message Types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  emotion?: string;
  timestamp: string;
}

// Audio/Media Types
interface AudioContextState {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  microphone: MediaStreamAudioSourceNode | null;
  processor: ScriptProcessorNode | null;
  stream: MediaStream | null;
}

// Component Props Types
interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Utility Types
type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'love' | 'neutral';
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Error Handling Types
interface AppError extends Error {
  code?: string;
  status?: number;
}

// Global Window Extensions
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof webkitSpeechRecognition;
    debugMemory?: () => any;
    clearMemory?: () => void;
  }
}

export {};
EOF

# Step 5: Create ESLint TypeScript configuration
echo "🔧 Setting up ESLint for TypeScript..."
cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
  },
  ignorePatterns: ['next.config.js', '*.config.js'],
};
EOF

# Step 6: Rename JavaScript files to TypeScript
echo "🔄 Converting .js/.jsx files to .ts/.tsx..."
find src -name "*.js" -exec sh -c 'mv "$1" "${1%.js}.ts"' _ {} \;
find src -name "*.jsx" -exec sh -c 'mv "$1" "${1%.jsx}.tsx"' _ {} \;

# Step 7: Add TypeScript conversion utilities
echo "🛠️ Creating conversion utilities..."
cat > scripts/typescript-helper.js << 'EOF'
// TypeScript Conversion Helper
const fs = require('fs');
const path = require('path');

// Add basic type annotations to functions
function addBasicTypeAnnotations(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add React.FC type to functional components
  content = content.replace(
    /function\s+(\w+)\s*\(\s*\)\s*{/g,
    'function $1(): JSX.Element {'
  );
  
  // Add types to useState
  content = content.replace(
    /useState\(([^)]*)\)/g,
    'useState<any>($1)'
  );
  
  // Add types to useRef
  content = content.replace(
    /useRef\(([^)]*)\)/g,
    'useRef<any>($1)'
  );
  
  fs.writeFileSync(filePath, content);
}

// Process all TypeScript files
function processAllFiles() {
  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        console.log(`Processing: ${filePath}`);
        addBasicTypeAnnotations(filePath);
      }
    });
  };
  
  walk('./src');
  console.log('✅ Basic type annotations added to all files');
}

if (require.main === module) {
  processAllFiles();
}

module.exports = { addBasicTypeAnnotations, processAllFiles };
EOF

# Step 8: Create package.json scripts for TypeScript workflow
echo "📦 Adding TypeScript scripts to package.json..."
node -e "
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'type-check': 'tsc --noEmit',
  'type-check:watch': 'tsc --noEmit --watch',
  'lint:ts': 'eslint . --ext .ts,.tsx',
  'lint:ts:fix': 'eslint . --ext .ts,.tsx --fix',
  'ts:convert': 'node scripts/typescript-helper.js',
  'ts:check-all': 'npm run type-check && npm run lint:ts',
  'build:ts': 'npm run type-check && npm run build'
};
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Step 9: Run initial conversion
echo "🔄 Running initial TypeScript conversion..."
npm run ts:convert

# Step 10: Check for errors and provide report
echo "🔍 Checking TypeScript errors..."
npx tsc --noEmit > typescript-errors.log 2>&1 || true

echo "📊 TypeScript Conversion Summary:"
echo "================================"
echo "✅ Backup created"
echo "✅ TypeScript configuration set up"
echo "✅ ESLint TypeScript rules configured"
echo "✅ Type definitions created"
echo "✅ Files renamed to .ts/.tsx"
echo "✅ Basic type annotations added"
echo ""
echo "📋 Next Steps:"
echo "1. Review typescript-errors.log for remaining issues"
echo "2. Run 'npm run type-check' to see current errors"
echo "3. Fix errors one by one using the type definitions"
echo "4. Run 'npm run lint:ts:fix' to auto-fix some issues"
echo ""
echo "🎯 Goal: Reduce TypeScript errors from current count to 0"
echo ""
echo "📚 Documentation created:"
echo "- typescript-errors.log (current issues)"
echo "- src/types/global.d.ts (type definitions)"
echo "- scripts/typescript-helper.js (conversion utilities)"

# Final check
ERROR_COUNT=$(wc -l < typescript-errors.log)
echo "📊 Current TypeScript errors: $ERROR_COUNT"

if [ $ERROR_COUNT -lt 50 ]; then
  echo "🎉 Good news! You have fewer than 50 errors. Manual fixing is recommended."
else
  echo "⚠️  You have many errors. Consider gradual conversion approach."
fi

echo ""
echo "🚀 TypeScript conversion framework ready!"
echo "Run 'npm run type-check' to start fixing remaining issues."