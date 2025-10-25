// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getIp = require('./getIp');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

// Basic authentication middleware for regular users (if needed)
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Access denied. No token provided.', 401);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('Invalid token. User not found.', 401);
    }
    
    // Check if user is banned
    if (user.isBanned && user.bannedUntil && user.bannedUntil > new Date()) {
      throw new Error('User is banned', 403, { bannedUntil: user.bannedUntil, reason: user.banReason });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token', 401);
    }
    next(error);
  }
};

// Rate limiting middleware
const rateLimitMiddleware = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const identifier = getIp(req);
    const now = Date.now();
    
    if (!requests.has(identifier)) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRequests = requests.get(identifier);
    
    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      throw new Error('Too many requests. Please try again later.', 429, { resetTime: userRequests.resetTime });
    }
    
    userRequests.count++;
    next();
  };
};

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new Error('Validation failed', 400, { details: error.details[0].message });
    }
    next();
  };
};

// File upload validation middleware
const validateFileUpload = (allowedTypes, maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      throw new Error('No file uploaded', 400);
    }
    
    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error('Invalid file type', 400, { allowedTypes });
    }
    
    // Check file size
    if (req.file.size > maxSize) {
      throw new Error('File too large', 400, { maxSize: `${maxSize / (1024 * 1024)}MB` });
    }
    
    next();
  };
};

// CORS middleware configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = {
  authenticateUser,
  rateLimitMiddleware,
  validateInput,
  validateFileUpload,
  corsOptions
};
