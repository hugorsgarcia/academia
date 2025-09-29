const express = require('express');
const router = express.Router();

// Health check routes
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      database: 'checking...',
      redis: 'checking...',
      email: 'checking...'
    }
  });
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const { checkDatabaseHealth } = require('../config/database');
    const health = await checkDatabaseHealth();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: error.message
    });
  }
});

// Redis health check
router.get('/redis', async (req, res) => {
  try {
    const { checkRedisHealth } = require('../config/redis');
    const health = await checkRedisHealth();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: error.message
    });
  }
});

module.exports = router;