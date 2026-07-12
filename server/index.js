require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Database = require('./database');

// --- Simple in-memory TTL cache ---
class TTLCache {
  constructor(ttlMs) {
    this.ttl = ttlMs;
    this.cache = null;
    this.expiry = 0;
  }

  get() {
    if (Date.now() < this.expiry && this.cache !== null) {
      return this.cache;
    }
    return null;
  }

  set(data) {
    this.cache = data;
    this.expiry = Date.now() + this.ttl;
  }

  clear() {
    this.cache = null;
    this.expiry = 0;
  }
}

// --- Allowed languages for validation ---
const ALLOWED_LANGUAGES = ['en', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'ko', 'zh', 'hi'];

// --- Create Express app (factory for testability) ---
function createApp(db) {
  const app = express();

  // --- Security: Helmet for secure HTTP headers ---
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "ws:", "wss:"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // --- Security: CORS lockdown ---
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  const allowedOrigins = allowedOriginsEnv.split(',').map(s => s.trim());

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (same-origin, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  // --- Security: Rate limiting ---
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });

  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI rate limit exceeded. Please try again later.' },
  });

  app.use('/api/', generalLimiter);

  // --- TTL Caches for infrequently changing data ---
  const sustainabilityCache = new TTLCache(60000); // 60 seconds
  const staffCache = new TTLCache(30000); // 30 seconds

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Crowd data endpoints
  app.get('/api/crowd/density', async (req, res) => {
    try {
      const data = await db.getCrowdDensity();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/crowd/stats', async (req, res) => {
    try {
      const stats = await db.getCrowdStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Gate data endpoints
  app.get('/api/gates/status', async (req, res) => {
    try {
      const gates = await db.getGateStatus();
      res.json(gates);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Parking data endpoints
  app.get('/api/parking/status', async (req, res) => {
    try {
      const parking = await db.getParkingStatus();
      res.json(parking);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Match data endpoints
  app.get('/api/matches/live', async (req, res) => {
    try {
      const matches = await db.getLiveMatches();
      res.json(matches);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Operations endpoints
  app.get('/api/operations/incidents', async (req, res) => {
    try {
      const incidents = await db.getIncidents();
      res.json(incidents);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/operations/staff', async (req, res) => {
    try {
      // Check cache first
      const cached = staffCache.get();
      if (cached) return res.json(cached);

      const staff = await db.getStaffStatus();
      staffCache.set(staff);
      res.json(staff);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Sustainability endpoints (cached)
  app.get('/api/sustainability/metrics', async (req, res) => {
    try {
      // Check cache first
      const cached = sustainabilityCache.get();
      if (cached) return res.json(cached);

      const metrics = await db.getSustainabilityMetrics();
      sustainabilityCache.set(metrics);
      res.json(metrics);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- Security: AI Chat Proxy Endpoint ---
  app.post('/api/ai/chat', aiLimiter, async (req, res) => {
    // Input validation
    const { message, language, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string.' });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message must be 2000 characters or less.' });
    }

    const lang = language || 'en';
    if (!ALLOWED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: `Invalid language. Allowed: ${ALLOWED_LANGUAGES.join(', ')}` });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 10) {
      // Return a signal that triggers fallback on the client
      return res.json({ fallback: true, message: 'AI features are in demo mode. Set GEMINI_API_KEY in .env to enable.' });
    }

    try {
      // Build conversation contents
      const contents = Array.isArray(conversationHistory) ? conversationHistory.slice(-16) : [];
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const SYSTEM_PROMPT = `You are StadiumAI, an intelligent, friendly, and multilingual AI assistant for the FIFA World Cup 2026. You are deployed inside stadiums across the USA, Mexico, and Canada to help fans, staff, volunteers, and organizers.

Your capabilities:
1. **Navigation**: Help fans find their seats, restrooms, food courts, first aid, merchandise stores, and exits.
2. **Crowd Management**: Report current crowd density, suggest less crowded routes, warn about congestion zones.
3. **Accessibility**: Provide wheelchair-accessible routes, elevator locations, accessible seating, sensory rooms.
4. **Transportation**: Advise on parking availability, metro/shuttle schedules, rideshare options.
5. **Sustainability**: Share recycling station locations, water refill stations, eco-friendly options.
6. **Match Info**: Current scores, upcoming matches, team lineups.
7. **Multilingual**: Respond in whatever language the user writes in.
8. **Emergency**: For medical emergencies, direct to nearest first aid. Always prioritize safety.

Guidelines:
- Be concise but helpful (2-4 sentences ideal for simple queries)
- Use emoji sparingly but effectively
- If you don't know something, say so honestly
- Respond in the same language the user uses`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 512,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ]
          })
        }
      );

      if (!response.ok) {
        console.error('Gemini API error:', response.status);
        return res.json({ fallback: true, message: 'AI service temporarily unavailable.' });
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not process that request.';

      return res.json({
        reply: aiText,
        role: 'model',
      });
    } catch (error) {
      console.error('AI proxy error:', error.message);
      return res.json({ fallback: true, message: 'AI service error. Please try again.' });
    }
  });

  return app;
}

// --- Setup WebSocket with proper CORS ---
function createSocketIO(server) {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  const allowedOrigins = allowedOriginsEnv.split(',').map(s => s.trim());

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

  return io;
}

// --- Start server (only when run directly, not when required for tests) ---
async function startServer() {
  const db = await new Database();
  const app = createApp(db);
  const server = http.createServer(app);
  const io = createSocketIO(server);

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data
    db.getCrowdDensity().then(data => socket.emit('crowd:update', data)).catch(() => {});
    db.getGateStatus().then(gates => socket.emit('gates:update', gates)).catch(() => {});
    db.getLiveMatches().then(matches => socket.emit('matches:update', matches)).catch(() => {});

    // Handle real-time updates
    const updateInterval = setInterval(() => {
      db.getCrowdDensity().then(data => socket.emit('crowd:update', data)).catch(() => {});
      db.getGateStatus().then(gates => socket.emit('gates:update', gates)).catch(() => {});
      db.getLiveMatches().then(matches => socket.emit('matches:update', matches)).catch(() => {});
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

  return { app, server, io, db };
}

// Auto-start when run directly
if (require.main === module) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { createApp, createSocketIO, startServer };
