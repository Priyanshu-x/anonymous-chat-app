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

// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Access denied. No admin token provided.', 401);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      throw new Error('Invalid token. Admin not found.', 401);
    }
    
    // Check if admin account is active
    if (admin.isActive === false) {
      throw new Error('Admin account is deactivated', 403);
    }
    
    // Update last activity
    admin.lastActivity = new Date();
    await admin.save();
    
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Admin token expired. Please login again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid admin token', 401);
    }
    next(error);
  }
};

// Middleware to check admin permissions
const checkAdminPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin) {
      throw new Error('Admin authentication required', 401);
    }
    
    // Super admin has all permissions
    if (req.admin.role === 'admin') {
      return next();
    }
    
    // Check if moderator has required permission
    if (req.admin.role === 'moderator') {
      const moderatorPermissions = [
        'view_messages',
        'delete_messages',
        'pin_messages',
        'kick_users',
        'view_stats'
      ];
      
      if (!moderatorPermissions.includes(requiredPermission)) {
        throw new Error('Insufficient permissions', 403, { required: requiredPermission, userRole: req.admin.role });
      }
    }
    
    next();
  };
};

// Middleware for logging admin actions
const logAdminAction = (action) => {
  return (req, res, next) => {
    // Store action details for potential audit logging
    req.adminAction = {
      action,
      adminId: req.admin?._id,
      adminUsername: req.admin?.username,
      timestamp: new Date(),
      ip: getIp(req),
      userAgent: req.get('User-Agent'),
      params: req.params,
      body: { ...req.body }
    };
    
    // Remove sensitive data from logs
    if (req.adminAction.body.password) {
      req.adminAction.body.password = '[REDACTED]';
    }
    
    // In production, you might want to save this to a separate audit log collection
    logger.info('Admin Action:', req.adminAction);
    
    next();
  };
};

// Rate limiting for admin endpoints
const adminRateLimit = (maxRequests = 100, windowMs = 60000) => {
  const adminRequests = new Map();
  
  return (req, res, next) => {
    const adminId = req.admin?._id?.toString();
    if (!adminId) return next();
    
    const now = Date.now();
    
    if (!adminRequests.has(adminId)) {
      adminRequests.set(adminId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRequests = adminRequests.get(adminId);
    
    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      throw new Error('Admin rate limit exceeded. Please slow down.', 429, { resetTime: userRequests.resetTime });
    }
    
    userRequests.count++;
    next();
  };
};

// Middleware to validate admin session
const validateAdminSession = async (req, res, next) => {
  try {
    if (!req.admin) {
      throw new Error('Admin session required', 401);
    }
    
    // Check if session is still valid (not expired due to inactivity)
    const maxInactivityTime = 24 * 60 * 60 * 1000; // 24 hours
    const lastActivity = req.admin.lastActivity || req.admin.lastLogin;
    
    if (lastActivity && (Date.now() - lastActivity.getTime()) > maxInactivityTime) {
      throw new Error('Admin session expired due to inactivity', 401, { lastActivity });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminAuth,
  checkAdminPermission,
  logAdminAction,
  adminRateLimit,
  validateAdminSession
};