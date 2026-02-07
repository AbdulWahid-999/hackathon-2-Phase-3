import axios, { AxiosResponse } from 'axios';

// Base API URL - use environment variable or default to localhost
const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = envBaseUrl.endsWith('/') ? envBaseUrl.slice(0, -1) : envBaseUrl;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add authentication token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    // Get token from auth_data (same as auth client)
    const stored = localStorage.getItem('auth_data');
    let token = null;

    if (stored) {
      try {
        const tokenData = JSON.parse(stored);
        // Check if token hasn't expired
        if (Date.now() <= tokenData.expiration) {
          token = tokenData.token;
        }
      } catch (e) {
        console.error('Error parsing auth data from localStorage:', e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define API response types
interface ChatMessageResponse {
  message: string;
  intent: string;
  success: boolean;
  operation_result: any;
}

interface ChatHistoryResponse {
  history: Array<{
    id: string;
    user_input: string;
    bot_response: string;
    intent: string;
    timestamp: string;
    session_id: string | null;
  }>;
}

// WebSocket connection for real-time updates
let wsConnection: WebSocket | null = null;
const wsListeners: ((data: any) => void)[] = [];

/**
 * Initialize WebSocket connection for real-time updates
 */
export const initWebSocket = (userId: string): void => {
  // Close existing connection if any
  if (wsConnection) {
    wsConnection.close();
  }

  // Create new WebSocket connection
  const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/${userId}`;

  try {
    wsConnection = new WebSocket(wsUrl);

    wsConnection.onopen = () => {
      console.log('WebSocket connected');
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Notify all listeners
        wsListeners.forEach(listener => listener(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => initWebSocket(userId), 3000);
    };
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
  }
};

/**
 * Add a listener for WebSocket messages
 */
export const addWebSocketListener = (listener: (data: any) => void): void => {
  wsListeners.push(listener);
};

/**
 * Remove a listener for WebSocket messages
 */
export const removeWebSocketListener = (listener: (data: any) => void): void => {
  const index = wsListeners.indexOf(listener);
  if (index !== -1) {
    wsListeners.splice(index, 1);
  }
};

/**
 * Send a chat message to the backend
 */
export const sendChatMessage = async (
  message: string,
  userId?: string
): Promise<ChatMessageResponse> => {
  try {
    const response: AxiosResponse<ChatMessageResponse> = await apiClient.post('/chat/send', {
      message,
      session_id: userId || null,
    });

    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get chat history for the current user
 */
export const getChatHistory = async (): Promise<ChatHistoryResponse> => {
  try {
    const response: AxiosResponse<ChatHistoryResponse> = await apiClient.get('/chat/history');
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

/**
 * Resolve intent without executing the operation
 */
export const resolveIntent = async (input: string): Promise<any> => {
  try {
    const response = await apiClient.post('/chat/intent-resolution', {
      input,
    });
    return response.data;
  } catch (error) {
    console.error('Error resolving intent:', error);
    throw error;
  }
};

// Export the API client for direct use if needed
export default apiClient;