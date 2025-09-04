// Simple Socket.io client test
const { io } = require('socket.io-client');

console.log('🔌 Testing Socket.io connection...');

const socket = io('http://localhost:3002', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to server successfully!');
  console.log(`📡 Socket ID: ${socket.id}`);
  console.log(`🚀 Transport: ${socket.io.engine.transport.name}`);
  
  // Test sending a message
  console.log('📤 Sending test voice message...');
  socket.emit('voice_message', {
    text: 'Hello, this is a test message from Socket.io client!',
    emotion: 'neutral',
    timestamp: Date.now(),
    conversationMemory: null
  });
});

socket.on('ai_response', (data) => {
  console.log('📨 Received AI response:');
  console.log(`   Text: ${data.text}`);
  console.log(`   Emotion: ${data.emotion}`);
  console.log(`   Timestamp: ${data.timestamp}`);
});

socket.on('audio_response', (data) => {
  console.log('🔊 Received audio response:');
  console.log(`   Audio length: ${data.audio?.length || 0} characters`);
  console.log(`   Emotion: ${data.emotion}`);
});

socket.on('error', (data) => {
  console.log('❌ Server error:', data.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

// Close connection after 10 seconds
setTimeout(() => {
  console.log('⏰ Test completed, closing connection...');
  socket.disconnect();
  process.exit(0);
}, 10000);