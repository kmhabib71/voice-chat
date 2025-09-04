#!/usr/bin/env node
/**
 * Automated TypeScript Error Fixer
 * This script fixes common TypeScript errors in the VoiceChat component
 */

const fs = require('fs');
const path = require('path');

// File paths
const VOICECHAT_PATH = './src/components/VoiceChat.tsx';
const LAYOUT_PATH = './src/app/layout.tsx';
const PAGE_PATH = './src/app/page.tsx';

// Common TypeScript fixes
const fixes = [
  // Fix callback parameter types
  {
    pattern: /\.then\((\w+) =>/g,
    replacement: '.then(($1: any) =>'
  },
  {
    pattern: /\.catch\((\w+) =>/g,
    replacement: '.catch(($1: unknown) =>'
  },
  {
    pattern: /\.forEach\((\w+) =>/g,
    replacement: '.forEach(($1: any) =>'
  },
  {
    pattern: /\.map\((\w+) =>/g,
    replacement: '.map(($1: any) =>'
  },
  {
    pattern: /\.filter\((\w+) =>/g,
    replacement: '.filter(($1: any) =>'
  },
  
  // Fix function parameters
  {
    pattern: /const (\w+) = \(([^:)]+)\) =>/g,
    replacement: 'const $1 = ($2: any) =>'
  },
  {
    pattern: /function (\w+)\(([^:)]+)\)/g,
    replacement: 'function $1($2: any)'
  },
  
  // Fix event handlers
  {
    pattern: /on(\w+) = ([^=>\s]+) =>/g,
    replacement: 'on$1 = ($2: any) =>'
  },
  
  // Fix setState callbacks
  {
    pattern: /setState\w*\((\w+) =>/g,
    replacement: 'setState($1: any) =>'
  },
  
  // Fix error handling
  {
    pattern: /} catch \((\w+)\) {/g,
    replacement: '} catch ($1: unknown) {'
  },
  {
    pattern: /(\w+)\.message/g,
    replacement: '($1 instanceof Error ? $1.message : String($1))'
  }
];

// Function to apply fixes to a file
function applyFixes(filePath) {
  console.log(`🔧 Fixing TypeScript errors in ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  fixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      changeCount += matches.length;
    }
  });
  
  // Write back the fixed content
  fs.writeFileSync(filePath, content);
  console.log(`✅ Applied ${changeCount} fixes to ${filePath}`);
  return changeCount > 0;
}

// Function to run TypeScript check
function runTypeScriptCheck() {
  const { execSync } = require('child_process');
  try {
    console.log('🔍 Running TypeScript check...');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ No TypeScript errors found!');
    return 0;
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : '';
    const errorLines = output.split('\n').filter(line => line.includes('error'));
    console.log(`❌ Found ${errorLines.length} TypeScript errors`);
    return errorLines.length;
  }
}

// Main execution
function main() {
  console.log('🚀 Starting automated TypeScript error fixing...\n');
  
  const initialErrors = runTypeScriptCheck();
  console.log(`Initial error count: ${initialErrors}\n`);
  
  if (initialErrors === 0) {
    console.log('🎉 No errors to fix!');
    return;
  }
  
  // Apply fixes to all files
  const files = [VOICECHAT_PATH, LAYOUT_PATH, PAGE_PATH];
  let totalChanges = 0;
  
  files.forEach(file => {
    if (applyFixes(file)) {
      totalChanges++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`Files modified: ${totalChanges}`);
  
  // Check results
  const finalErrors = runTypeScriptCheck();
  const errorReduction = initialErrors - finalErrors;
  
  console.log(`\n🎯 Results:`);
  console.log(`Initial errors: ${initialErrors}`);
  console.log(`Final errors: ${finalErrors}`);
  console.log(`Errors fixed: ${errorReduction}`);
  console.log(`Reduction: ${Math.round((errorReduction / initialErrors) * 100)}%`);
  
  if (finalErrors === 0) {
    console.log('\n🎉 All TypeScript errors fixed!');
  } else {
    console.log(`\n⚠️  ${finalErrors} errors remain. Manual fixes may be needed.`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { applyFixes, runTypeScriptCheck };