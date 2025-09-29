const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      availableRoutes: {
        auth: '/api/auth',
        users: '/api/users',
        students: '/api/students',
        trainers: '/api/trainers',
        exercises: '/api/exercises',
        workouts: '/api/workouts',
        plans: '/api/plans',
        payments: '/api/payments',
        checkins: '/api/checkins',
        blog: '/api/blog',
        notifications: '/api/notifications',
        reports: '/api/reports',
        health: '/api/health'
      }
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = notFoundHandler;