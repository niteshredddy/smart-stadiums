/* ============================================================
   StadiumAI Hub — WebSocket Client (Netlify-compatible polling)
   Real-time data synchronization using polling for Netlify Functions
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
      this.pollingInterval = null;
      this.pollingDelay = 5000; // 5 seconds
    }

    connect() {
      try {
        // Use polling instead of WebSocket for Netlify compatibility
        console.log('📡 Using polling mode for Netlify Functions');
        this.connected = true;
        this.startPolling();
        this.emit('connected');
      } catch (error) {
        console.error('Connection error:', error);
        this.handleReconnect();
      }
    }

    startPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }

      // Poll for data updates
      this.pollingInterval = setInterval(() => {
        this.fetchUpdates();
      }, this.pollingDelay);

      // Initial fetch
      this.fetchUpdates();
    }

    async fetchUpdates() {
      try {
        // Fetch all data endpoints
        const [crowdData, gatesData, matchesData] = await Promise.all([
          fetch('/api/crowd/density').then((r) => r.json()),
          fetch('/api/gates/status').then((r) => r.json()),
          fetch('/api/matches/live').then((r) => r.json()),
        ]);

        // Emit updates
        this.emit('crowdUpdate', crowdData);
        this.emit('gatesUpdate', gatesData);
        this.emit('matchesUpdate', matchesData);
      } catch (error) {
        console.error('Error fetching updates:', error);
      }
    }

    setupEventHandlers() {
      // Not needed for polling mode
    }

    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }

    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }

    send(event, data) {
      // For role switching in polling mode
      if (event === 'role:switch') {
        console.log('Role switch:', data);
        this.emit('roleConfirmed', data);
        return true;
      }

      console.warn(
        'Cannot send message: Polling mode does not support bidirectional communication'
      );
      return false;
    }

    disconnect() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      this.connected = false;
    }

    isConnected() {
      return this.connected;
    }

    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );

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
