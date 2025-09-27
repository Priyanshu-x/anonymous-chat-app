const AdminUser = require('../models/AdminUser');
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body;
		let admin = await AdminUser.findOne({ username });
		if (!admin) {
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
		res.status(500).json({ error: error.message });
	}
};

exports.getUsers = async (req, res) => {
	try {
		const users = await User.find()
			.select('username avatar joinedAt messageCount isBanned')
			.sort({ joinedAt: -1 });
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.banUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		user.isBanned = !user.isBanned;
		await user.save();
		res.json({ success: true, isBanned: user.isBanned });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.pinMessage = async (req, res) => {
	try {
		const message = await Message.findById(req.params.id);
		if (!message) return res.status(404).json({ error: 'Message not found' });
		message.isPinned = !message.isPinned;
		await message.save();
		res.json({ success: true, isPinned: message.isPinned });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
