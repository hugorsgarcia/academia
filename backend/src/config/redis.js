const redis = require('redis');
const logger = require('../utils/logger');

let client = null;

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
};

const setupRedis = async () => {
  try {
    client = redis.createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        connectTimeout: redisConfig.connectTimeout,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await client.connect();
    
    // Test the connection
    await client.ping();
    
    logger.info('Redis connection established successfully');
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Don't throw error for Redis as it's not critical for basic functionality
    logger.warn('Application will continue without Redis caching');
    return null;
  }
};

const closeRedis = async () => {
  if (client) {
    await client.quit();
    logger.info('Redis connection closed');
  }
};

const getRedisClient = () => {
  return client;
};

// Cache helper functions
const cache = {
  // Set cache with TTL
  set: async (key, value, ttl = parseInt(process.env.CACHE_TTL) || 3600) => {
    if (!client) return false;
    try {
      const serializedValue = JSON.stringify(value);
      await client.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache
  get: async (key) => {
    if (!client) return null;
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  del: async (key) => {
    if (!client) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys
  delMany: async (keys) => {
    if (!client || !keys.length) return false;
    try {
      await client.del(keys);
      return true;
    } catch (error) {
      logger.error('Cache delete many error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    if (!client) return false;
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Get TTL of a key
  ttl: async (key) => {
    if (!client) return -1;
    try {
      return await client.ttl(key);
    } catch (error) {
      logger.error('Cache TTL error:', error);
      return -1;
    }
  },

  // Clear all cache
  flush: async () => {
    if (!client) return false;
    try {
      await client.flushAll();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  },

  // Get all keys matching pattern
  keys: async (pattern = '*') => {
    if (!client) return [];
    try {
      return await client.keys(pattern);
    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }
};

// Health check for Redis
const checkRedisHealth = async () => {
  if (!client) {
    return { status: 'unavailable', message: 'Redis client not initialized' };
  }
  
  try {
    await client.ping();
    return { status: 'healthy', message: 'Redis connection is working' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

module.exports = {
  setupRedis,
  closeRedis,
  getRedisClient,
  cache,
  checkRedisHealth
};