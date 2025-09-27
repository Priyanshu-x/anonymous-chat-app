// backend/routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const Message = require('../models/Message');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    let admin = await AdminUser.findOne({ username });
    if (!admin) {
      // Create default admin if doesn't exist
      if (username === process.env.ADMIN_USERNAME) {
        admin = new AdminUser({
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD
        });
        await admin.save();
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const stats = {
      activeUsers: await User.countDocuments(),
      totalMessages: await Message.countDocuments(),
      voiceMessages: await Message.countDocuments({ type: 'voice' }),
      imageMessages: await Message.countDocuments({ type: 'image' }),
      pinnedMessages: await Message.countDocuments({ isPinned: true }),
      messagesLast24h: await Message.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar joinedAt messageCount isBanned')
      .sort({ joinedAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban user
router.post('/users/:userId/ban', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { duration = 24 } = req.body; // hours
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isBanned = true;
    user.bannedUntil = new Date(Date.now() + duration * 60 * 60 * 1000);
    await user.save();
    
    // Emit ban event to socket
    const { io } = require('../server');
    io.to(user.socketId).emit('user-banned', {
      reason: 'Banned by administrator',
      duration: duration
    });
    
    res.json({ message: 'User banned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kick user
router.post('/users/:userId/kick', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Emit kick event to socket
    const { io } = require('../server');
    io.to(user.socketId).emit('user-kicked', {
      reason: 'Kicked by administrator'
    });
    
    // Disconnect the user
    io.sockets.sockets.get(user.socketId)?.disconnect();
    
    res.json({ message: 'User kicked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', adminAuth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Emit message deletion to all clients
    const { io } = require('../server');
    io.emit('message-deleted', { messageId });
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle pin message
router.patch('/messages/:messageId/pin', adminAuth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.isPinned = !message.isPinned;
    await message.save();
    
    // Emit pin update to all clients
    const { io } = require('../server');
    io.emit('message-pin-updated', {
      messageId,
      isPinned: message.isPinned
    });
    
    res.json({ message: `Message ${message.isPinned ? 'pinned' : 'unpinned'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Broadcast announcement
router.post('/announcement', adminAuth, async (req, res) => {
  try {
    const { content, type = 'info' } = req.body;
    
    // Emit announcement to all clients
    const { io } = require('../server');
    io.emit('admin-announcement', {
      content,
      type,
      timestamp: new Date()
    });
    
    res.json({ message: 'Announcement sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

