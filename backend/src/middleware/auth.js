const jwt = require('jsonwebtoken');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. No token provided.' }
      });
    }

    // Check if token is blacklisted (logout)
    const isBlacklisted = await cache.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token has been invalidated.' }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.query().findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'User no longer exists or is inactive.' }
      });
    }

    // Check if user changed password after token was issued
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({
        success: false,
        error: { message: 'Password was changed. Please login again.' }
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.logSecurity('invalid_token', {
      token: req.header('Authorization'),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token.' }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired.' }
      });
    }

    res.status(500).json({
      success: false,
      error: { message: 'Authentication error.' }
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. Authentication required.' }
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity('unauthorized_access', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: { 
          message: 'Access denied. Insufficient permissions.',
          requiredRoles: roles,
          userRole: req.user.role
        }
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.query().findById(decoded.id);
    
    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

// Resource ownership check
const checkResourceOwnership = (resourceIdParam = 'id', resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admins can access any resource
      if (['admin', 'super_admin'].includes(userRole)) {
        return next();
      }

      // Check if resource belongs to user
      const resource = await resourceModel.query().findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: { message: 'Resource not found.' }
        });
      }

      // Check ownership based on resource type
      let isOwner = false;
      
      if (resource.userId && resource.userId === userId) {
        isOwner = true;
      } else if (resource.studentId && resource.studentId === userId) {
        isOwner = true;
      } else if (resource.trainerId && resource.trainerId === userId) {
        isOwner = true;
      } else if (resource.id === userId) {
        isOwner = true;
      }

      if (!isOwner) {
        logger.logSecurity('unauthorized_resource_access', {
          userId,
          userRole,
          resourceId,
          resourceType: resourceModel.name,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          error: { message: 'Access denied. You can only access your own resources.' }
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const key = `rate_limit_${req.user.id}`;
    const requests = await cache.get(key) || 0;

    if (requests >= maxRequests) {
      logger.logSecurity('rate_limit_exceeded', {
        userId: req.user.id,
        requests,
        maxRequests,
        ip: req.ip
      });

      return res.status(429).json({
        success: false,
        error: { 
          message: 'Rate limit exceeded. Too many requests.',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }

    await cache.set(key, requests + 1, Math.ceil(windowMs / 1000));
    next();
  };
};

module.exports = {
  auth,
  authorize,
  optionalAuth,
  checkResourceOwnership,
  userRateLimit
};