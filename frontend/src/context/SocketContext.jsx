// frontend/src/context/SocketContext.jsx
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

    // Online users
    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    // Typing users
    newSocket.on('typing-users', (users) => {
      setTypingUsers(users);
    });

    // User info
    newSocket.on('user-info', (userInfo) => {
      setUser(userInfo);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const value = {
    socket,
    connected,
    messages,
    onlineUsers,
    typingUsers,
    pinnedMessages,
    user,
    setMessages,
    setPinnedMessages,
    setUser,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
