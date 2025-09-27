// backend/config/socket.js
const socketIo = require('socket.io');
const Message = require('../models/Message');
const User = require('../models/User');

let io;
const activeUsers = new Map();

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on('join-chat', async (userData) => {
      try {
        // Check if user already exists (reconnection)
        let user = await User.findOne({ socketId: socket.id });
        
        if (!user) {
          user = new User({
            socketId: socket.id,
            username: userData.username,
            avatar: userData.avatar,
            joinedAt: new Date(),
            lastActive: new Date()
          });
          await user.save();
        }

        activeUsers.set(socket.id, user);

        // Join a room (for future private messaging feature)
        socket.join('public-chat');

        // Broadcast user joined
        socket.broadcast.emit('user-joined', {
          username: user.username,
          avatar: user.avatar,
          id: user._id
        });

        // Send current online users
        const onlineUsers = Array.from(activeUsers.values()).map(u => ({
          username: u.username,
          avatar: u.avatar,
          id: u._id
        }));
        
        io.emit('online-users', onlineUsers);

        // Send recent messages
        const recentMessages = await Message.find()
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('user', 'username avatar')
          .populate('reactions.user', 'username');
        
        socket.emit('recent-messages', recentMessages.reverse());

        console.log(`User ${user.username} joined the chat`);
      } catch (error) {
        console.error('Error handling user join:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle new message
    socket.on('new-message', async (messageData) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Rate limiting check
        const recentMessages = await Message.countDocuments({
          user: user._id,
          createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
        });

        if (recentMessages >= 10) {
          socket.emit('error', { message: 'Rate limit exceeded' });
          return;
        }

        const message = new Message({
          content: messageData.content,
          type: messageData.type || 'text',
          user: user._id,
          fileUrl: messageData.fileUrl,
          fileName: messageData.fileName,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await message.save();
        await message.populate('user', 'username avatar');

        // Update user message count
        user.messageCount = (user.messageCount || 0) + 1;
        user.lastActive = new Date();
        await user.save();

        // Broadcast message to all users
        io.emit('message-received', {
          _id: message._id,
          content: message.content,
          type: message.type,
          user: message.user,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          createdAt: message.createdAt,
          reactions: message.reactions,
          isPinned: message.isPinned
        });

        console.log(`Message from ${user.username}: ${message.type}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message reaction
    socket.on('toggle-reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const user = activeUsers.get(socket.id);
        if (!user) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const existingReaction = message.reactions.find(r => 
          r.emoji === emoji && r.user.toString() === user._id.toString()
        );

        if (existingReaction) {
          message.reactions.pull(existingReaction._id);
        } else {
          message.reactions.push({
            emoji,
            user: user._id
          });
        }

        await message.save();
        await message.populate('reactions.user', 'username');

        io.emit('reaction-updated', {
          messageId,
          reactions: message.reactions
        });
      } catch (error) {
        console.error('Error handling reaction:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing-start', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user-typing', {
          username: user.username,
          avatar: user.avatar
        });
      }
    });

    socket.on('typing-stop', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user-stop-typing', {
          username: user.username
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const user = activeUsers.get(socket.id);
        if (user) {
          await User.findByIdAndDelete(user._id);
          activeUsers.delete(socket.id);
          
          socket.broadcast.emit('user-left', {
            username: user.username,
            id: user._id
          });

          const onlineUsers = Array.from(activeUsers.values()).map(u => ({
            username: u.username,
            avatar: u.avatar,
            id: u._id
          }));
          
          io.emit('online-users', onlineUsers);
          console.log(`User ${user.username} disconnected`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Handle admin events
    socket.on('admin-action', (data) => {
      // Only emit to admin clients
      socket.broadcast.to('admin-room').emit('admin-notification', data);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const getActiveUsers = () => activeUsers;

module.exports = {
  initializeSocket,
  getIO,
  getActiveUsers
};