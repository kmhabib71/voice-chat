/**
 * @fileoverview Express middleware configuration
 * @author AI Girlfriend Project
 * @created 2025-01-15
 * 
 * @example
 * const setupMiddleware = require('./setupMiddleware');
 * setupMiddleware(app, config);
 */

const cors = require('cors');
const express = require('express');
const multer = require('multer');

/**
 * Configure all Express middleware
 * @param {Express} app - Express application instance
 * @param {Object} config - Application configuration
 */
function setupMiddleware(app, config) {
  // CORS configuration
  app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // File upload configuration
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  // Make upload middleware available globally
  app.locals.upload = upload;
}

module.exports = setupMiddleware;