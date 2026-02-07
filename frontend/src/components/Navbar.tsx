'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={`border-transparent text-gray-300 hover:border-purple-500 hover:text-purple-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      pathname === '/dashboard' ? 'border-purple-500 text-purple-400' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chatbot"
                    className={`border-transparent text-gray-300 hover:border-purple-500 hover:text-purple-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      pathname === '/chatbot' ? 'border-purple-500 text-purple-400' : ''
                    }`}
                  >
                    Chatbot
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile menu button - only visible on small screens */}
            {isAuthenticated && (
              <div className="sm:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Desktop Auth Controls */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
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
        
        {/* Mobile menu, show/hide based on menu state */}
        {isAuthenticated && (
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1 px-2">
              <Link
                href="/dashboard"
                className={`border-transparent text-gray-300 hover:bg-gray-700 hover:text-white hover:border-purple-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium rounded-md transition-colors ${
                  pathname === '/dashboard' ? 'bg-gray-800/50 border-purple-500 text-purple-400' : ''
                }`}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/chatbot"
                className={`border-transparent text-gray-300 hover:bg-gray-700 hover:text-white hover:border-purple-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium rounded-md transition-colors ${
                  pathname === '/chatbot' ? 'bg-gray-800/50 border-purple-500 text-purple-400' : ''
                }`}
                onClick={closeMobileMenu}
              >
                Chatbot
              </Link>
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white">
                      {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={async () => {
                      logout();
                      if (typeof window !== 'undefined') {
                        window.location.href = '/'; // Redirect to home after logout
                      }
                    }}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Auth Controls for non-authenticated users */}
        {!isAuthenticated && (
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-4 pb-3 border-t border-gray-700 px-2">
              <div className="flex flex-col space-y-3">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };