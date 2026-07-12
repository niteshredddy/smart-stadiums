require('dotenv').config();
const http = require('http');
const Database = require('./database');
const { createApp } = require('./app');
const { createSocketIO } = require('./sockets');

/**
 * Initializes and starts the StadiumAI Hub server
 * @returns {Promise<{app: import('express').Application, server: import('http').Server, io: import('socket.io').Server, db: Database}>}
 */
async function startServer() {
  try {
    const db = await new Database();
    const app = createApp(db);
    const server = http.createServer(app);
    const io = createSocketIO(server, db);

    const PORT = process.env.PORT || 3000;

    // Start server only if we are not in a test environment
    if (process.env.NODE_ENV !== 'test') {
      server.listen(PORT, () => {
        console.log(`🏟️ StadiumAI Hub server running on port ${PORT}`);
        console.log('📡 WebSocket server ready');
      });
    }

    return { app, server, io, db };
  } catch (err) {
    console.error('Failed to initialize server components:', err);
    throw err;
  }
}

// Auto-start when run directly
if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

// Export dependencies for testing
module.exports = { createApp, createSocketIO, startServer };
