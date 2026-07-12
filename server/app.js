const express = require('express');
const path = require('path');
const { getHelmetConfig, getCorsConfig, generalLimiter } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const { createApiRouter } = require('./routes/api');

/**
 * Creates and configures the Express application
 * @param {import('./database')} db - Database instance
 * @returns {import('express').Application} Configured Express app
 */
function createApp(db) {
  const app = express();

  // Apply security middleware
  app.use(getHelmetConfig());
  app.use(getCorsConfig());

  // Parse JSON payloads (with size limit)
  app.use(express.json({ limit: '10kb' }));

  // Serve static frontend files
  app.use(express.static(path.join(__dirname, '../public')));

  // Apply global rate limiter to API routes
  app.use('/api/', generalLimiter);

  // Mount API routes
  const apiRouter = createApiRouter(db);
  app.use('/api', apiRouter);

  // Apply global error handler
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
