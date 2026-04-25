"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerData, setBannerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.fast2.in/api/admin/banners/getall');

        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setBannerData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch banners');
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err.message);
        setBannerData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate slides every 4 seconds
  useEffect(() => {
    if (bannerData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [bannerData.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerData.length);
  };

  // Safe image URL handling
  const getSafeImageUrl = (url) => {
    if (!url) return '/fallback-banner.jpg';

    try {
      new URL(url);
      return url;
    } catch {
      return '/fallback-banner.jpg';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-white w-full px-4 py-4">
        <div className="relative w-full h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden rounded-2xl bg-gray-200 animate-pulse">
          <div className="flex items-center h-full px-6 md:px-8 lg:px-12">
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="flex-1">
              <div className="w-full h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative bg-white w-full px-4 py-4">
        <div className="relative w-full h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden rounded-2xl bg-red-50 border border-red-200">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 text-lg font-semibold">Failed to load banners</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No banners state
  if (bannerData.length === 0) {
    return (
      <div className="relative bg-white w-full px-4 py-4">
        <div className="relative w-full h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">No banners available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white w-full mt-12 px-4 py-4">
      <div className="relative w-full h-64 sm:h-52 md:h-60 lg:h-72 overflow-hidden rounded-2xl bg-white">
        {bannerData.map((slide, index) => (
          <div
            key={slide._id || slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              index === currentSlide
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 translate-x-full scale-95'
            } ${slide.gradient ? `bg-gradient-to-r ${slide.gradient}` : ''}`}
            style={{
              backgroundColor: !slide.gradient ? (slide.accentColor || '#f3f4f6') : undefined
            }}
          >
            <div className="flex items-center h-full px-6 md:px-8 lg:px-12 relative overflow-hidden">
              {/* Content Section */}
              <div className="flex-1 max-w-[60%] z-20 space-y-2 md:space-y-3">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black leading-tight">
                    {slide.title}
                  </h1>
                  <h2
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black leading-tight"
                  >
                    {slide.subtitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed max-w-md">
                  {slide.description}
                </p>
                {/* Button removed as requested */}
              </div>

              {/* Image Section */}
              <div className="flex-1 max-w-[80%] h-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-[80%] max-w-md">
                    <Image
                      src={getSafeImageUrl(slide.image)}
                      alt={slide.title || 'Banner image'}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority={index === 0}
                      sizes="(max-width: 868px) 40vw, (max-width: 1300px) 30vw, 25vw"
                      onError={(e) => {
                        if (slide.fallbackImage) {
                          e.target.src = slide.fallbackImage;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-6 right-8 w-16 h-16 bg-white/15 rounded-full blur-lg"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {bannerData.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 z-30 group"
              onClick={goToPrevSlide}
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 z-30 group"
              onClick={goToNextSlide}
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Dots */}
        {bannerData.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {bannerData.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-8 h-3 bg-white shadow-md'
                    : 'w-3 h-3 bg-white/60 hover:bg-white/80'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Banner;
