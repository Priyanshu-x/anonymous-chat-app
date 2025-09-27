// frontend/src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import AdminStats from './AdminStats';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Shield,
  Send,
  Pin,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [adminUser, setAdminUser] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      navigate('/admin');
      return;
    }
    
    setAdminUser(JSON.parse(user));
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin');
  };

  const sendAnnouncement = async () => {
    if (!announcement.trim()) return;
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/announcement', {
        content: announcement,
        type: 'info'
      });
      setAnnouncement('');
      alert('Announcement sent successfully!');
    } catch (error) {
      alert('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'stats', name: 'Statistics', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {adminUser.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                View Chat
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send Announcement
                </label>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type your announcement here..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={sendAnnouncement}
                disabled={!announcement.trim() || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'messages' && <MessageManagement />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

// Message Management Component
const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chat/messages?limit=100');
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      alert('Message deleted successfully');
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  const togglePin = async (messageId, isPinned) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/messages/${messageId}/pin`);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isPinned: !isPinned } : msg
      ));
      alert(`Message ${!isPinned ? 'pinned' : 'unpinned'} successfully`);
    } catch (error) {
      alert('Failed to update message');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Messages ({messages.length})
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {messages.map((message) => (
          <div key={message._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={message.user.avatar}
                    alt={message.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {message.user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {message.isPinned && (
                    <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 break-words">
                  {message.content || `[${message.type} message]`}
                </p>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => togglePin(message._id, message.isPinned)}
                  className={`p-2 rounded-lg transition-colors ${
                    message.isPinned
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={message.isPinned ? 'Unpin message' : 'Pin message'}
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteMessage(message._id)}
                  className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Settings Component
const AdminSettings = () => {
  const [settings, setSettings] = useState({
    messageExpiry: 24,
    maxFileSize: 10,
    allowImages: true,
    allowVoice: true,
    allowStickers: true,
    maxUsersOnline: 100,
    rateLimitMessages: 10,
    rateLimitWindow: 60
  });
  
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Chat Settings
      </h3>
      
      <div className="space-y-6">
        {/* Message Settings */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Message Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Expiry (hours)
              </label>
              <input
                type="number"
                value={settings.messageExpiry}
                onChange={(e) => handleSettingChange('messageExpiry', parseInt(e.target.value))}
                min="1"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Enabled Features</h4>
          <div className="space-y-3">
            {[
              { key: 'allowImages', label: 'Allow Image Uploads' },
              { key: 'allowVoice', label: 'Allow Voice Messages' },
              { key: 'allowStickers', label: 'Allow Stickers' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => handleSettingChange(key, e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rate Limiting */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rate Limiting</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Messages per Window
              </label>
              <input
                type="number"
                value={settings.rateLimitMessages}
                onChange={(e) => handleSettingChange('rateLimitMessages', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rate Limit Window (seconds)
              </label>
              <input
                type="number"
                value={settings.rateLimitWindow}
                onChange={(e) => handleSettingChange('rateLimitWindow', parseInt(e.target.value))}
                min="10"
                max="3600"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* User Limits */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">User Limits</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Users Online
            </label>
            <input
              type="number"
              value={settings.maxUsersOnline}
              onChange={(e) => handleSettingChange('maxUsersOnline', parseInt(e.target.value))}
              min="10"
              max="1000"
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// frontend/src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Ban, UserX, MoreVertical } from 'lucide-react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const kickUser = async (userId) => {
    if (!confirm('Are you sure you want to kick this user?')) return;
    
    setActionLoading(userId);
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/kick`);
      setUsers(prev => prev.filter(user => user._id !== userId));
      alert('User kicked successfully');
    } catch (error) {
      alert('Failed to kick user');
    } finally {
      setActionLoading(null);
    }
  };

  const banUser = async (userId, duration = 24) => {
    if (!confirm(`Are you sure you want to ban this user for ${duration} hours?`)) return;
    
    setActionLoading(userId);
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/ban`, { duration });
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isBanned: true } : user
      ));
      alert(`User banned for ${duration} hours`);
    } catch (error) {
      alert('Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Active Users ({users.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Messages</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {user._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p>{new Date(user.joinedAt).toLocaleDateString()}</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {new Date(user.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                    {user.messageCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.isBanned ? (
                    <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                      Banned
                    </span>
                  ) : (
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                      Online
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => kickUser(user._id)}
                      disabled={actionLoading === user._id || user.isBanned}
                      className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Kick user"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => banUser(user._id)}
                      disabled={actionLoading === user._id || user.isBanned}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Ban user"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No users currently online
        </div>
      )}
    </div>
  );
};

export default UserManagement;

// frontend/src/components/admin/AdminStats.jsx
import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Mic, Image, Pin, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        Failed to load statistics
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Users,
      color: 'green',
      description: 'Currently online'
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'blue',
      description: 'All time'
    },
    {
      title: 'Voice Messages',
      value: stats.voiceMessages,
      icon: Mic,
      color: 'purple',
      description: 'Total sent'
    },
    {
      title: 'Images Shared',
      value: stats.imageMessages,
      icon: Image,
      color: 'orange',
      description: 'Total uploaded'
    },
    {
      title: 'Pinned Messages',
      value: stats.pinnedMessages,
      icon: Pin,
      color: 'yellow',
      description: 'Currently pinned'
    },
    {
      title: 'Messages (24h)',
      value: stats.messagesLast24h,
      icon: TrendingUp,
      color: 'red',
      description: 'Last 24 hours'
    }
  ];

  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Statistics Overview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          System Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Server Uptime:</span>
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {Math.floor(process.uptime?.() / 3600) || 0}h {Math.floor((process.uptime?.() % 3600) / 60) || 0}m
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Message Cleanup:</span>
            <span className="ml-2 text-green-600 dark:text-green-400 font-medium">Active</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
            <span className="ml-2 text-gray-900 dark:text-white font-medium">~0.5 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;