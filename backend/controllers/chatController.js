const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
	try {
		const { user, content, type, imageUrl, voiceUrl } = req.body;
		const message = new Message({
			user,
			content,
			type,
			imageUrl,
			voiceUrl
		});
		await message.save();
		res.status(201).json(message);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.uploadImage = (req, res) => {
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
};

exports.uploadVoice = (req, res) => {
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
};

exports.getMessages = async (req, res) => {
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
};

exports.getPinnedMessages = async (req, res) => {
	try {
		const pinnedMessages = await Message.find({ isPinned: true })
			.populate('user', 'username avatar')
			.sort({ createdAt: -1 })
			.limit(10);
		res.json(pinnedMessages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
