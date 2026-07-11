const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StadiumDatabase {
  constructor() {
    const dbPath = path.join(__dirname, '../data/stadium.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeDatabase();
      }
    });
  }

  initializeDatabase() {
    const createTables = `
      CREATE TABLE IF NOT EXISTS crowd_density (
        id TEXT PRIMARY KEY,
        zone TEXT NOT NULL,
        density INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS gates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        throughput INTEGER DEFAULT 0,
        capacity INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS parking_lots (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        available INTEGER DEFAULT 0,
        capacity INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        team1 TEXT NOT NULL,
        team2 TEXT NOT NULL,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sustainability (
        id TEXT PRIMARY KEY,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
      } else {
        this.seedData();
      }
    });
  }

  seedData() {
    this.db.get('SELECT COUNT(*) as count FROM crowd_density', (err, row) => {
      if (err) {
        console.error('Error checking crowd data:', err);
        return;
      }
      
      if (row.count === 0) {
        this.seedCrowdData();
        this.seedGateData();
        this.seedParkingData();
        this.seedMatchData();
        this.seedIncidentData();
        this.seedStaffData();
        this.seedSustainabilityData();
      }
    });
  }

  seedCrowdData() {
    const zones = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
    zones.forEach(zone => {
      const density = Math.floor(Math.random() * 9);
      this.db.run('INSERT INTO crowd_density (id, zone, density) VALUES (?, ?, ?)', [uuidv4(), zone, density]);
    });
  }

  seedGateData() {
    const gates = [
      { name: 'Gate A', status: 'active', throughput: 450, capacity: 500 },
      { name: 'Gate B', status: 'active', throughput: 380, capacity: 500 },
      { name: 'Gate C', status: 'congested', throughput: 490, capacity: 500 },
      { name: 'Gate D', status: 'active', throughput: 320, capacity: 500 },
      { name: 'Gate E', status: 'maintenance', throughput: 0, capacity: 500 },
      { name: 'Gate F', status: 'active', throughput: 410, capacity: 500 },
    ];

    gates.forEach(gate => {
      this.db.run('INSERT INTO gates (id, name, status, throughput, capacity) VALUES (?, ?, ?, ?, ?)', 
        [uuidv4(), gate.name, gate.status, gate.throughput, gate.capacity]);
    });
  }

  seedParkingData() {
    const lots = [
      { name: 'Lot A', available: 245, capacity: 500 },
      { name: 'Lot B', available: 89, capacity: 400 },
      { name: 'Lot C', available: 312, capacity: 600 },
      { name: 'Lot D', available: 156, capacity: 300 },
      { name: 'Lot E', available: 445, capacity: 500 },
    ];

    lots.forEach(lot => {
      this.db.run('INSERT INTO parking_lots (id, name, available, capacity) VALUES (?, ?, ?, ?)', 
        [uuidv4(), lot.name, lot.available, lot.capacity]);
    });
  }

  seedMatchData() {
    const matches = [
      { team1: 'Brazil', team2: 'Argentina', score1: 2, score2: 1, time: '67\'', status: 'live' },
      { team1: 'Germany', team2: 'France', score1: 1, score2: 1, time: '45\'', status: 'live' },
      { team1: 'Spain', team2: 'England', score1: 0, score2: 0, time: '32\'', status: 'live' },
    ];

    matches.forEach(match => {
      this.db.run('INSERT INTO matches (id, team1, team2, score1, score2, time, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [uuidv4(), match.team1, match.team2, match.score1, match.score2, match.time, match.status]);
    });
  }

  seedIncidentData() {
    const incidents = [
      { type: 'medical', location: 'Section F', severity: 'medium', status: 'active', description: 'Fan feeling unwell' },
      { type: 'security', location: 'Gate C', severity: 'low', status: 'active', description: 'Minor dispute resolved' },
      { type: 'maintenance', location: 'Concourse B', severity: 'high', status: 'pending', description: 'Water leak reported' },
    ];

    incidents.forEach(incident => {
      this.db.run('INSERT INTO incidents (id, type, location, severity, status, description) VALUES (?, ?, ?, ?, ?, ?)', 
        [uuidv4(), incident.type, incident.location, incident.severity, incident.status, incident.description]);
    });
  }

  seedStaffData() {
    const staff = [
      { name: 'John Smith', role: 'Security', location: 'Gate A', status: 'on-duty' },
      { name: 'Sarah Johnson', role: 'Medical', location: 'First Aid', status: 'on-duty' },
      { name: 'Mike Williams', role: 'Security', location: 'Gate B', status: 'on-duty' },
      { name: 'Emily Brown', role: 'Concessions', location: 'Food Court', status: 'on-duty' },
    ];

    staff.forEach(s => {
      this.db.run('INSERT INTO staff (id, name, role, location, status) VALUES (?, ?, ?, ?, ?)', 
        [uuidv4(), s.name, s.role, s.location, s.status]);
    });
  }

  seedSustainabilityData() {
    const metrics = [
      { metric: 'recycling_rate', value: 78, unit: '%' },
      { metric: 'water_saved', value: 12400, unit: 'L' },
      { metric: 'solar_power', value: 42, unit: '%' },
      { metric: 'carbon_offset', value: 86, unit: 'T' },
    ];

    metrics.forEach(m => {
      this.db.run('INSERT INTO sustainability (id, metric, value, unit) VALUES (?, ?, ?, ?)', 
        [uuidv4(), m.metric, m.value, m.unit]);
    });
  }

  // Query methods - using callbacks for async sqlite3
  getCrowdDensity(callback) {
    this.db.all('SELECT * FROM crowd_density', (err, rows) => {
      if (err) return callback(err);
      
      // Simulate real-time updates
      rows.forEach(row => {
        row.density = Math.max(0, Math.min(8, row.density + (Math.random() > 0.5 ? 1 : -1)));
        this.db.run('UPDATE crowd_density SET density = ? WHERE id = ?', [row.density, row.id]);
      });
      
      callback(null, rows);
    });
  }

  getCrowdStats(callback) {
    this.db.all('SELECT * FROM crowd_density', (err, rows) => {
      if (err) return callback(err);
      
      const safe = rows.filter(r => r.density <= 3).length;
      const warning = rows.filter(r => r.density >= 4 && r.density <= 5).length;
      const critical = rows.filter(r => r.density >= 6).length;
      const avgDensity = Math.round(rows.reduce((sum, r) => sum + r.density, 0) / rows.length * 12.5);

      callback(null, { safe, warning, critical, avgDensity: avgDensity + '%' });
    });
  }

  getGateStatus(callback) {
    this.db.all('SELECT * FROM gates', (err, rows) => {
      if (err) return callback(err);
      
      rows.forEach(row => {
        if (row.status === 'active') {
          row.throughput = Math.max(0, Math.min(row.capacity, row.throughput + Math.floor(Math.random() * 50) - 25));
          this.db.run('UPDATE gates SET throughput = ? WHERE id = ?', [row.throughput, row.id]);
        }
      });
      
      callback(null, rows);
    });
  }

  getParkingStatus(callback) {
    this.db.all('SELECT * FROM parking_lots', (err, rows) => {
      if (err) return callback(err);
      
      rows.forEach(row => {
        row.available = Math.max(0, Math.min(row.capacity, row.available + Math.floor(Math.random() * 10) - 5));
        this.db.run('UPDATE parking_lots SET available = ? WHERE id = ?', [row.available, row.id]);
      });
      
      callback(null, rows);
    });
  }

  getLiveMatches(callback) {
    this.db.all('SELECT * FROM matches', (err, rows) => {
      if (err) return callback(err);
      
      rows.forEach(row => {
        if (row.status === 'live') {
          const currentMin = parseInt(row.time) || 0;
          if (currentMin < 90) {
            row.time = (currentMin + 1) + '\'';
            this.db.run('UPDATE matches SET time = ? WHERE id = ?', [row.time, row.id]);
          }
        }
      });
      
      callback(null, rows);
    });
  }

  getIncidents(callback) {
    this.db.all('SELECT * FROM incidents WHERE status = "active"', callback);
  }

  getStaffStatus(callback) {
    this.db.all('SELECT * FROM staff WHERE status = "on-duty"', callback);
  }

  getSustainabilityMetrics(callback) {
    this.db.all('SELECT * FROM sustainability', callback);
  }

  close() {
    this.db.close();
  }
}

module.exports = StadiumDatabase;
