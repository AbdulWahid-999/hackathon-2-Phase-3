'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-purple-600">
                TodoApp
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="border-transparent text-gray-300 hover:border-purple-500 hover:text-purple-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chatbot"
                    className="border-transparent text-gray-300 hover:border-purple-500 hover:text-purple-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Chatbot
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-purple-600 hidden md:block hover:text-purple-700 font-medium transition-colors">
                  {user?.email}
                </span>
                <Button
                  onClick={async () => {
                    logout();
                    // Quick refresh to update UI immediately after logout
                    if (typeof window !== 'undefined') {
                      window.location.href = '/'; // Redirect to home after logout
                    }
                  }}
                  variant="outline"
                  className="text-sm border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };