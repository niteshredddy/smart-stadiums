/* ============================================================
   StadiumAI Hub — WebSocket Client
   Real-time data synchronization with backend
   ============================================================ */

(function () {
  'use strict';

  class WebSocketClient {
    constructor() {
      this.socket = null;
      this.connected = false;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 3000;
      this.listeners = {};
    }

    connect() {
      try {
        // Connect to the same host as the current page
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}`;
        
        console.log(`📡 Connecting to WebSocket server at ${wsUrl}`);
        
        this.socket = io(wsUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts
        });

        this.setupEventHandlers();
      } catch (error) {
        console.error('WebSocket connection error:', error);
        this.handleReconnect();
      }
    }

    setupEventHandlers() {
      if (!this.socket) return;

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        this.connected = false;
        this.emit('disconnected', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.emit('error', error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
        this.emit('reconnected', attemptNumber);
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 WebSocket reconnection attempt ${attemptNumber}`);
        this.emit('reconnecting', attemptNumber);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ WebSocket reconnection failed');
        this.emit('reconnectFailed');
      });

      // Data event handlers
      this.socket.on('crowd:update', (data) => {
        this.emit('crowdUpdate', data);
      });

      this.socket.on('gates:update', (data) => {
        this.emit('gatesUpdate', data);
      });

      this.socket.on('matches:update', (data) => {
        this.emit('matchesUpdate', data);
      });

      this.socket.on('role:confirmed', (role) => {
        this.emit('roleConfirmed', role);
      });
    }

    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }

    send(event, data) {
      if (!this.socket || !this.connected) {
        console.warn('Cannot send message: WebSocket not connected');
        return false;
      }
      
      this.socket.emit(event, data);
      return true;
    }

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.connected = false;
      }
    }

    isConnected() {
      return this.connected;
    }

    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      } else {
        console.error('Max reconnection attempts reached');
        this.emit('reconnectFailed');
      }
    }
  }

  // Create singleton instance
  const wsClient = new WebSocketClient();

  // Auto-connect on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wsClient.connect());
  } else {
    wsClient.connect();
  }

  // Export globally
  window.WSClient = wsClient;

})();
