'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

const MobileChatNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  
  // Check screen size and if notification has been dismissed
  useEffect(() => {
    const checkScreenSizeAndVisibility = () => {
      // Check if screen width is less than 768px (mobile/tablet)
      const isMobile = window.innerWidth < 768;
      
      // Check if notification has been dismissed before
      const dismissed = localStorage.getItem('chatNotificationDismissed');
      
      // Show notification only on mobile and if not dismissed
      setIsVisible(isMobile && !dismissed);
    };

    // Run on initial load
    checkScreenSizeAndVisibility();

    // Add resize listener
    window.addEventListener('resize', checkScreenSizeAndVisibility);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', checkScreenSizeAndVisibility);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Save to localStorage that the notification was dismissed
    localStorage.setItem('chatNotificationDismissed', 'true');
  };

  const handleGoToChatbot = () => {
    router.push('/chatbot');
    handleClose(); // Close the notification after navigating
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/50 p-4 shadow-2xl shadow-purple-500/20">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-200 text-sm mb-1">Try Our AI Chatbot!</h3>
            <p className="text-gray-300 text-xs mb-3">
              Add, list, update, complete, or delete your todos using natural language commands.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleGoToChatbot}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs py-1.5 px-3 rounded-lg"
              >
                Open Chatbot
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700/50 text-xs py-1.5 px-3 rounded-lg"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 ml-2"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 14l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileChatNotification;