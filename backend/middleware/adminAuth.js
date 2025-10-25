// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided', 401);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.adminId);
    
    if (!admin) {
      throw new Error('Invalid token', 401);
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminAuth;