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