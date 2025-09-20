"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Professional banner data with high-quality working images
  const bannerData = [
    {
      id: 1,
      title: "Get FREE delivery",
      subtitle: "on your first order",
      description: "Order groceries & get them delivered in 10 minutes",
      image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2022-05/Group-33704.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
      cta: "Order Now",
      ctaColor: "bg-[#0c831f]",
      gradient: "from-green-50 to-green-100",
      accentColor: "text-green-700"
    },
    {
      id: 2,
      title: "MEGA Monsoon Sale",
      subtitle: "Up to 50% OFF",
      description: "Fresh fruits & vegetables at unbeatable prices",
      image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-07/pharmacy-WEB.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80",
      cta: "Shop Now",
      ctaColor: "bg-[#ff6b35]",
      gradient: "from-orange-50 to-red-50",
      accentColor: "text-orange-600"
    },
    {
      id: 3,
      title: "Buy 1 Get 1 FREE",
      subtitle: "on beverages",
      description: "Refresh yourself with amazing deals on drinks",
      image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-03/babycare-WEB.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
      cta: "Grab Deal",
      ctaColor: "bg-[#1976d2]",
      gradient: "from-blue-50 to-cyan-50",
      accentColor: "text-blue-600"
    },
    {
      id: 4,
      title: "Daily Essentials",
      subtitle: "delivered instantly",
      description: "Everything you need for your home, in minutes",
      image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-07/Pet-Care_WEB.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80",
      cta: "Explore",
      ctaColor: "bg-[#9c27b0]",
      gradient: "from-purple-50 to-pink-50",
      accentColor: "text-purple-600"
    }
  ];

  // Auto-rotate slides every 4 seconds
  useEffect(() => {
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

  return (
    <div className="relative bg-white w-full px-4 py-4">
      <div className="relative w-full h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden rounded-2xl bg-white">
        {bannerData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-in-out transform ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0 scale-100' 
                : 'opacity-0 translate-x-full scale-95'
            }`}
          >
            <div className="flex items-center h-full px-6 md:px-8 lg:px-12 relative overflow-hidden">
              {/* Content Section */}
              <div className="flex-1 max-w-[55%] z-20 space-y-2 md:space-y-3">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${slide.accentColor} leading-tight`}>
                    {slide.subtitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed max-w-md">
                  {slide.description}
                </p>
                <div className="pt-2">
                  <button 
                    className={`${slide.ctaColor} text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full text-sm md:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wide`}
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
              
              {/* Image Section */}
              <div className="flex-1 max-w-[45%] h-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-[80%] max-w-sm">
                    <Image
                      src={slide.fallbackImage}
                      alt={slide.title}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority={index === 0}
                      sizes="(max-width: 768px) 45vw, (max-width: 1200px) 35vw, 30vw"
                      onError={(e) => {
                        console.log('Image failed to load:', slide.image);
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
        
        {/* Progress Dots */}
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
      </div>
    </div>
  );
};

export default Banner;