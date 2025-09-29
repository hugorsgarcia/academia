const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.logError(err, req);

  // Default error
  let error = {
    statusCode: 500,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.statusCode = 400;
    error.message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = err.errors && Object.keys(err.errors).length > 0 
      ? Object.values(err.errors).map(val => val.message).join(', ')
      : 'Validation error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.statusCode = 400;
    error.message = 'File too large';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.statusCode = 400;
    error.message = 'Too many files or unexpected field name';
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.statusCode = 400;
    error.message = 'Duplicate entry - resource already exists';
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.statusCode = 400;
    error.message = 'Referenced resource does not exist';
  }

  // Payment gateway errors
  if (err.type === 'StripeCardError') {
    error.statusCode = 400;
    error.message = err.message;
  }

  if (err.type === 'StripeInvalidRequestError') {
    error.statusCode = 400;
    error.message = 'Invalid payment request';
  }

  // Custom application errors
  if (err.statusCode) {
    error.statusCode = err.statusCode;
    error.message = err.message;
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error.statusCode = 429;
    error.message = 'Too many requests, please try again later';
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        original: err
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

module.exports = errorHandler;