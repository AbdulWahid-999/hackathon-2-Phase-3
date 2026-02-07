// Types for authentication
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

// Inline basic security utilities to avoid import issues
class BasicSecurityUtils {
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
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

// Authentication API client
class AuthClient {
  private static instance: AuthClient;
  private token: string | null = null;
  private user: User | null = null;
  private baseUrl: string;

  private constructor() {
    // Ensure baseUrl doesn't end with a slash to prevent double slashes in URLs
    const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    this.baseUrl = envBaseUrl.endsWith('/') ? envBaseUrl.slice(0, -1) : envBaseUrl;
  }

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  // Check if we're running on the client side
  private isClientSide(): boolean {
    return typeof window !== 'undefined';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Only check localStorage if on client side
    if (!this.isClientSide()) {
      return false; // Server-side always returns false
    }

    const token = this.getStoredToken();
    this.token = token;
    return !!token;
  }

  // Get current user from cache
  getCurrentUser(): User | null {
    // Only return cached user if on client side
    if (!this.isClientSide()) {
      return null;
    }
    return this.user;
  }

  // Fetch current user details from API
  async fetchCurrentUser(): Promise<User | null> {
    // Only fetch if on client side
    if (!this.isClientSide()) {
      return null;
    }

    const token = this.getStoredToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/welcome`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = {
          id: data.user_id,
          email: data.email,
          createdAt: new Date(), // Placeholder, should come from API
          updatedAt: new Date()  // Placeholder, should come from API
        };
        return this.user;
      } else {
        // If welcome endpoint doesn't work, return null
        return null;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Login method - makes actual API call
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Sanitize credentials before sending
    const sanitizedCredentials = {
      email: BasicSecurityUtils.sanitizeInput(credentials.email.trim()),
      password: credentials.password // Don't sanitize password as it might contain special characters
    };

    // Validate email format
    if (!BasicSecurityUtils.validateEmail(sanitizedCredentials.email)) {
      throw new Error('Invalid email format');
    }

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedCredentials)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: 'Login failed' };
      }
      throw new Error(errorData.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();

    // Only store token in localStorage if on client side
    if (this.isClientSide()) {
      // Secure storage with additional protections
      this.secureStoreToken(data.access_token);
      this.token = data.access_token;

      // Fetch the current user details after login
      await this.fetchCurrentUser();
    }

    return data;
  }

  // Securely store the token with additional protections
  private secureStoreToken(token: string): void {
    if (!this.isClientSide()) return;

    // Store token with expiration info
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const expirationTime = payload.exp * 1000; // Convert to milliseconds

    const tokenData = {
      token: token,
      expiration: expirationTime,
      timestamp: Date.now()
    };

    localStorage.setItem('auth_data', JSON.stringify(tokenData));
  }

  // Retrieve and validate stored token
  private getStoredToken(): string | null {
    if (!this.isClientSide()) return null;

    try {
      const stored = localStorage.getItem('auth_data');
      if (!stored) return null;

      const tokenData = JSON.parse(stored);

      // Validate token hasn't expired
      if (Date.now() > tokenData.expiration) {
        this.clearStoredToken();
        return null;
      }

      return tokenData.token;
    } catch {
      this.clearStoredToken();
      return null;
    }
  }

  // Clear stored token
  private clearStoredToken(): void {
    if (this.isClientSide()) {
      localStorage.removeItem('auth_data');
    }
  }

  // Register method - makes actual API call
  async register(userData: RegisterData): Promise<User> {
    // Sanitize user data before sending
    const sanitizedUserData = {
      email: BasicSecurityUtils.sanitizeInput(userData.email.trim()),
      password: userData.password,
      confirmPassword: userData.confirmPassword
    };

    // Validate email format
    if (!BasicSecurityUtils.validateEmail(sanitizedUserData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (!BasicSecurityUtils.validatePassword(sanitizedUserData.password)) {
      throw new Error('Password does not meet security requirements (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)');
    }

    // Check if passwords match
    if (sanitizedUserData.password !== sanitizedUserData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedUserData)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: 'Registration failed' };
      }
      throw new Error(errorData.detail || 'Registration failed');
    }

    const user: User = await response.json();

    return user;
  }

  // Logout method
  logout(): void {
    // Only remove token from localStorage if on client side
    if (this.isClientSide()) {
      // Remove token from localStorage
      this.clearStoredToken();
      this.token = null;
      this.user = null;
    }
  }

  // Get authorization header
  getAuthHeader(): { Authorization: string } | {} {
    if (this.token) {
      return { Authorization: `Bearer ${this.token}` };
    }
    return {};
  }
}

// Create a singleton instance
export const authClient = AuthClient.getInstance();

// Export the client without the React hook to avoid server-side issues