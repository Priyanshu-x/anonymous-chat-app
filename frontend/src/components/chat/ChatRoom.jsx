// frontend/src/components/chat/ChatRoom.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import UserJoin from '../ui/UserJoin';
import PinnedMessages from '../ui/PinnedMessages';
import { Users, Pin, X } from 'lucide-react';

const ChatRoom = () => {
  const { user, connected } = useSocket();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [showUserJoin, setShowUserJoin] = useState(!user);

  useEffect(() => {
    if (user) {
      setShowUserJoin(false);
    }
  }, [user]);

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* User Join Modal */}
      {showUserJoin && (
        <UserJoin onClose={() => setShowUserJoin(false)} />
      )}

      {/* Header */}
      <Header 
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onTogglePinned={() => setShowPinned(!showPinned)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Pinned Messages */}
          {showPinned && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-2">
                  <Pin className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Pinned Messages
                  </span>
                </div>
                <button
                  onClick={() => setShowPinned(false)}
                  className="text-yellow-600 hover:text-yellow-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <PinnedMessages />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageList />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <MessageInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;