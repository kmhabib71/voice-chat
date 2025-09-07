/**
 * @fileoverview Main server entry point - Pure Orchestration
 * @author AI Girlfriend Project  
 * @created 2024-01-15
 * 
 * Clean Architecture: Server.js only handles orchestration
 * - All business logic delegated to /lib modules
 * - Middleware setup in /lib/infrastructure/middleware
 * - Routes defined in /lib/infrastructure/routes
 * - Socket.io handlers in /lib/infrastructure/websocket
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Load configuration and validate environment
const config = require('./lib/infrastructure/config/environment');
const { debugLog } = require('./lib/utils/helpers');

// Import infrastructure modules
const setupMiddleware = require('./lib/infrastructure/middleware/setupMiddleware');
const apiRoutes = require('./lib/infrastructure/routes/apiRoutes');
const { setupSocketHandlers } = require('./lib/infrastructure/websocket/socketHandler');
const { initializeDatabase } = require('./lib/infrastructure/database');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: config.server.corsOrigin,
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize database if Memory v2 is enabled
async function initializeServer() {
  if (config.features.memoryV2Enabled) {
    try {
      debugLog('database', '🗃️  Initializing Memory v2 database system...');
      await initializeDatabase();
      debugLog('database', '✅ Memory v2 database initialized successfully');
    } catch (error) {
      debugLog('error', '❌ Failed to initialize Memory v2 database:', error.message);
      console.error('Database initialization failed:', error);
      process.exit(1);
    }
  } else {
    debugLog('database', '⚠️  Memory v2 is disabled - set MEMORY_V2_ENABLED=true to enable');
  }

  // Setup middleware
  setupMiddleware(app, config);

  // Setup API routes
  app.use('/api', apiRoutes);

  // Setup Socket.io handlers
  setupSocketHandlers(io);
}

// Initialize and start server
initializeServer().then(() => {
  server.listen(config.server.port, () => {
    debugLog('server', '🚀 Emotional Voice Assistant Server starting');
    debugLog('server', `🎤 HTTP Server running on http://localhost:${config.server.port}`);
    debugLog('server', `🌐 Socket.io server running on http://localhost:${config.server.port}`);
    debugLog('server', `🔊 ElevenLabs integration: ${config.elevenlabs.apiKey ? '✅ Connected' : '❌ Missing API key'}`);
    debugLog('server', `🤖 OpenAI integration: ${config.openai.apiKey ? '✅ Connected' : '❌ Missing API key'}`);
    debugLog('server', `🦙 Llama integration: ${config.llama.apiKey ? '✅ Connected' : '❌ Not configured'}`);
    debugLog('server', `🗃️  Memory v2 system: ${config.features.memoryV2Enabled ? '✅ Active' : '❌ Disabled'}`);
    debugLog('server', `🔄 CORS origin: ${config.server.corsOrigin}`);
    debugLog('server', `📁 Architecture: Clean /lib organization enabled`);
    debugLog('server', '✅ Server ready to accept connections');
  });
}).catch(error => {
  console.error('❌ Failed to initialize server:', error);
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  debugLog('server', '🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    debugLog('server', '✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  debugLog('server', '🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    debugLog('server', '✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;