import React from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, currentUserId, onReact }) => {
	return (
		<div className="overflow-y-auto h-full p-4 flex flex-col-reverse">
			{messages && messages.length > 0 ? (
				messages.map(msg => (
					<MessageBubble
						key={msg._id}
						message={msg}
						isOwn={msg.user?._id === currentUserId}
						onReact={onReact}
					/>
				))
			) : (
				<div className="text-gray-500 text-center">No messages yet.</div>
			)}
		</div>
	);
};

export default MessageList;
