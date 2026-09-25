'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { track } from '../../utils/analytics';

const isExternalLink = (link) => /^https?:\/\//i.test(link);

const ctaClass =
  'inline-block mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors';

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
        const response = await fetch('/proxy/api/popups/active');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Only show popup on home route (/)
          const currentPath = window.location.pathname;
          if (currentPath === '/') {
            setPopup(result.data);
            setIsVisible(true);
            track('offer_popup_shown', { ref: String(result.data._id || '') });
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

  if (!popup) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closePopup}
      />

      {/* Centered Popup */}
      <div
        className={`fixed z-[9999] max-w-md w-11/12 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={getPopupStyle()}
      >
        <div className="relative">
          <button
            onClick={closePopup}
            className="absolute top-3 right-3 z-10 text-gray-700 bg-white/90 hover:bg-white shadow rounded-full p-1.5 transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {popup.imageUrl && (
            <img
              src={popup.imageUrl}
              alt={popup.title || 'Offer'}
              className="w-full h-auto max-h-[60vh] object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {(popup.title || popup.subtitle || (popup.ctaText && popup.ctaLink)) && (
            <div className="p-5 text-center">
              {popup.title && (
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{popup.title}</h2>
              )}
              {popup.subtitle && (
                <p className="text-sm text-gray-500 mt-1.5">{popup.subtitle}</p>
              )}
              {popup.ctaText && popup.ctaLink && (
                isExternalLink(popup.ctaLink) ? (
                  <a
                    href={popup.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { track('offer_popup_cta_click', { ref: String(popup._id || '') }); closePopup(); }}
                    className={ctaClass}
                  >
                    {popup.ctaText}
                  </a>
                ) : (
                  <Link href={popup.ctaLink} onClick={() => { track('offer_popup_cta_click', { ref: String(popup._id || '') }); closePopup(); }} className={ctaClass}>
                    {popup.ctaText}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PopupManager;
