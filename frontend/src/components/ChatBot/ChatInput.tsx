'use client';

import React, { useState, KeyboardEvent, forwardRef } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ onSendMessage, disabled = false, inputRef }, ref) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = () => {
      if (inputValue.trim() && !disabled) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your command (e.g. 'Add buy groceries')"
          disabled={disabled}
          className={`
            flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}
          `}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className={`
            bg-indigo-600 text-white px-4 py-2 rounded-r-lg font-medium
            ${(!inputValue.trim() || disabled)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700 active:bg-indigo-800'}
          `}
        >
          Send
        </button>
      </div>
    );
  }
);

export default ChatInput;