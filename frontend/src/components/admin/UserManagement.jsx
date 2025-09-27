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

