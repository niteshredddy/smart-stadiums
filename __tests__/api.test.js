/**
 * Integration tests for all REST API endpoints
 * Uses in-memory SQLite database for isolation
 */
const request = require('supertest');
const http = require('http');
const StadiumDatabase = require('../server/database');
const { createApp } = require('../server/index');

let db;
let app;
let server;

beforeAll(async () => {
  db = await new StadiumDatabase(':memory:');
  app = createApp(db);
  server = http.createServer(app);
});

afterAll(async () => {
  if (server) server.close();
  if (db) await db.close();
});

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    test('should return 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/crowd/density', () => {
    test('should return 200 with array of crowd density data', async () => {
      const res = await request(app).get('/api/crowd/density');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      res.body.forEach(row => {
        expect(row).toHaveProperty('id');
        expect(row).toHaveProperty('zone');
        expect(row).toHaveProperty('density');
      });
    });
  });

  describe('GET /api/crowd/stats', () => {
    test('should return 200 with crowd statistics', async () => {
      const res = await request(app).get('/api/crowd/stats');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('safe');
      expect(res.body).toHaveProperty('warning');
      expect(res.body).toHaveProperty('critical');
      expect(res.body).toHaveProperty('avgDensity');
      expect(typeof res.body.safe).toBe('number');
      expect(typeof res.body.warning).toBe('number');
      expect(typeof res.body.critical).toBe('number');
    });
  });

  describe('GET /api/gates/status', () => {
    test('should return 200 with array of gate data', async () => {
      const res = await request(app).get('/api/gates/status');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(6);

      res.body.forEach(gate => {
        expect(gate).toHaveProperty('name');
        expect(gate).toHaveProperty('status');
        expect(gate).toHaveProperty('throughput');
        expect(gate).toHaveProperty('capacity');
      });
    });
  });

  describe('GET /api/parking/status', () => {
    test('should return 200 with array of parking data', async () => {
      const res = await request(app).get('/api/parking/status');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(5);

      res.body.forEach(lot => {
        expect(lot).toHaveProperty('name');
        expect(lot).toHaveProperty('available');
        expect(lot).toHaveProperty('capacity');
      });
    });
  });

  describe('GET /api/matches/live', () => {
    test('should return 200 with array of match data', async () => {
      const res = await request(app).get('/api/matches/live');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);

      res.body.forEach(match => {
        expect(match).toHaveProperty('team1');
        expect(match).toHaveProperty('team2');
        expect(match).toHaveProperty('score1');
        expect(match).toHaveProperty('score2');
        expect(match).toHaveProperty('time');
        expect(match).toHaveProperty('status');
      });
    });
  });

  describe('GET /api/operations/incidents', () => {
    test('should return 200 with array of active incidents', async () => {
      const res = await request(app).get('/api/operations/incidents');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach(incident => {
        expect(incident).toHaveProperty('type');
        expect(incident).toHaveProperty('location');
        expect(incident).toHaveProperty('severity');
        expect(incident.status).toBe('active');
      });
    });
  });

  describe('GET /api/operations/staff', () => {
    test('should return 200 with array of on-duty staff', async () => {
      const res = await request(app).get('/api/operations/staff');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);

      res.body.forEach(s => {
        expect(s).toHaveProperty('name');
        expect(s).toHaveProperty('role');
        expect(s).toHaveProperty('location');
        expect(s.status).toBe('on-duty');
      });
    });

    test('should return cached data on subsequent requests', async () => {
      const res1 = await request(app).get('/api/operations/staff');
      const res2 = await request(app).get('/api/operations/staff');
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      // Both should return same data from cache
      expect(res1.body.length).toBe(res2.body.length);
    });
  });

  describe('GET /api/sustainability/metrics', () => {
    test('should return 200 with array of sustainability metrics', async () => {
      const res = await request(app).get('/api/sustainability/metrics');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);

      res.body.forEach(m => {
        expect(m).toHaveProperty('metric');
        expect(m).toHaveProperty('value');
        expect(m).toHaveProperty('unit');
      });
    });

    test('should return cached data on subsequent requests', async () => {
      const res1 = await request(app).get('/api/sustainability/metrics');
      const res2 = await request(app).get('/api/sustainability/metrics');
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(JSON.stringify(res1.body)).toBe(JSON.stringify(res2.body));
    });
  });

  describe('POST /api/ai/chat', () => {
    test('should return 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should return 400 when message is empty', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/empty/i);
    });

    test('should return 400 when message exceeds 2000 characters', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'a'.repeat(2001) });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/2000/);
    });

    test('should return 400 for invalid language', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Hello', language: 'xx' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/language/i);
    });

    test('should return fallback response when no API key is set', async () => {
      // No GEMINI_API_KEY in test environment
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Where is the nearest restroom?', language: 'en' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('fallback', true);
    });
  });
});
