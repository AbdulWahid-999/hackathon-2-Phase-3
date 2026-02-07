'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendChatMessage } from '@/services/api';
import Footer from '@/components/Footer';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

export default function ChatbotPage() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Todo Assistant. You can ask me to add, list, update, complete, or delete your todos. Try saying "Add buy groceries" or "Show my todos"!',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send the message to the backend
      const response = await sendChatMessage(inputValue, user.id);

      // Add bot response to the chat
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to the chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Please log in to access the chatbot</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 shadow-2xl md:mb-8 md:p-8">
          <h1 className="text-2xl font-bold text-gray-200 mb-2 md:text-3xl md:mb-4">
            AI Todo Assistant
          </h1>
          <p className="text-gray-300 text-sm md:text-lg">Manage your tasks with natural language commands</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[60vh] md:h-[70vh]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 md:p-4">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-2 md:mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-sm md:text-base">AI Todo Assistant</h2>
                <p className="text-xs opacity-80 md:text-sm">Ready to help manage your todos</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 custom-scrollbar md:p-4 md:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p className="text-sm md:text-base">Start a conversation by typing a command below!</p>
                <p className="text-xs mt-2 md:text-sm">Try: "Add buy groceries" or "Show my todos"</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`
                      max-w-[85vw] md:max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-3 py-2
                      ${msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'}
                      ${msg.isLoading ? 'opacity-70' : ''}
                    `}
                  >
                    <div className="text-xs md:text-sm whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`
                        text-xs mt-1 text-right
                        ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}
                      `}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl px-3 py-2 rounded-bl-none max-w-xs">
                  <div className="text-xs md:text-sm">Processing...</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 md:p-4">
            <div className="flex items-center space-x-1 md:space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to manage your todos..."
                disabled={isLoading}
                className={`
                  flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600
                  ${isLoading ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed' : ''}
                `}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`
                  bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium
                  flex items-center justify-center text-sm
                  ${(!inputValue.trim() || isLoading)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Examples: "Add groceries", "Show todos", "Complete meeting", "Delete tasks"</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-6 md:grid-cols-4 md:gap-3">
          {[
            { cmd: 'Add groceries', desc: 'New todo' },
            { cmd: 'Show todos', desc: 'List all' },
            { cmd: 'Complete meeting', desc: 'Mark done' },
            { cmd: 'Delete tasks', desc: 'Remove all' }
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => setInputValue(action.cmd)}
              className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-lg p-2 text-left hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-200 hover:shadow-md text-xs"
            >
              <div className="font-medium text-gray-800 dark:text-gray-200">{action.cmd}</div>
              <div className="text-gray-500 dark:text-gray-400 mt-1">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 md:mt-12">
        <Footer />
      </div>
    </div>
  );
}