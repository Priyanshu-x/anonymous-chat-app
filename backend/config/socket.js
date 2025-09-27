const { Server } = require('socket.io');
const Message = require('../models/Message');
const User = require('../models/User');

function setupSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		}
	});

	io.on('connection', (socket) => {
		console.log('User connected:', socket.id);

		// Join chat room
		socket.on('join', async ({ userId }) => {
			socket.join('main');
			const user = await User.findById(userId);
			if (user) {
				io.to('main').emit('user:join', { username: user.username, avatar: user.avatar });
			}
		});

		// Handle new message
		socket.on('message', async (data) => {
			const message = new Message(data);
			await message.save();
			io.to('main').emit('message:new', message);
		});

		// Handle disconnect
		socket.on('disconnect', () => {
			console.log('User disconnected:', socket.id);
			io.to('main').emit('user:left', { socketId: socket.id });
		});
	});

	return io;
}

module.exports = setupSocket;
