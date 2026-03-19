'use client';

import React, { useState, useEffect } from 'react';

const PopupManager = () => {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivePopup = async () => {
      if (isLoading) return; // Prevent multiple simultaneous requests
      
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/popups/active');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Check if current page is in target pages (if specified)
          const currentPath = window.location.pathname;
          const targetPages = result.data.targetPages || [];
          
          if (targetPages.length === 0 || targetPages.includes(currentPath)) {
            setPopup(result.data);
            setIsVisible(true);
          }
        } else {
          setPopup(null);
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error fetching popup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchActivePopup();

    // Check for new popups every 30 seconds
    const interval = setInterval(fetchActivePopup, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (popup?.autoCloseAfter && isVisible) {
      const timer = setTimeout(() => {
        closePopup();
      }, popup.autoCloseAfter * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [popup, isVisible]);

  const closePopup = () => {
    setIsVisible(false);
    // Optional: Don't remove popup immediately to allow for smooth animation
    setTimeout(() => {
      setPopup(null);
    }, 300);
  };

  const getPopupStyle = () => {
    if (!popup) return {};

    const positions = {
      'top-left': { top: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '20px', right: '20px' }
    };
    
    return positions[popup.position] || positions['top-center'];
  };

  const getPopupColors = () => {
    if (!popup) return {};

    const colors = {
      'info': {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        titleColor: 'text-blue-800',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700'
      },
      'success': {
        border: 'border-green-200',
        bg: 'bg-green-50',
        titleColor: 'text-green-800',
        buttonBg: 'bg-green-600',
        buttonHover: 'hover:bg-green-700'
      },
      'warning': {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        titleColor: 'text-yellow-800',
        buttonBg: 'bg-yellow-600',
        buttonHover: 'hover:bg-yellow-700'
      },
      'error': {
        border: 'border-red-200',
        bg: 'bg-red-50',
        titleColor: 'text-red-800',
        buttonBg: 'bg-red-600',
        buttonHover: 'hover:bg-red-700'
      }
    };
    
    return colors[popup.type] || colors['info'];
  };

  if (!popup || !isVisible) return null;

  const colors = getPopupColors();

  return (
    <div
      className={`fixed z-[9999] max-w-md w-full mx-4 ${colors.border} ${colors.bg} rounded-lg shadow-xl border-2 transition-all duration-300 transform ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
      style={getPopupStyle()}
    >
      <div className="p-6 relative">
        {/* Close Button */}
        {popup.showCloseButton && (
          <button
            onClick={closePopup}
            className={`absolute top-3 right-3 ${colors.buttonBg} ${colors.buttonHover} text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200`}
            aria-label="Close popup"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Popup Image */}
        {popup.imageUrl && (
          <div className="mb-4">
            <img
              src={popup.imageUrl}
              alt={popup.title}
              className="w-full h-auto rounded-md object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Popup Content */}
        <div className="pr-8">
          <h3 className={`font-bold text-lg mb-2 ${colors.titleColor}`}>
            {popup.title}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            {popup.message}
          </p>
        </div>

        {/* Auto-close indicator */}
        {popup.autoCloseAfter && (
          <div className="text-xs text-gray-500 mt-2">
            Auto-closes in {popup.autoCloseAfter} seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupManager;
