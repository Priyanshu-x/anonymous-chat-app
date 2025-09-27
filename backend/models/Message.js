const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	content: { type: String },
	type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
	imageUrl: { type: String },
	voiceUrl: { type: String },
	isPinned: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
