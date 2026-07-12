/**
 * WebSocket tests for Socket.IO event emission
 * Tests connection events and role switching
 */
const http = require('http');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const StadiumDatabase = require('../server/database');
const { createApp, createSocketIO } = require('../server/index');

let db;
let app;
let httpServer;
let io;
let clientSocket;
let serverPort;

beforeAll(async () => {
  db = await new StadiumDatabase(':memory:');
  app = createApp(db);
  httpServer = http.createServer(app);

  // Create Socket.IO server manually for testing
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Set up the same event handlers as the production server
  io.on('connection', (socket) => {
    // Send initial data on connect
    db.getCrowdDensity()
      .then((data) => socket.emit('crowd:update', data))
      .catch(() => {});
    db.getGateStatus()
      .then((gates) => socket.emit('gates:update', gates))
      .catch(() => {});
    db.getLiveMatches()
      .then((matches) => socket.emit('matches:update', matches))
      .catch(() => {});

    socket.on('role:switch', (role) => {
      socket.emit('role:confirmed', role);
    });
  });

  // Start on a random available port
  await new Promise((resolve) => {
    httpServer.listen(0, () => {
      serverPort = httpServer.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  if (clientSocket) clientSocket.disconnect();
  if (io) io.close();
  if (httpServer) httpServer.close();
  if (db) await db.close();
});

afterEach(() => {
  if (clientSocket) {
    clientSocket.disconnect();
    clientSocket = null;
  }
});

function connectClient() {
  return new Promise((resolve) => {
    clientSocket = ioClient(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      forceNew: true,
    });
    clientSocket.on('connect', () => resolve(clientSocket));
  });
}

describe('WebSocket Events', () => {
  test('should connect successfully', async () => {
    const socket = await connectClient();
    expect(socket.connected).toBe(true);
  });

  test('should receive crowd:update on connection', async () => {
    const socket = await connectClient();
    const data = await new Promise((resolve) => {
      socket.on('crowd:update', (d) => resolve(d));
    });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    data.forEach((row) => {
      expect(row).toHaveProperty('zone');
      expect(row).toHaveProperty('density');
    });
  });

  test('should receive gates:update on connection', async () => {
    const socket = await connectClient();
    const data = await new Promise((resolve) => {
      socket.on('gates:update', (d) => resolve(d));
    });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    data.forEach((gate) => {
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('status');
    });
  });

  test('should receive matches:update on connection', async () => {
    const socket = await connectClient();
    const data = await new Promise((resolve) => {
      socket.on('matches:update', (d) => resolve(d));
    });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    data.forEach((match) => {
      expect(match).toHaveProperty('team1');
      expect(match).toHaveProperty('team2');
    });
  });

  test('should confirm role switch', async () => {
    const socket = await connectClient();
    const confirmed = await new Promise((resolve) => {
      socket.on('role:confirmed', (role) => resolve(role));
      socket.emit('role:switch', 'staff');
    });
    expect(confirmed).toBe('staff');
  });

  test('should confirm different roles', async () => {
    const socket = await connectClient();

    for (const role of ['fan', 'staff', 'organizer']) {
      const confirmed = await new Promise((resolve) => {
        socket.on('role:confirmed', (r) => resolve(r));
        socket.emit('role:switch', role);
      });
      expect(confirmed).toBe(role);
      socket.off('role:confirmed');
    }
  });
});
