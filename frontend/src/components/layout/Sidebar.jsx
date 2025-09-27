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

