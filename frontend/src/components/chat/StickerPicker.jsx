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

