// frontend/src/components/ui/PinnedMessages.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from '../chat/MessageBubble';
import { Pin } from 'lucide-react';
import api from '../../utils/api';

const PinnedMessages = () => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinnedMessages = async () => {
      try {
  const response = await api.get('/api/chat/pinned');
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

