// backend/routes/chat.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'voice') {
      cb(null, 'uploads/voice/');
    } else if (file.fieldname === 'file') {
      cb(null, 'uploads/files/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else if (file.fieldname === 'voice') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    } else if (file.fieldname === 'file') {
      // Accept any file type for generic file uploads
      cb(null, true);
    } else {
      cb(new Error('Invalid file field'));
    }
  }
});
// Upload generic file
router.post('/upload/file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      fileUrl: `/uploads/files/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
router.post('/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      fileUrl: `/uploads/images/${req.file.filename}`,
      fileName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload voice message
router.post('/upload/voice', upload.single('voice'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      fileUrl: `/uploads/voice/${req.file.filename}`,
      fileName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages with pagination
router.get('/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pinned messages
router.get('/pinned', async (req, res) => {
  try {
    const pinnedMessages = await Message.find({ isPinned: true })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(pinnedMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;