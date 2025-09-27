// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ChatRoom from './components/chat/ChatRoom';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<ChatRoom />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;

// frontend/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    // Message events
    newSocket.on('message-received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('recent-messages', (recentMessages) => {
      setMessages(recentMessages);
    });

    newSocket.on('message-deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    newSocket.on('message-pin-updated', ({ messageId, isPinned }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isPinned } : msg
      ));
      
      if (isPinned) {
        const message = messages.find(msg => msg._id === messageId);
        if (message) {
          setPinnedMessages(prev => [...prev, message]);
        }
      } else {
        setPinnedMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    });

    // Reaction events
    newSocket.on('reaction-updated', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, reactions } : msg
      ));
    });

    // User events
    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user-joined', (user) => {
      setOnlineUsers(prev => [...prev, user]);
    });

    newSocket.on('user-left', ({ username, id }) => {
      setOnlineUsers(prev => prev.filter(user => user.id !== id));
    });

    // Typing events
    newSocket.on('user-typing', (user) => {
      setTypingUsers(prev => {
        const exists = prev.find(u => u.username === user.username);
        if (!exists) {
          return [...prev, user];
        }
        return prev;
      });
    });

    newSocket.on('user-stop-typing', ({ username }) => {
      setTypingUsers(prev => prev.filter(user => user.username !== username));
    });

    // Admin events
    newSocket.on('admin-announcement', (announcement) => {
      // Show announcement notification
      console.log('Admin announcement:', announcement);
    });

    newSocket.on('user-banned', (data) => {
      alert(`You have been banned: ${data.reason}`);
      window.location.reload();
    });

    newSocket.on('user-kicked', (data) => {
      alert(`You have been kicked: ${data.reason}`);
      window.location.reload();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinChat = (userData) => {
    if (socket && connected) {
      socket.emit('join-chat', userData);
      setUser(userData);
    }
  };

  const sendMessage = (messageData) => {
    if (socket && connected) {
      socket.emit('new-message', messageData);
    }
  };

  const toggleReaction = (messageId, emoji) => {
    if (socket && connected) {
      socket.emit('toggle-reaction', { messageId, emoji });
    }
  };

  const startTyping = () => {
    if (socket && connected) {
      socket.emit('typing-start');
    }
  };

  const stopTyping = () => {
    if (socket && connected) {
      socket.emit('typing-stop');
    }
  };

  const value = {
    socket,
    connected,
    messages,
    onlineUsers,
    typingUsers,
    pinnedMessages,
    user,
    joinChat,
    sendMessage,
    toggleReaction,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// frontend/src/context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check if user has a preference in localStorage
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// frontend/src/index.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .chat-bubble {
    @apply max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl;
  }
  
  .chat-bubble-user {
    @apply bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 shadow-lg;
  }
  
  .chat-bubble-other {
    @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-md px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-600;
  }
  
  .message-time {
    @apply text-xs text-gray-500 dark:text-gray-400 mt-1;
  }
  
  .online-indicator {
    @apply absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full;
  }
  
  .typing-indicator {
    @apply flex space-x-1;
  }
  
  .typing-dot {
    @apply w-2 h-2 bg-gray-400 rounded-full animate-bounce;
    animation-delay: 0ms;
  }
  
  .typing-dot:nth-child(2) {
    animation-delay: 150ms;
  }
  
  .typing-dot:nth-child(3) {
    animation-delay: 300ms;
  }
  
  .pinned-message {
    @apply border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20;
  }
  
  .voice-waveform {
    @apply flex items-center space-x-1;
  }
  
  .wave-bar {
    @apply w-1 bg-blue-500 rounded-full;
    animation: wave 1.5s infinite ease-in-out;
  }
  
  .wave-bar:nth-child(1) { animation-delay: -1.2s; }
  .wave-bar:nth-child(2) { animation-delay: -1.1s; }
  .wave-bar:nth-child(3) { animation-delay: -1.0s; }
  .wave-bar:nth-child(4) { animation-delay: -0.9s; }
  .wave-bar:nth-child(5) { animation-delay: -0.8s; }
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1.0);
  }
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Animations */
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out;
}

.animate-slide-in-down {
  animation: slideInDown 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-pulse-slow {
  animation: pulse 2s infinite;
}