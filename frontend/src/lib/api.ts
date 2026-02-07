// Inline basic security utilities to avoid import issues
class BasicSecurityUtils {
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/<[^>]*(>|$)/g, (tag) => tag.replace(/\/\*|\*\//g, '')) // Remove comments
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isSafeString(str: string): boolean {
    if (typeof str !== 'string') return false;

    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /expression\(/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(str));
  }
}

// Helper function to sanitize values to prevent XSS
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Basic XSS prevention - remove potentially dangerous content
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  return value;
}

// Helper function to convert snake_case to camelCase with sanitization
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return sanitizeValue(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }

  if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }

  const convertedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      convertedObj[camelKey] = snakeToCamel(sanitizeValue(obj[key]));
    }
  }
  return convertedObj;
}

// Helper function to convert camelCase to snake_case with sanitization
function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return sanitizeValue(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }

  if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }

  const convertedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      convertedObj[snakeKey] = camelToSnake(sanitizeValue(obj[key]));
    }
  }
  return convertedObj;
}

// Types for Todo API
export interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

// API Client for Todo operations
class TodoApiClient {
  private baseUrl: string;

  constructor() {
    // Ensure baseUrl doesn't end with a slash to prevent double slashes in URLs
    const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    this.baseUrl = envBaseUrl.endsWith('/') ? envBaseUrl.slice(0, -1) : envBaseUrl;
  }

  private isClientSide(): boolean {
    return typeof window !== 'undefined';
  }

  private getAuthHeaders(): { [key: string]: string } {
    // Only get token from localStorage if on client side
    let token = null;
    if (this.isClientSide()) {
      // Use the same secure token retrieval method
      try {
        const stored = localStorage.getItem('auth_data');
        if (stored) {
          const tokenData = JSON.parse(stored);

          // Validate token hasn't expired
          if (Date.now() <= tokenData.expiration) {
            token = tokenData.token;
          } else {
            // Token expired, remove it
            localStorage.removeItem('auth_data');
          }
        }
      } catch {
        // If parsing fails, remove the corrupted data
        localStorage.removeItem('auth_data');
      }
    }

    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }
    return { 'Content-Type': 'application/json' };
  }

  // Get all todos
  async getTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/todos`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
      }

      const data = await response.json();
      // Convert snake_case keys to camelCase
      return Array.isArray(data) ? data.map(snakeToCamel) : [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  // Create a new todo
  async createTodo(todoData: CreateTodoData): Promise<Todo> {
    try {
      // Sanitize input data to prevent XSS
      const sanitizedData = {
        ...todoData,
        title: typeof todoData.title === 'string' ? BasicSecurityUtils.sanitizeInput(todoData.title) : todoData.title,
        description: typeof todoData.description === 'string' ? BasicSecurityUtils.sanitizeInput(todoData.description) : todoData.description
      };

      // Validate input to ensure safety
      if (typeof sanitizedData.title === 'string' && !BasicSecurityUtils.isSafeString(sanitizedData.title)) {
        throw new Error('Unsafe content detected in title');
      }

      if (typeof sanitizedData.description === 'string' && !BasicSecurityUtils.isSafeString(sanitizedData.description)) {
        throw new Error('Unsafe content detected in description');
      }

      const response = await fetch(`${this.baseUrl}/todos`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(camelToSnake(sanitizedData))
      });

      if (!response.ok) {
        throw new Error(`Failed to create todo: ${response.statusText}`);
      }

      const result = await response.json();
      // Convert snake_case keys to camelCase
      const convertedResult = snakeToCamel(result);

      // Ensure the created todo has all required properties
      return {
        ...convertedResult,
        createdAt: new Date(convertedResult.createdAt),
        updatedAt: new Date(convertedResult.updatedAt)
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  // Get a specific todo by ID
  async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch todo: ${response.statusText}`);
      }

      const result = await response.json();
      // Convert snake_case keys to camelCase
      return snakeToCamel(result);
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  }

  // Update a todo
  async updateTodo(id: string, todoData: UpdateTodoData): Promise<Todo> {
    try {
      // Validate the ID to prevent injection attacks
      if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
        throw new Error('Invalid todo ID format');
      }

      // Sanitize input data to prevent XSS
      const sanitizedData = {
        ...todoData,
        title: typeof todoData.title === 'string' ? BasicSecurityUtils.sanitizeInput(todoData.title) : todoData.title,
        description: typeof todoData.description === 'string' ? BasicSecurityUtils.sanitizeInput(todoData.description) : todoData.description
      };

      // Validate input to ensure safety
      if (typeof sanitizedData.title === 'string' && !BasicSecurityUtils.isSafeString(sanitizedData.title)) {
        throw new Error('Unsafe content detected in title');
      }

      if (typeof sanitizedData.description === 'string' && !BasicSecurityUtils.isSafeString(sanitizedData.description)) {
        throw new Error('Unsafe content detected in description');
      }

      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(camelToSnake(sanitizedData))
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.statusText}`);
      }

      const result = await response.json();
      // Convert snake_case keys to camelCase and sanitize response
      return snakeToCamel(result);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    try {
      // Validate the ID to prevent injection attacks
      if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
        throw new Error('Invalid todo ID format');
      }

      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const todoApi = new TodoApiClient();

