const socketIO = require('socket.io');

/**
 * Configure and initialize Socket.IO server
 * @param {import('http').Server} server - The HTTP server
 * @param {import('../database')} db - Database instance for initial data payload
 * @returns {import('socket.io').Server} The configured Socket.IO server
 */
function createSocketIO(server, db) {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  const allowedOrigins = allowedOriginsEnv.split(',').map((s) => s.trim());

  const io = socketIO(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Broadcast initial data to the newly connected client
    // We catch errors silently to avoid crashing the socket loop
    db.getCrowdDensity()
      .then((data) => socket.emit('crowd:update', data))
      .catch(() => {});
    db.getGateStatus()
      .then((gates) => socket.emit('gates:update', gates))
      .catch(() => {});
    db.getLiveMatches()
      .then((matches) => socket.emit('matches:update', matches))
      .catch(() => {});

    // Set up real-time update loop for this connection
    // In a production app, we would broadcast to all clients from a central interval,
    // but this maintains the existing logic while isolating responsibility.
    const updateInterval = setInterval(() => {
      db.getCrowdDensity()
        .then((data) => socket.emit('crowd:update', data))
        .catch(() => {});
      db.getGateStatus()
        .then((gates) => socket.emit('gates:update', gates))
        .catch(() => {});
      db.getLiveMatches()
        .then((matches) => socket.emit('matches:update', matches))
        .catch(() => {});
    }, 5000);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clearInterval(updateInterval);
    });

    socket.on('role:switch', (role) => {
      socket.emit('role:confirmed', role);
    });
  });

  return io;
}

module.exports = { createSocketIO };
