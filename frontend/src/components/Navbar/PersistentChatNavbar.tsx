'use client';

import React, { useState } from 'react';
import { ChatInterface } from '../ChatBot/ChatInterface';

interface PersistentChatNavbarProps {
  userId?: string;
}

export const PersistentChatNavbar: React.FC<PersistentChatNavbarProps> = ({ userId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setHasUnread(false); // Clear unread status when opening chat
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-lg
          ${isChatOpen ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'}
          text-white transition-all duration-300 transform hover:scale-110
          ${hasUnread ? 'animate-pulse ring-2 ring-yellow-400 ring-opacity-80' : ''}
        `}
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        {isChatOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}

        {/* Unread indicator */}
        {hasUnread && !isChatOpen && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            !
          </span>
        )}
      </button>

      {/* Chat window */}
      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300">
          <div className="flex items-center justify-between bg-indigo-600 text-white p-3">
            <h3 className="font-semibold">AI Todo Assistant</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ChatInterface userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};