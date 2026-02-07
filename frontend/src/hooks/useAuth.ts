'use client';

import { useState, useEffect } from 'react';
import { authClient, User } from '@/lib/auth';
import type { LoginCredentials, RegisterData } from '@/lib/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const authenticated = authClient.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Fetch the current user details from the API
        const currentUser = await authClient.fetchCurrentUser();
        setUser(currentUser);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Function to quickly refresh authentication state
  const quickRefresh = () => {
    const authenticated = authClient.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const currentUser = authClient.getCurrentUser();
      setUser(currentUser);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authClient.login(credentials);
    setIsAuthenticated(true);
    setUser(authClient.getCurrentUser());
    return response;
  };

  const register = async (userData: RegisterData) => {
    const newUser = await authClient.register(userData);
    return newUser;
  };

  const logout = () => {
    authClient.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshUser = async () => {
    if (authClient.isAuthenticated()) {
      const currentUser = await authClient.fetchCurrentUser();
      setUser(currentUser);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    quickRefresh
  };
};