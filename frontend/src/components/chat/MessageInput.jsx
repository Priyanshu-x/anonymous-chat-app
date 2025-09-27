// frontend/src/components/chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import StickerPicker from './StickerPicker';
import { Send, Image, Mic, MicOff, Smile, Paperclip, X } from 'lucide-react';
import axios from 'axios';

const MessageInput = () => {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    startTyping();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || isUploading) return;

    let messageData = {
      content: message.trim(),
      type: 'text'
    };

    // Handle file upload
    if (selectedFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        
        if (selectedFile.type.startsWith('image/')) {
          formData.append('image', selectedFile);
          const response = await axios.post('http://localhost:5000/api/chat/upload/image', formData);
          messageData.type = 'image';
          messageData.fileUrl = response.data.fileUrl;
          messageData.fileName = response.data.fileName;
        } else if (selectedFile.type.startsWith('audio/')) {
          formData.append('voice', selectedFile);
          const response = await axios.post('http://localhost:5000/api/chat/upload/voice', formData);
          messageData.type = 'voice';
          messageData.fileUrl = response.data.fileUrl;
          messageData.fileName = response.data.fileName;
        }
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload file');
        setIsUploading(false);
        return;
      }
    }

    sendMessage(messageData);
    setMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    setIsUploading(false);
    stopTyping();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        setSelectedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStickerSelect = (sticker) => {
    sendMessage({
      type: 'sticker',
      fileUrl: sticker.url,
      content: sticker.name
    });
    setShowStickers(false);
  };

  return (
    <div className="relative">
      {/* Sticker Picker */}
      {showStickers && (
        <div className="absolute bottom-full mb-2 left-4 right-4">
          <StickerPicker 
            onSelect={handleStickerSelect}
            onClose={() => setShowStickers(false)}
          />
        </div>
      )}

      {/* File Preview */}
      {(filePreview || selectedFile) && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {filePreview ? (
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                  <Mic className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile?.name || 'Voice message'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2 p-4">
        {/* Action Buttons */}
        <div className="flex space-x-1">
          {/* Image Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
            disabled={isUploading}
          >
            <Image className="h-5 w-5" />
          </button>

          {/* Voice Recording */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Stickers */}
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            disabled={isRecording || isUploading}
            className="w-full resize-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            rows={1}
          />
          
          {isRecording && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;

// frontend/src/components/chat/VoiceMessage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const VoiceMessage = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const [waveformBars] = useState(Array.from({ length: 20 }, () => Math.random() * 100 + 10));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-3 py-2 min-w-0">
      <audio
        ref={audioRef}
        src={`http://localhost:5000${message.fileUrl}`}
        preload="metadata"
      />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="flex-shrink-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      {/* Waveform */}
      <div className="flex-1 min-w-0">
        <div className="relative h-8 flex items-center space-x-1 overflow-hidden">
          {waveformBars.map((height, index) => {
            const isActive = progress > (index / waveformBars.length) * 100;
            return (
              <div
                key={index}
                className={`w-1 rounded-full transition-colors duration-150 ${
                  isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ height: `${Math.max(height / 3, 8)}px` }}
              />
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 font-mono">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};

export default VoiceMessage;

// frontend/src/components/chat/StickerPicker.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const StickerPicker = ({ onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('emoji');

  // Sample sticker data - in a real app, this would come from an API
  const stickerCategories = {
    emoji: [
      { id: 1, name: '😀', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">😀</text></svg>' },
      { id: 2, name: '😂', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">😂</text></svg>' },
      { id: 3, name: '🥰', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🥰</text></svg>' },
      { id: 4, name: '😎', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">😎</text></svg>' },
      { id: 5, name: '🤔', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🤔</text></svg>' },
      { id: 6, name: '😴', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">😴</text></svg>' },
    ],
    animals: [
      { id: 7, name: '🐶', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐶</text></svg>' },
      { id: 8, name: '🐱', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐱</text></svg>' },
      { id: 9, name: '🦄', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦄</text></svg>' },
      { id: 10, name: '🐼', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐼</text></svg>' },
    ],
    food: [
      { id: 11, name: '🍕', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍕</text></svg>' },
      { id: 12, name: '🍔', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍔</text></svg>' },
      { id: 13, name: '🍰', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍰</text></svg>' },
      { id: 14, name: '🍎', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍎</text></svg>' },
    ]
  };

  const categories = Object.keys(stickerCategories);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Stickers</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
        {stickerCategories[selectedCategory]?.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => onSelect(sticker)}
            className="w-12 h-12 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center text-2xl"
          >
            {sticker.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;

// frontend/src/components/chat/EmojiReactions.jsx
import React from 'react';

const EmojiReactions = ({ reactions, onReactionClick }) => {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <button
          key={emoji}
          onClick={() => onReactionClick(emoji)}
          className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full px-2 py-1 text-xs transition-colors"
          title={`${reactionList.map(r => r.user.username).join(', ')} reacted with ${emoji}`}
        >
          <span>{emoji}</span>
          <span className="text-gray-600 dark:text-gray-400">{reactionList.length}</span>
        </button>
      ))}
    </div>
  );
};

export default EmojiReactions;