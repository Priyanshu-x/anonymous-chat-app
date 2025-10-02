const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  type: { type: String, enum: ['text', 'image', 'voice', 'file'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  reactions: [
    {
      emoji: { type: String, required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }
  ]
});

module.exports = mongoose.model('Message', MessageSchema);
