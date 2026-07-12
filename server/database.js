const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Manages the SQLite database connection, initialization, and queries
 * Provides a Promise-based wrapper around sqlite3 methods
 */
class StadiumDatabase {
  /**
   * Initializes the database connection
   * @param {string} [dbPath] - Optional path to database file. Defaults to data/stadium.db. Use ':memory:' for tests.
   * @returns {Promise<StadiumDatabase>} Resolves with the initialized database instance
   */
  constructor(dbPath) {
    const resolvedPath = dbPath || path.join(__dirname, '../data/stadium.db');
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(resolvedPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          if (resolvedPath !== ':memory:') {
            console.log('Connected to SQLite database');
          }
          this.initializeDatabase()
            .then(() => resolve(this))
            .catch(reject);
        }
      });
    });
  }

  /**
   * Helper: promisify db.run
   * @param {string} sql - SQL query string
   * @param {Array} [params] - Query parameters
   * @returns {Promise<{lastID: number, changes: number}>} Result of execution
   * @private
   */
  _run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Helper: promisify db.all
   * @param {string} sql - SQL query string
   * @param {Array} [params] - Query parameters
   * @returns {Promise<Array>} Array of rows
   * @private
   */
  _all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * Helper: promisify db.get
   * @param {string} sql - SQL query string
   * @param {Array} [params] - Query parameters
   * @returns {Promise<Object>} Single row object
   * @private
   */
  _get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Helper: promisify db.exec
   * @param {string} sql - SQL script string
   * @returns {Promise<void>}
   * @private
   */
  _exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Creates necessary tables and indexes, and seeds initial data
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
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

    await this._exec(createTables);

    // Create indexes for efficient filtering
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_crowd_zone ON crowd_density(zone);
      CREATE INDEX IF NOT EXISTS idx_gates_status ON gates(status);
      CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
    `;
    await this._exec(createIndexes);

    await this.seedData();
  }

  /**
   * Seeds initial data if the database is empty
   * @returns {Promise<void>}
   */
  async seedData() {
    const row = await this._get('SELECT COUNT(*) as count FROM crowd_density');
    if (row.count === 0) {
      await this.seedCrowdData();
      await this.seedGateData();
      await this.seedParkingData();
      await this.seedMatchData();
      await this.seedIncidentData();
      await this.seedStaffData();
      await this.seedSustainabilityData();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedCrowdData() {
    const zones = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
    for (const zone of zones) {
      const density = Math.floor(Math.random() * 9);
      await this._run('INSERT INTO crowd_density (id, zone, density) VALUES (?, ?, ?)', [uuidv4(), zone, density]);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedGateData() {
    const gates = [
      { name: 'Gate A', status: 'active', throughput: 450, capacity: 500 },
      { name: 'Gate B', status: 'active', throughput: 380, capacity: 500 },
      { name: 'Gate C', status: 'congested', throughput: 490, capacity: 500 },
      { name: 'Gate D', status: 'active', throughput: 320, capacity: 500 },
      { name: 'Gate E', status: 'maintenance', throughput: 0, capacity: 500 },
      { name: 'Gate F', status: 'active', throughput: 410, capacity: 500 },
    ];

    for (const gate of gates) {
      await this._run('INSERT INTO gates (id, name, status, throughput, capacity) VALUES (?, ?, ?, ?, ?)', [
        uuidv4(),
        gate.name,
        gate.status,
        gate.throughput,
        gate.capacity,
      ]);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedParkingData() {
    const lots = [
      { name: 'Lot A', available: 245, capacity: 500 },
      { name: 'Lot B', available: 89, capacity: 400 },
      { name: 'Lot C', available: 312, capacity: 600 },
      { name: 'Lot D', available: 156, capacity: 300 },
      { name: 'Lot E', available: 445, capacity: 500 },
    ];

    for (const lot of lots) {
      await this._run('INSERT INTO parking_lots (id, name, available, capacity) VALUES (?, ?, ?, ?)', [
        uuidv4(),
        lot.name,
        lot.available,
        lot.capacity,
      ]);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedMatchData() {
    const matches = [
      { team1: 'Brazil', team2: 'Argentina', score1: 2, score2: 1, time: "67'", status: 'live' },
      { team1: 'Germany', team2: 'France', score1: 1, score2: 1, time: "45'", status: 'live' },
      { team1: 'Spain', team2: 'England', score1: 0, score2: 0, time: "32'", status: 'live' },
    ];

    for (const match of matches) {
      await this._run(
        'INSERT INTO matches (id, team1, team2, score1, score2, time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), match.team1, match.team2, match.score1, match.score2, match.time, match.status]
      );
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedIncidentData() {
    const incidents = [
      { type: 'medical', location: 'Section F', severity: 'medium', status: 'active', description: 'Fan feeling unwell' },
      { type: 'security', location: 'Gate C', severity: 'low', status: 'active', description: 'Minor dispute resolved' },
      { type: 'maintenance', location: 'Concourse B', severity: 'high', status: 'pending', description: 'Water leak reported' },
    ];

    for (const incident of incidents) {
      await this._run(
        'INSERT INTO incidents (id, type, location, severity, status, description) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), incident.type, incident.location, incident.severity, incident.status, incident.description]
      );
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedStaffData() {
    const staff = [
      { name: 'John Smith', role: 'Security', location: 'Gate A', status: 'on-duty' },
      { name: 'Sarah Johnson', role: 'Medical', location: 'First Aid', status: 'on-duty' },
      { name: 'Mike Williams', role: 'Security', location: 'Gate B', status: 'on-duty' },
      { name: 'Emily Brown', role: 'Concessions', location: 'Food Court', status: 'on-duty' },
    ];

    for (const s of staff) {
      await this._run('INSERT INTO staff (id, name, role, location, status) VALUES (?, ?, ?, ?, ?)', [
        uuidv4(),
        s.name,
        s.role,
        s.location,
        s.status,
      ]);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async seedSustainabilityData() {
    const metrics = [
      { metric: 'recycling_rate', value: 78, unit: '%' },
      { metric: 'water_saved', value: 12400, unit: 'L' },
      { metric: 'solar_power', value: 42, unit: '%' },
      { metric: 'carbon_offset', value: 86, unit: 'T' },
    ];

    for (const m of metrics) {
      await this._run('INSERT INTO sustainability (id, metric, value, unit) VALUES (?, ?, ?, ?)', [
        uuidv4(),
        m.metric,
        m.value,
        m.unit,
      ]);
    }
  }

  /**
   * Retrieves crowd density records and simulates real-time data shifts
   * @returns {Promise<Array>} Array of crowd density objects
   */
  async getCrowdDensity() {
    const rows = await this._all('SELECT * FROM crowd_density');

    // Simulate real-time updates by subtly shifting density up or down
    // This allows the frontend visualizations to appear dynamic and alive
    for (const row of rows) {
      row.density = Math.max(0, Math.min(8, row.density + (Math.random() > 0.5 ? 1 : -1)));
      await this._run('UPDATE crowd_density SET density = ? WHERE id = ?', [row.density, row.id]);
    }

    return rows;
  }

  /**
   * Calculates aggregated crowd statistics
   * @returns {Promise<Object>} Statistics containing safe/warning/critical counts and average density
   */
  async getCrowdStats() {
    const rows = await this._all('SELECT * FROM crowd_density');

    const safe = rows.filter((r) => r.density <= 3).length;
    const warning = rows.filter((r) => r.density >= 4 && r.density <= 5).length;
    const critical = rows.filter((r) => r.density >= 6).length;
    
    // Max density is 8, so dividing by length and multiplying by 12.5 gives a percentage (100 / 8)
    const avgDensity = Math.round((rows.reduce((sum, r) => sum + r.density, 0) / rows.length) * 12.5);

    return { safe, warning, critical, avgDensity: avgDensity + '%' };
  }

  /**
   * Retrieves gate status and simulates throughput fluctuation
   * @returns {Promise<Array>} Array of gate status objects
   */
  async getGateStatus() {
    const rows = await this._all('SELECT * FROM gates');

    for (const row of rows) {
      if (row.status === 'active') {
        // Adjust throughput randomly for active gates, bounded by 0 and max capacity
        row.throughput = Math.max(
          0,
          Math.min(row.capacity, row.throughput + Math.floor(Math.random() * 50) - 25)
        );
        await this._run('UPDATE gates SET throughput = ? WHERE id = ?', [row.throughput, row.id]);
      }
    }

    return rows;
  }

  /**
   * Retrieves parking status and simulates vehicle entry/exit
   * @returns {Promise<Array>} Array of parking lot objects
   */
  async getParkingStatus() {
    const rows = await this._all('SELECT * FROM parking_lots');

    for (const row of rows) {
      // Simulate random fluctuations in parking availability
      row.available = Math.max(
        0,
        Math.min(row.capacity, row.available + Math.floor(Math.random() * 10) - 5)
      );
      await this._run('UPDATE parking_lots SET available = ? WHERE id = ?', [row.available, row.id]);
    }

    return rows;
  }

  /**
   * Retrieves live matches and increments match time
   * @returns {Promise<Array>} Array of live match objects
   */
  async getLiveMatches() {
    const rows = await this._all('SELECT * FROM matches');

    for (const row of rows) {
      if (row.status === 'live') {
        const currentMin = parseInt(row.time) || 0;
        if (currentMin < 90) {
          row.time = currentMin + 1 + "'";
          await this._run('UPDATE matches SET time = ? WHERE id = ?', [row.time, row.id]);
        }
      }
    }

    return rows;
  }

  /**
   * Retrieves all currently active incidents
   * @returns {Promise<Array>} Array of incident objects
   */
  async getIncidents() {
    return this._all('SELECT * FROM incidents WHERE status = "active"');
  }

  /**
   * Retrieves all staff currently on duty
   * @returns {Promise<Array>} Array of staff objects
   */
  async getStaffStatus() {
    return this._all('SELECT * FROM staff WHERE status = "on-duty"');
  }

  /**
   * Retrieves all sustainability metrics
   * @returns {Promise<Array>} Array of metric objects
   */
  async getSustainabilityMetrics() {
    return this._all('SELECT * FROM sustainability');
  }

  /**
   * Closes the database connection
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = StadiumDatabase;
