import React from 'react';
import EmojiReactions from './EmojiReactions';

const MessageBubble = ({ message, isOwn, onReact }) => {
	const { user, content, type, imageUrl, voiceUrl, reactions = {} } = message;
	return (
		<div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
			<div className={`max-w-xs p-3 rounded-lg shadow ${isOwn ? 'bg-blue-100' : 'bg-gray-100'}`}>
				<div className="flex items-center mb-2">
					<img src={user?.avatar} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
					<span className="font-semibold text-sm">{user?.username}</span>
				</div>
				{type === 'text' && <div className="mb-2 text-base">{content}</div>}
				{type === 'image' && imageUrl && (
					<img src={imageUrl} alt="chat-img" className="mb-2 max-w-full rounded" />
				)}
				{type === 'voice' && voiceUrl && (
					<audio controls src={voiceUrl} className="mb-2 w-full" />
				)}
				<EmojiReactions
					messageId={message._id}
					reactions={reactions}
					onReact={onReact}
				/>
			</div>
		</div>
	);
};

export default MessageBubble;
