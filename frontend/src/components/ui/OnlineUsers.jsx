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

