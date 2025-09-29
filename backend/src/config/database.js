const knex = require('knex');
const { Model } = require('objection');
const logger = require('../utils/logger');

let db = null;

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'academia_db',
    charset: 'utf8mb4',
  },
  pool: {
    min: 2,
    max: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    acquireTimeoutMillis: parseInt(process.env.DB_TIMEOUT) || 60000,
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './src/seeds'
  },
  debug: process.env.NODE_ENV === 'development'
};

const setupDatabase = async () => {
  try {
    db = knex(knexConfig);
    
    // Test the connection
    await db.raw('SELECT 1');
    
    // Give the connection to Objection ORM
    Model.knex(db);
    
    logger.info('Database connection established successfully');
    return db;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

const closeDatabase = async () => {
  if (db) {
    await db.destroy();
    logger.info('Database connection closed');
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call setupDatabase() first.');
  }
  return db;
};

// Health check for database
const checkDatabaseHealth = async () => {
  try {
    await db.raw('SELECT 1');
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

module.exports = {
  setupDatabase,
  closeDatabase,
  getDatabase,
  checkDatabaseHealth,
  knexConfig
};