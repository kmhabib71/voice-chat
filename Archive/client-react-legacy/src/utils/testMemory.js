// Test script for conversation memory system
// This can be run in browser console to test the memory functionality

import ConversationMemory from './conversationMemory';

// Test function that can be called from browser console
window.testConversationMemory = async () => {
  console.log('🧠 Testing Conversation Memory System...');
  
  try {
    // Initialize memory
    const memory = new ConversationMemory();
    console.log('✅ Memory initialized:', memory.getMemoryStats());
    
    // Test message processing
    console.log('📝 Processing test messages...');
    
    await memory.processMessage("Hello, I need help with React authentication", true, 'neutral');
    console.log('✅ Message 1 processed');
    
    await memory.processMessage("I'm building a web application for my startup", true, 'excited');
    console.log('✅ Message 2 processed');
    
    await memory.processMessage("I can help you implement secure authentication in React. What specific issues are you facing?", false, 'helpful');
    console.log('✅ Message 3 processed');
    
    // Test context building
    console.log('🔍 Building context for new query...');
    const context = memory.buildContextForAI("How do I secure my login form?");
    console.log('✅ Context built:', context);
    
    // Show memory stats
    const stats = memory.getMemoryStats();
    console.log('📊 Final memory stats:', stats);
    
    // Test memory export
    const exported = memory.exportMemory();
    console.log('💾 Exported memory:', exported);
    
    console.log('🎉 All tests passed!');
    return {
      success: true,
      stats,
      context,
      exported
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Also make it available as a module export
export const testConversationMemory = window.testConversationMemory;