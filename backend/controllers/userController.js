const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
	try {
		const { username, password, avatar } = req.body;
		if (!username || !password) {
			throw new Error('Username and password required', 400);
		}
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			throw new Error('Username already exists', 409);
		}
		const user = new User({ username, password, avatar });
		await user.save();
		res.status(201).json({ success: true, user: { id: user._id, username: user.username, avatar: user.avatar } });
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			throw new Error('Invalid credentials', 401);
		}
		const isValid = await user.comparePassword(password);
		if (!isValid) {
			throw new Error('Invalid credentials', 401);
		}
		const token = jwt.sign(
			{ userId: user._id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		);
		res.json({ token, user: { id: user._id, username: user.username, avatar: user.avatar } });
	} catch (error) {
		next(error);
	}
};

exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select('username avatar joinedAt messageCount');
		if (!user) throw new Error('User not found', 404);
		res.json(user);
	} catch (error) {
		next(error);
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const { avatar } = req.body;
		const user = await User.findById(req.user.userId);
		if (!user) throw new Error('User not found', 404);
		if (avatar) user.avatar = avatar;
		await user.save();
		res.json({ success: true, avatar: user.avatar });
	} catch (error) {
		next(error);
	}
};
