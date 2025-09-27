import React, { useState } from 'react';

const EMOJIS = ['😀', '😂', '😍', '😢', '👍', '🔥', '🎉', '😮', '🙏', '😡'];

const EmojiReactions = ({ onReact, reactions = {}, messageId }) => {
	const [showPicker, setShowPicker] = useState(false);

	const handleEmojiClick = (emoji) => {
		setShowPicker(false);
		if (onReact) onReact(messageId, emoji);
	};

	return (
		<div className="relative inline-block">
			<button
				className="px-2 py-1 text-xl bg-gray-100 rounded hover:bg-gray-200"
				onClick={() => setShowPicker(!showPicker)}
				title="Add Reaction"
			>
				😊
			</button>
			{showPicker && (
				<div className="absolute z-10 bg-white border rounded shadow p-2 mt-2 flex flex-wrap w-48">
					{EMOJIS.map(emoji => (
						<button
							key={emoji}
							className="text-2xl m-1 hover:bg-gray-100 rounded"
							onClick={() => handleEmojiClick(emoji)}
						>
							{emoji}
						</button>
					))}
				</div>
			)}
			<div className="flex space-x-1 mt-2">
				{Object.entries(reactions).map(([emoji, count]) => (
					<span key={emoji} className="text-xl bg-gray-200 rounded px-2 py-1">
						{emoji} {count}
					</span>
				))}
			</div>
		</div>
	);
};

export default EmojiReactions;
