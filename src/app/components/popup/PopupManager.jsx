'use client';

import React, { useState, useEffect } from 'react';

const PopupManager = () => {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivePopup = async () => {
      if (isLoading) return; // Prevent multiple simultaneous requests
      
      // Check if popup has already been shown in this session
      const popupShown = sessionStorage.getItem('popupShown');
      if (popupShown) return; // Don't fetch if already shown in this session
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/popups/active');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Only show popup on home route (/)
          const currentPath = window.location.pathname;
          if (currentPath === '/') {
            setPopup(result.data);
            setIsVisible(true);
            // Mark popup as shown in this session
            sessionStorage.setItem('popupShown', 'true');
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

    // Initial fetch only once when component mounts
    fetchActivePopup();
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
    // Always center the popup on screen
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
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
    <>
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={closePopup}
      />

      {/* Centered Popup */}
      <div
        className={`fixed z-[9999] max-w-2xl w-11/12 rounded-lg shadow-2xl transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={getPopupStyle()}
      >
        <div className="relative">
          {/* Close Button - Always Visible */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 rounded-full p-2"
            aria-label="Close popup"
          >
            <svg
              className="w-6 h-6"
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

          {/* Popup Image */}
          {popup.imageUrl && (
            <div>
              <img
                src={popup.imageUrl}
                alt={popup.title}
                className="w-full h-auto rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}


        </div>
      </div>
    </>
  );
};

export default PopupManager;
