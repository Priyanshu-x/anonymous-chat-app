// frontend/src/utils/helpers.js - Basic helper functions
export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const messageDate = new Date(date);
  const diff = now.getTime() - messageDate.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // More than 24 hours
  return messageDate.toLocaleDateString();
};