const AdminUser = require('../models/AdminUser');
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const admin = await AdminUser.findOne({ username });
		if (!admin) {
			throw new Error('Invalid credentials', 401);
		}
		const isValid = await admin.comparePassword(password);
		if (!isValid) {
			throw new Error('Invalid credentials', 401);
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
		next(error);
	}
};

exports.getStats = async (req, res) => {
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
		next(error);
	}
};

exports.getUsers = async (req, res) => {
	try {
		const users = await User.find()
			.select('username avatar joinedAt messageCount isBanned')
			.sort({ joinedAt: -1 });
		res.json(users);
	} catch (error) {
		next(error);
	}
};

exports.banUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) throw new Error('User not found', 404);
		user.isBanned = !user.isBanned;
		await user.save();
		res.json({ success: true, isBanned: user.isBanned });
	} catch (error) {
		next(error);
	}
};

exports.pinMessage = async (req, res) => {
	try {
		const message = await Message.findById(req.params.id);
		if (!message) throw new Error('Message not found', 404);
		message.isPinned = !message.isPinned;
		await message.save();
		res.json({ success: true, isPinned: message.isPinned });
	} catch (error) {
		next(error);
	}
};
