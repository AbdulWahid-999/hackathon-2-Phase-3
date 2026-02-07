'use client';

import React from 'react';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  sender,
  timestamp,
  isLoading = false
}) => {
  const isUser = sender === 'user';

  // Format time for display
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-2
          ${isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'}
          ${isLoading ? 'opacity-70' : ''}
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm ml-2">Processing...</span>
          </div>
        ) : (
          <div className="text-sm animate-fadeIn">{content}</div>
        )}
        {!isLoading && (
          <div
            className={`
              text-xs mt-1 text-right
              ${isUser ? 'text-indigo-200' : 'text-gray-500'}
            `}
          >
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};