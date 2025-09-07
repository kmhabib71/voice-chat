/**
 * @fileoverview Socket.io event handlers and real-time communication
 * @author AI Girlfriend Project
 * @created 2025-01-15
 * 
 * @example
 * const { setupSocketHandlers } = require('./socketHandler');
 * setupSocketHandlers(io);
 */

const { debugLog } = require('../../utils/helpers');
const { generateSessionId } = require('../../utils/helpers');

// Import controllers
const chatController = require('../../features/chat/ChatController');
const voiceController = require('../../features/voice/VoiceController');

/**
 * Setup all Socket.io event handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    debugLog('socketio', '🔌 New Socket.io connection established', { socketId: socket.id });
    
    // Generate session ID for this connection
    const sessionId = generateSessionId();
    socket.sessionId = sessionId;
    debugLog('socketio', 'Assigned session ID', { sessionId, socketId: socket.id });
    
    // Handle voice messages
    socket.on('voice_message', async (data) => {
      await handleVoiceMessage(socket, data);
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      debugLog('socketio', '🔌 Socket.io connection closed', { 
        reason,
        socketId: socket.id,
        sessionId: socket.sessionId
      });
    });
    
    // Handle errors
    socket.on('error', (error) => {
      debugLog('error', '❌ Socket.io connection error', {
        error: error.message,
        socketId: socket.id,
        sessionId: socket.sessionId
      });
    });
  });
}

/**
 * Handle voice message processing
 * @param {SocketIO.Socket} socket - Socket connection
 * @param {Object} data - Voice message data
 */
async function handleVoiceMessage(socket, data) {
  const startTime = Date.now();
  
  try {
    debugLog('socketio', '📨 Received voice message', { 
      type: data.type, 
      textLength: data.text?.length,
      socketId: socket.id
    });
    
    debugLog('processing', '🎭 Processing voice message', { 
      sessionId: socket.sessionId, 
      text: data.text.substring(0, 50) + '...',
      userId: data.userId || 'default',
      socketId: socket.id
    });
    
    // Memory v2: Use userId instead of conversationMemory
    const userId = data.userId || 'default';
    
    // Process message through chat controller with Memory v2
    const chatResponse = await chatController.processMessage(data.text, socket.sessionId, userId);
    
    // Send AI response immediately
    const responseData = {
      text: chatResponse.response,
      emotion: chatResponse.emotion,
      timestamp: new Date().toISOString(),
      processing: false
    };
    
    socket.emit('ai_response', responseData);
    
    const responseTime = Date.now() - startTime;
    debugLog('socketio', '📤 Sent AI response to client', { 
      responseTime: `${responseTime}ms`,
      emotion: chatResponse.emotion,
      textLength: chatResponse.response.length,
      socketId: socket.id
    });
    
    // Generate speech audio in parallel (non-blocking)
    generateAudioResponse(socket, chatResponse)
      .catch(error => {
        debugLog('error', '❌ Error in audio generation', {
          message: error.message,
          socketId: socket.id
        });
      });
      
  } catch (error) {
    debugLog('error', '💥 Socket.io message error', { 
      error: error.message,
      socketId: socket.id
    });
    socket.emit('error', {
      message: 'Server error processing message'
    });
  }
}

/**
 * Generate and send audio response (parallel processing)
 * @param {SocketIO.Socket} socket - Socket connection
 * @param {Object} chatResponse - Chat response data
 */
async function generateAudioResponse(socket, chatResponse) {
  try {
    debugLog('audio', '🔊 Generating speech audio (parallel)', { 
      emotion: chatResponse.emotion,
      socketId: socket.id,
      textLength: chatResponse.response.length,
      text: chatResponse.response.substring(0, 100) + '...'
    });
    
    const audioStartTime = Date.now();
    const audioBuffer = await voiceController.generateSpeech(chatResponse.response, chatResponse.emotion);
    const audioGenerationTime = Date.now() - audioStartTime;
    
    debugLog('audio', '✅ Audio buffer generated successfully', { 
      audioSize: audioBuffer.length, 
      emotion: chatResponse.emotion,
      generationTime: `${audioGenerationTime}ms`,
      socketId: socket.id
    });
    
    const audioResponse = {
      audio: audioBuffer.toString('base64'),
      emotion: chatResponse.emotion
    };
    
    debugLog('audio', '📤 Sending audio response to client', {
      base64Length: audioResponse.audio.length,
      emotion: chatResponse.emotion,
      socketId: socket.id
    });
    
    socket.emit('audio_response', audioResponse);
    
    debugLog('audio', '✅ Audio response sent', { 
      audioSize: audioBuffer.length, 
      emotion: chatResponse.emotion,
      generationTime: `${audioGenerationTime}ms`,
      socketId: socket.id
    });
    
  } catch (audioError) {
    debugLog('error', '❌ Error generating audio', {
      message: audioError.message,
      stack: audioError.stack,
      socketId: socket.id,
      emotion: chatResponse.emotion,
      textLength: chatResponse.response.length
    });
    // Don't send error to client - just skip audio for better UX
    debugLog('audio', '⚠️ Skipping audio due to API issue - text response already sent');
  }
}

module.exports = {
  setupSocketHandlers
};