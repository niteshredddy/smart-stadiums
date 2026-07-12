/**
 * Unit tests for StadiumDatabase
 * Uses in-memory SQLite database for isolation
 */
const StadiumDatabase = require('../server/database');

let db;

beforeAll(async () => {
  // Create an in-memory database for testing
  db = await new StadiumDatabase(':memory:');
});

afterAll(async () => {
  if (db) await db.close();
});

describe('StadiumDatabase', () => {
  describe('Initialization & Seeding', () => {
    test('should create database and seed data', () => {
      expect(db).toBeDefined();
      expect(db.db).toBeDefined();
    });

    test('should not re-seed if data already exists', async () => {
      // seedData checks count > 0, so calling again should be safe
      await db.seedData();
      const rows = await db._all('SELECT COUNT(*) as count FROM crowd_density');
      expect(rows[0].count).toBe(16); // 16 zones seeded once
    });
  });

  describe('getCrowdDensity()', () => {
    test('should return an array of crowd density records', async () => {
      const data = await db.getCrowdDensity();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(16);
    });

    test('each record should have required fields', async () => {
      const data = await db.getCrowdDensity();
      data.forEach((row) => {
        expect(row).toHaveProperty('id');
        expect(row).toHaveProperty('zone');
        expect(row).toHaveProperty('density');
        expect(typeof row.density).toBe('number');
        expect(row.density).toBeGreaterThanOrEqual(0);
        expect(row.density).toBeLessThanOrEqual(8);
      });
    });
  });

  describe('getCrowdStats()', () => {
    test('should return aggregated crowd statistics', async () => {
      const stats = await db.getCrowdStats();
      expect(stats).toHaveProperty('safe');
      expect(stats).toHaveProperty('warning');
      expect(stats).toHaveProperty('critical');
      expect(stats).toHaveProperty('avgDensity');
      expect(typeof stats.safe).toBe('number');
      expect(typeof stats.warning).toBe('number');
      expect(typeof stats.critical).toBe('number');
      expect(stats.avgDensity).toMatch(/%$/);
    });

    test('zone counts should sum to total zones', async () => {
      const stats = await db.getCrowdStats();
      expect(stats.safe + stats.warning + stats.critical).toBe(16);
    });
  });

  describe('getGateStatus()', () => {
    test('should return an array of gate records', async () => {
      const gates = await db.getGateStatus();
      expect(Array.isArray(gates)).toBe(true);
      expect(gates.length).toBe(6);
    });

    test('each gate should have required fields', async () => {
      const gates = await db.getGateStatus();
      gates.forEach((gate) => {
        expect(gate).toHaveProperty('id');
        expect(gate).toHaveProperty('name');
        expect(gate).toHaveProperty('status');
        expect(gate).toHaveProperty('throughput');
        expect(gate).toHaveProperty('capacity');
        expect(['active', 'congested', 'maintenance']).toContain(gate.status);
      });
    });

    test('active gates should have throughput within capacity', async () => {
      const gates = await db.getGateStatus();
      gates
        .filter((g) => g.status === 'active')
        .forEach((gate) => {
          expect(gate.throughput).toBeGreaterThanOrEqual(0);
          expect(gate.throughput).toBeLessThanOrEqual(gate.capacity);
        });
    });
  });

  describe('getParkingStatus()', () => {
    test('should return an array of parking lot records', async () => {
      const lots = await db.getParkingStatus();
      expect(Array.isArray(lots)).toBe(true);
      expect(lots.length).toBe(5);
    });

    test('each lot should have required fields', async () => {
      const lots = await db.getParkingStatus();
      lots.forEach((lot) => {
        expect(lot).toHaveProperty('id');
        expect(lot).toHaveProperty('name');
        expect(lot).toHaveProperty('available');
        expect(lot).toHaveProperty('capacity');
        expect(lot.available).toBeGreaterThanOrEqual(0);
        expect(lot.available).toBeLessThanOrEqual(lot.capacity);
      });
    });
  });

  describe('getLiveMatches()', () => {
    test('should return an array of match records', async () => {
      const matches = await db.getLiveMatches();
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBe(3);
    });

    test('each match should have required fields', async () => {
      const matches = await db.getLiveMatches();
      matches.forEach((match) => {
        expect(match).toHaveProperty('id');
        expect(match).toHaveProperty('team1');
        expect(match).toHaveProperty('team2');
        expect(match).toHaveProperty('score1');
        expect(match).toHaveProperty('score2');
        expect(match).toHaveProperty('time');
        expect(match).toHaveProperty('status');
      });
    });

    test('live matches should have valid time format', async () => {
      const matches = await db.getLiveMatches();
      matches
        .filter((m) => m.status === 'live')
        .forEach((match) => {
          expect(match.time).toMatch(/^\d+'/);
        });
    });
  });

  describe('getIncidents()', () => {
    test('should return only active incidents', async () => {
      const incidents = await db.getIncidents();
      expect(Array.isArray(incidents)).toBe(true);
      incidents.forEach((incident) => {
        expect(incident.status).toBe('active');
        expect(incident).toHaveProperty('type');
        expect(incident).toHaveProperty('location');
        expect(incident).toHaveProperty('severity');
        expect(incident).toHaveProperty('description');
      });
    });
  });

  describe('getStaffStatus()', () => {
    test('should return only on-duty staff', async () => {
      const staff = await db.getStaffStatus();
      expect(Array.isArray(staff)).toBe(true);
      expect(staff.length).toBe(4);
      staff.forEach((s) => {
        expect(s.status).toBe('on-duty');
        expect(s).toHaveProperty('name');
        expect(s).toHaveProperty('role');
        expect(s).toHaveProperty('location');
      });
    });
  });

  describe('getSustainabilityMetrics()', () => {
    test('should return sustainability metrics', async () => {
      const metrics = await db.getSustainabilityMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBe(4);
    });

    test('each metric should have required fields', async () => {
      const metrics = await db.getSustainabilityMetrics();
      metrics.forEach((m) => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('metric');
        expect(m).toHaveProperty('value');
        expect(m).toHaveProperty('unit');
        expect(typeof m.value).toBe('number');
      });
    });

    test('should contain expected metric types', async () => {
      const metrics = await db.getSustainabilityMetrics();
      const metricNames = metrics.map((m) => m.metric);
      expect(metricNames).toContain('recycling_rate');
      expect(metricNames).toContain('water_saved');
      expect(metricNames).toContain('solar_power');
      expect(metricNames).toContain('carbon_offset');
    });
  });

  describe('close()', () => {
    test('should close the database without error', async () => {
      const tempDb = await new StadiumDatabase(':memory:');
      await expect(tempDb.close()).resolves.toBeUndefined();
    });
  });
});
