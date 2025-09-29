const winston = require('winston');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure transports
const transports = [
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    handleRejections: true
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // Warning log file
  new winston.transports.File({
    filename: path.join(logsDir, 'warnings.log'),
    level: 'warn',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3
  })
];

// Add console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'academia-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

// Create a stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper methods for structured logging
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id || null,
    userRole: req.user?.role || null
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request Error', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

logger.logError = (error, req = null, additionalData = {}) => {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...additionalData
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || null,
      body: req.body,
      query: req.query,
      params: req.params
    };
  }

  logger.error('Application Error', errorData);
};

logger.logPayment = (paymentData, action = 'created') => {
  logger.info('Payment Event', {
    action,
    paymentId: paymentData.id,
    amount: paymentData.amount,
    currency: paymentData.currency,
    gateway: paymentData.gateway,
    status: paymentData.status,
    studentId: paymentData.studentId,
    timestamp: new Date().toISOString()
  });
};

logger.logAuth = (userId, action, ip, userAgent, success = true) => {
  const logData = {
    userId,
    action, // 'login', 'logout', 'register', 'password_reset', etc.
    ip,
    userAgent,
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info('Authentication Event', logData);
  } else {
    logger.warn('Authentication Failed', logData);
  }
};

logger.logSecurity = (event, data = {}) => {
  logger.warn('Security Event', {
    event, // 'suspicious_activity', 'brute_force_attempt', 'invalid_token', etc.
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Performance logging
logger.logPerformance = (operation, duration, metadata = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...metadata,
    timestamp: new Date().toISOString()
  };

  if (duration > 1000) { // Log slow operations
    logger.warn('Slow Operation', logData);
  } else {
    logger.debug('Performance', logData);
  }
};

// Database operation logging
logger.logDatabase = (operation, table, duration, error = null) => {
  const logData = {
    operation, // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
    table,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  };

  if (error) {
    logger.error('Database Error', { ...logData, error: error.message });
  } else if (duration > 500) {
    logger.warn('Slow Database Query', logData);
  } else {
    logger.debug('Database Operation', logData);
  }
};

// Business logic logging
logger.logBusiness = (event, data = {}) => {
  logger.info('Business Event', {
    event, // 'membership_created', 'workout_assigned', 'payment_processed', etc.
    ...data,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;