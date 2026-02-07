'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { PersistentChatNavbar } from '@/components/Navbar/PersistentChatNavbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 sm:space-y-12 text-center relative z-10 px-2">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-purple-500/30 shadow-2xl animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6 animate-slideDown">
            Todo Web Application
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto animate-slideDown animation-delay-100">
            A cutting-edge, secure todo application with advanced features and seamless user experience.
          </p>

          <div className="bg-purple-900/30 dark:bg-purple-900/30 light:bg-purple-100 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl mb-6 sm:mb-8 border border-purple-500/30 dark:border-purple-500/30 light:border-purple-300 animate-slideDown animation-delay-200">
            <p className="text-cyan-400 dark:text-cyan-400 light:text-cyan-700 font-semibold text-base sm:text-lg mb-3">What You Can Do:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-black/10 dark:bg-black/10 light:bg-white/50">
                <span className="text-cyan-400 dark:text-cyan-400 light:text-cyan-600 text-xl mb-1">✓</span>
                <span className="text-xs sm:text-sm text-center text-gray-300 dark:text-gray-300 light:text-gray-700">Create & Manage Tasks</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-black/10 dark:bg-black/10 light:bg-white/50">
                <span className="text-cyan-400 dark:text-cyan-400 light:text-cyan-600 text-xl mb-1">✓</span>
                <span className="text-xs sm:text-sm text-center text-gray-300 dark:text-gray-300 light:text-gray-700">Organize Your Schedule</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-black/10 dark:bg-black/10 light:bg-white/50">
                <span className="text-cyan-400 dark:text-cyan-400 light:text-cyan-600 text-xl mb-1">✓</span>
                <span className="text-xs sm:text-sm text-center text-gray-300 dark:text-gray-300 light:text-gray-700">Track Progress</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slideUp animation-delay-700">
            <Link href="/auth/login">
              <Button variant="default" className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-transform hover:scale-105">
                Login
              </Button>
            </Link>

            <Link href="/auth/register">
              <Button variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg border-purple-500 text-gray-300 hover:bg-purple-500/10 transition-transform hover:scale-105">
                Register
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="animate-fadeIn animation-delay-1000">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6 sm:mb-8">Why Choose Our Todo App?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:transform hover:scale-105 animate-cardReveal">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🎯</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-cyan-400 mb-1 sm:mb-2">Goal Tracking</h3>
              <p className="text-xs sm:text-sm text-gray-400">Set and track your goals with visual progress indicators.</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-500/30 hover:border-green-400 transition-all duration-300 hover:transform hover:scale-105 animate-cardReveal animation-delay-200">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">📊</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-green-400 mb-1 sm:mb-2">Progress Analytics</h3>
              <p className="text-xs sm:text-sm text-gray-400">Visualize your productivity with detailed analytics.</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-yellow-500/30 hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105 animate-cardReveal animation-delay-400">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🔔</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-yellow-400 mb-1 sm:mb-2">Smart Reminders</h3>
              <p className="text-xs sm:text-sm text-gray-400">Never miss deadlines with intelligent notifications.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-500/30 hover:border-pink-400 transition-all duration-300 hover:transform hover:scale-105 animate-cardReveal animation-delay-600">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🔐</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-pink-400 mb-1 sm:mb-2">Secure Storage</h3>
              <p className="text-xs sm:text-sm text-gray-400">Your data is encrypted and securely stored with us.</p>
            </div>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn animation-delay-1200">
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 dark:from-purple-900/30 dark:to-pink-900/30 light:from-purple-100 light:to-pink-100 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-500/30 dark:border-purple-500/30 light:border-purple-300 hover:border-purple-400 dark:hover:border-purple-400 light:hover:border-purple-500 transition-colors animate-cardReveal">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">🔒</div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-cyan-400 dark:text-cyan-400 light:text-cyan-700 mb-1 sm:mb-2">Secure Authentication</h3>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Enterprise-grade security with JWT tokens and encrypted data storage.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 dark:from-purple-900/30 dark:to-pink-900/30 light:from-purple-100 light:to-pink-100 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-500/30 dark:border-purple-500/30 light:border-purple-300 hover:border-cyan-400 dark:hover:border-cyan-400 light:hover:border-cyan-500 transition-colors animate-cardReveal animation-delay-200">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">⚡</div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-cyan-400 dark:text-cyan-400 light:text-cyan-700 mb-1 sm:mb-2">Lightning Fast</h3>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Optimized performance with real-time updates and smooth interactions.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 dark:from-purple-900/30 dark:to-pink-900/30 light:from-purple-100 light:to-pink-100 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-500/30 dark:border-purple-500/30 light:border-purple-300 hover:border-pink-400 dark:hover:border-pink-400 light:hover:border-pink-500 transition-colors animate-cardReveal animation-delay-400">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">📱</div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-cyan-400 dark:text-cyan-400 light:text-cyan-700 mb-1 sm:mb-2">Responsive Design</h3>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Beautiful UI that works seamlessly across all devices and screen sizes.</p>
          </div>
        </div>

        <footer className="text-center text-gray-500 mt-12 pt-8 border-t border-purple-500/30 animate-fadeIn animation-delay-1400">
          <p className="mb-4">Secure & Private • Your data stays with you</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.602-3.369-1.344-3.369-1.344-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
            </a>
          </div>
        </footer>
      </div>

      {/* Persistent Chat Interface */}
      <PersistentChatNavbar />
    </div>
  );
}