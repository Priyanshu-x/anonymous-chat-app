// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware for regular users (if needed)
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    
    // Check if user is banned
    if (user.isBanned && user.bannedUntil && user.bannedUntil > new Date()) {
      return res.status(403).json({ 
        error: 'User is banned',
        bannedUntil: user.bannedUntil,
        reason: user.banReason
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Rate limiting middleware
const rateLimitMiddleware = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
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
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        resetTime: userRequests.resetTime
      });
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
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details[0].message 
      });
    }
    next();
  };
};

// File upload validation middleware
const validateFileUpload = (allowedTypes, maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        allowedTypes 
      });
    }
    
    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large',
        maxSize: `${maxSize / (1024 * 1024)}MB` 
      });
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
      return res.status(401).json({ error: 'Access denied. No admin token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token. Admin not found.' });
    }
    
    // Check if admin account is active
    if (admin.isActive === false) {
      return res.status(403).json({ error: 'Admin account is deactivated' });
    }
    
    // Update last activity
    admin.lastActivity = new Date();
    await admin.save();
    
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Admin token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid admin token' });
    }
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Admin authentication failed' });
  }
};

// Middleware to check admin permissions
const checkAdminPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
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
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermission,
          userRole: req.admin.role 
        });
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
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      params: req.params,
      body: { ...req.body }
    };
    
    // Remove sensitive data from logs
    if (req.adminAction.body.password) {
      req.adminAction.body.password = '[REDACTED]';
    }
    
    // In production, you might want to save this to a separate audit log collection
    console.log('Admin Action:', JSON.stringify(req.adminAction, null, 2));
    
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
      return res.status(429).json({ 
        error: 'Admin rate limit exceeded. Please slow down.',
        resetTime: userRequests.resetTime
      });
    }
    
    userRequests.count++;
    next();
  };
};

// Middleware to validate admin session
const validateAdminSession = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin session required' });
    }
    
    // Check if session is still valid (not expired due to inactivity)
    const maxInactivityTime = 24 * 60 * 60 * 1000; // 24 hours
    const lastActivity = req.admin.lastActivity || req.admin.lastLogin;
    
    if (lastActivity && (Date.now() - lastActivity.getTime()) > maxInactivityTime) {
      return res.status(401).json({ 
        error: 'Admin session expired due to inactivity',
        lastActivity: lastActivity 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin session validation error:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
};

module.exports = {
  adminAuth,
  checkAdminPermission,
  logAdminAction,
  adminRateLimit,
  validateAdminSession
};