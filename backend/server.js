// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const Message = require('./models/Message');
const User = require('./models/User');
const AdminUser = require('./models/AdminUser');

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join-chat', async (userData) => {
    try {
      const user = new User({
        socketId: socket.id,
        username: userData.username,
        avatar: userData.avatar,
        joinedAt: new Date(),
        password: Math.random().toString(36).slice(-8) // Dummy password for anonymous users
      });
      
      await user.save();
      activeUsers.set(socket.id, user);

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
        .populate('user', 'username avatar');


      socket.emit('recent-messages', recentMessages.reverse());

      // Send user info to the socket
      console.log(`[join-chat] Emitting user-info to socket ${socket.id}:`, {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        joinedAt: user.joinedAt
      });
      socket.emit('user-info', {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        joinedAt: user.joinedAt
      });
    } catch (error) {
      console.error('Error handling user join:', error);
    }
  });

  // Handle new message
  socket.on('new-message', async (messageData) => {
    try {
      console.log(`[new-message] Received from socket ${socket.id}:`, messageData);
      const user = activeUsers.get(socket.id);
      if (!user) {
        console.warn(`[new-message] No active user found for socket ${socket.id}`);
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

      // Broadcast message to all users
      console.log(`[new-message] Broadcasting message:`, {
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
    } catch (error) {
      console.error('Error handling message:', error);
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
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Cleanup expired messages every hour
setInterval(async () => {
  try {
    await Message.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log('Cleaned up expired messages');
  } catch (error) {
    console.error('Error cleaning up messages:', error);
  }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io, activeUsers };