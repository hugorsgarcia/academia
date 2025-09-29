const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { setupDatabase } = require('./config/database');
// const { setupRedis } = require('./config/redis'); // Disabled for development
const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Request logging
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION || '1.0.0'
      });
    });

    // API documentation endpoint (development only)
    if (process.env.NODE_ENV === 'development') {
      this.app.get('/api/docs', (req, res) => {
        res.json({
          message: 'Academia Management System API',
          version: '1.0.0',
          documentation: 'https://api-docs.academia.com',
          endpoints: {
            auth: '/api/auth/*',
            users: '/api/users/*',
            students: '/api/students/*',
            trainers: '/api/trainers/*',
            exercises: '/api/exercises/*',
            workouts: '/api/workouts/*',
            payments: '/api/payments/*',
            checkins: '/api/checkins/*',
            plans: '/api/plans/*',
            blog: '/api/blog/*',
            notifications: '/api/notifications/*',
            reports: '/api/reports/*'
          }
        });
      });
    }
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', routes);

    // Serve static files
    this.app.use('/uploads', express.static('uploads'));
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Try to initialize database (optional for development)
      let dbStatus = 'disconnected';
      let redisStatus = 'disconnected';

      try {
        await setupDatabase();
        logger.info('Database connected successfully');
        dbStatus = 'connected';
      } catch (error) {
        logger.warn('Database connection failed - running without database');
      }

      // Start server without Redis for now
      logger.info('Skipping Redis connection for development');

      // Start server
      this.server = this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`🏥 Academia Management System API v${process.env.APP_VERSION || '1.0.0'}`);
        logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
        logger.info(`📚 API Documentation: http://localhost:${this.port}/api/docs`);
        logger.info(`❤️  Health Check: http://localhost:${this.port}/health`);
        logger.info(`💾 Database: ${dbStatus} | 🔄 Redis: ${redisStatus}`);
        logger.info(`🔧 To enable full functionality, configure MySQL and Redis`);
        
        if (process.env.NODE_ENV === 'development') {
          logger.info('🚀 Available API Routes:');
          logger.info('   POST /api/auth/register - Register new user');
          logger.info('   POST /api/auth/login - User login');
          logger.info('   GET  /health - Health check');
          logger.info('   GET  /api/docs - API documentation');
        }
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  setupGracefulShutdown() {
    const shutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      
      // Close server
      this.server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connections
        // Close Redis connections
        
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start server
const server = new Server();
server.setupGracefulShutdown();
server.start();

module.exports = server;