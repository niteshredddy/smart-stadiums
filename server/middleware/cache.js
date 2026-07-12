/**
 * Simple in-memory TTL cache
 * Used to cache infrequently changing data responses
 */
class TTLCache {
  /**
   * @param {number} ttlMs - Time to live in milliseconds
   */
  constructor(ttlMs) {
    this.ttl = ttlMs;
    this.cache = null;
    this.expiry = 0;
  }

  /**
   * Retrieve cached data if not expired
   * @returns {any|null} The cached data, or null if empty/expired
   */
  get() {
    if (Date.now() < this.expiry && this.cache !== null) {
      return this.cache;
    }
    return null;
  }

  /**
   * Store data in the cache
   * @param {any} data - Data to cache
   */
  set(data) {
    this.cache = data;
    this.expiry = Date.now() + this.ttl;
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache = null;
    this.expiry = 0;
  }
}

// Instantiate specific caches
const sustainabilityCache = new TTLCache(60000); // 60 seconds
const staffCache = new TTLCache(30000); // 30 seconds

module.exports = {
  TTLCache,
  sustainabilityCache,
  staffCache,
};
