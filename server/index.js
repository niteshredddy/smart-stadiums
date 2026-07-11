const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const Database = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
const db = new Database();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Crowd data endpoints
app.get('/api/crowd/density', (req, res) => {
  db.getCrowdDensity((err, data) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(data);
    }
  });
});

app.get('/api/crowd/stats', (req, res) => {
  db.getCrowdStats((err, stats) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(stats);
    }
  });
});

// Gate data endpoints
app.get('/api/gates/status', (req, res) => {
  db.getGateStatus((err, gates) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(gates);
    }
  });
});

// Parking data endpoints
app.get('/api/parking/status', (req, res) => {
  db.getParkingStatus((err, parking) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(parking);
    }
  });
});

// Match data endpoints
app.get('/api/matches/live', (req, res) => {
  db.getLiveMatches((err, matches) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(matches);
    }
  });
});

// Operations endpoints
app.get('/api/operations/incidents', (req, res) => {
  db.getIncidents((err, incidents) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(incidents);
    }
  });
});

app.get('/api/operations/staff', (req, res) => {
  db.getStaffStatus((err, staff) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(staff);
    }
  });
});

// Sustainability endpoints
app.get('/api/sustainability/metrics', (req, res) => {
  db.getSustainabilityMetrics((err, metrics) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(metrics);
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data
  db.getCrowdDensity((err, data) => {
    if (!err) socket.emit('crowd:update', data);
  });
  db.getGateStatus((err, gates) => {
    if (!err) socket.emit('gates:update', gates);
  });
  db.getLiveMatches((err, matches) => {
    if (!err) socket.emit('matches:update', matches);
  });

  // Handle real-time updates
  const updateInterval = setInterval(() => {
    db.getCrowdDensity((err, data) => {
      if (!err) socket.emit('crowd:update', data);
    });
    db.getGateStatus((err, gates) => {
      if (!err) socket.emit('gates:update', gates);
    });
    db.getLiveMatches((err, matches) => {
      if (!err) socket.emit('matches:update', matches);
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(updateInterval);
  });

  socket.on('role:switch', (role) => {
    socket.emit('role:confirmed', role);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏟️ StadiumAI Hub server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

module.exports = { app, server, io };
