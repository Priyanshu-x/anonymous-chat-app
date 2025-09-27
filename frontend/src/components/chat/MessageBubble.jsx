// frontend/src/components/chat/MessageBubble.jsx
import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import VoiceMessage from './VoiceMessage';
import EmojiReactions from './EmojiReactions';
import { Pin, MoreVertical, Copy, Reply } from 'lucide-react';

const MessageBubble = ({ message, isOwnMessage, showAvatar }) => {
  const { toggleReaction } = useSocket();
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReaction = (emoji) => {
    toggleReaction(message._id, emoji);
    setShowReactions(false);
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>
        );
      
      case 'image':
        return (
          <div className="relative">
            <img
              src={`http://localhost:5000${message.fileUrl}`}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                // Open image in modal/new tab
                window.open(`http://localhost:5000${message.fileUrl}`, '_blank');
              }}
            />
            {message.content && (
              <p className="text-sm mt-2 break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>
        );
      
      case 'voice':
        return <VoiceMessage message={message} />;
      
      case 'sticker':
        return (
          <div className="relative">
            <img
              src={`http://localhost:5000${message.fileUrl}`}
              alt="Sticker"
              className="w-24 h-24 object-contain"
            />
          </div>
        );
      
      default:
        return <p className="text-sm">Unsupported message type</p>;
    }
  };

  return (
    <div className={`flex items-end space-x-2 group ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <img
          src={message.user.avatar}
          alt={message.user.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}
      {showAvatar && isOwnMessage && <div className="w-8" />}

      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs md:max-w-md lg:max-w-lg`}>
        {/* Username and time */}
        {showAvatar && (
          <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {isOwnMessage ? 'You' : message.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            {message.isPinned && (
              <Pin className="h-3 w-3 text-yellow-500" />
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={`
              ${isOwnMessage ? 'chat-bubble-user' : 'chat-bubble-other'}
              relative group-hover:shadow-lg transition-shadow duration-200
            `}
            onDoubleClick={() => setShowReactions(!showReactions)}
          >
            {renderMessageContent()}
            
            {/* Message menu */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-600 text-white rounded-full p-1 shadow-lg"
            >
              <MoreVertical className="h-3 w-3" />
            </button>

            {showMenu && (
              <div className="absolute top-6 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => {
                    setShowReactions(!showReactions);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                >
                  <span>😊</span>
                  <span>React</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick reaction picker */}
          {showReactions && (
            <div className="absolute top-full mt-1 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1 flex space-x-1 z-10 animate-slide-in-up">
              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform duration-200"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <EmojiReactions 
              reactions={message.reactions} 
              onReactionClick={handleReaction}
            />
          )}
        </div>
      </div>

      {/* Spacing for own messages */}
      {!showAvatar && isOwnMessage && <div className="w-8" />}
    </div>
  );
};

export default MessageBubble;
