const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
	try {
		const { username, password, avatar } = req.body;
		if (!username || !password) {
			return res.status(400).json({ error: 'Username and password required' });
		}
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(409).json({ error: 'Username already exists' });
		}
		const user = new User({ username, password, avatar });
		await user.save();
		res.status(201).json({ success: true, user: { id: user._id, username: user.username, avatar: user.avatar } });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}
		const isValid = await user.comparePassword(password);
		if (!isValid) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}
		const token = jwt.sign(
			{ userId: user._id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		);
		res.json({ token, user: { id: user._id, username: user.username, avatar: user.avatar } });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select('username avatar joinedAt messageCount');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const { avatar } = req.body;
		const user = await User.findById(req.user.userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if (avatar) user.avatar = avatar;
		await user.save();
		res.json({ success: true, avatar: user.avatar });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
