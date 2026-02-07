import { useState, useCallback } from 'react';
import { sendChatMessage, getChatHistory, resolveIntent } from '../services/api';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string, userId?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, userId?: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to the chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Send the message to the backend
      const response = await sendChatMessage(message, userId);

      // Add bot response to the chat
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');

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
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, we would fetch chat history from the API
      // const history = await getChatHistory();
      // For now, we'll just initialize with an empty state
      setMessages([]);
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError('Failed to load chat history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    loadHistory,
  };
};