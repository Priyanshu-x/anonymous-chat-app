// frontend/src/components/layout/Header.jsx
import React from 'react';
import { useSocket } from '../../context/SocketContext';
import ThemeToggle from '../ui/ThemeToggle';
import { Menu, Users, Pin, Settings } from 'lucide-react';

const Header = ({ onToggleSidebar, onTogglePinned }) => {
  const { onlineUsers } = useSocket();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Anonymous Chat
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome to the community
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {/* Online users count */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">{onlineUsers.length} online</span>
        </div>

        {/* Pinned messages toggle */}
        <button
          onClick={onTogglePinned}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Toggle pinned messages"
        >
          <Pin className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Settings */}
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;

// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { useSocket } from '../../context/SocketContext';
import OnlineUsers from '../ui/OnlineUsers';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { onlineUsers } = useSocket();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          <OnlineUsers users={onlineUsers} />
          
          {/* Chat Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Messages auto-delete after 24 hours
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Stay respectful and have fun! 🎉
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

// frontend/src/components/ui/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;

// frontend/src/components/ui/OnlineUsers.jsx
import React from 'react';
import Avatar from './Avatar';
import { Users } from 'lucide-react';

const OnlineUsers = ({ users }) => {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Online ({users.length})
        </h3>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="relative">
              <Avatar src={user.avatar} alt={user.username} size="sm" />
              <div className="online-indicator"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Online now
              </p>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No users online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;

// frontend/src/components/ui/Avatar.jsx
import React from 'react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
    />
  );
};

export default Avatar;

// frontend/src/components/ui/UserJoin.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { RefreshCw, User } from 'lucide-react';

const UserJoin = ({ onClose }) => {
  const { joinChat } = useSocket();
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomUser = async () => {
    setIsGenerating(true);
    try {
      const [usernameRes, avatarRes] = await Promise.all([
        axios.get('http://localhost:5000/api/user/username'),
        axios.get('http://localhost:5000/api/user/avatar')
      ]);
      
      setUsername(usernameRes.data.username);
      setAvatar(avatarRes.data.avatar);
    } catch (error) {
      console.error('Failed to generate user data:', error);
      // Fallback
      setUsername(`User${Math.floor(Math.random() * 10000)}`);
      setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateRandomUser();
  }, []);

  const handleJoin = () => {
    if (!username.trim()) return;
    
    joinChat({
      username: username.trim(),
      avatar: avatar
    });
    
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Anonymous Chat!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your identity and start chatting
          </p>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {avatar && (
              <img
                src={avatar}
                alt="Your avatar"
                className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-600"
              />
            )}
            <button
              onClick={generateRandomUser}
              disabled={isGenerating}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              title="Generate new avatar"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Choose your username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              maxLength={20}
            />
            <button
              onClick={generateRandomUser}
              disabled={isGenerating}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Generate random username"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This is how others will see you in the chat
          </p>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={!username.trim() || isGenerating}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Join Chat'}
        </button>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Your messages will automatically delete after 24 hours. Stay respectful and have fun!
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserJoin;

// frontend/src/components/ui/PinnedMessages.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from '../chat/MessageBubble';
import { Pin } from 'lucide-react';
import axios from 'axios';

const PinnedMessages = () => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinnedMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chat/pinned');
        setPinnedMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch pinned messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedMessages();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (pinnedMessages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <Pin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No pinned messages</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
      {pinnedMessages.map((message) => (
        <div key={message._id} className="pinned-message p-3 rounded-lg">
          <MessageBubble 
            message={message} 
            isOwnMessage={false} 
            showAvatar={true} 
          />
        </div>
      ))}
    </div>
  );
};

export default PinnedMessages;

// frontend/src/components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', credentials);
      
      // Store token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Access the admin dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Back to Chat */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Chat
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Demo: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;