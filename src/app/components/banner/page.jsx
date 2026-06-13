"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerData, setBannerData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/proxy/api/admin/banners/getall');
        if (!response.ok) throw new Error('Failed to fetch banners');
        const result = await response.json();
        if (result.success && result.data?.length > 0) {
          setBannerData(result.data);
        } else {
          setBannerData([{}]);
        }
      } catch {
        setBannerData([{}]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (bannerData.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerData.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [bannerData.length]);

  const getSafeImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    try { new URL(url); return url; } catch { return FALLBACK_IMAGE; }
  };

  if (loading) {
    return (
      <section className="w-full px-3 py-3 sm:px-4 md:py-4">
        <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-gray-200 animate-pulse"
          style={{ height: '420px' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse" />
        </div>
      </section>
    );
  }

  const slide = bannerData[currentSlide] || {};

  return (
    <section className="w-full px-3 py-3 sm:px-4 md:py-4">
      <div
        className="relative mx-auto w-full max-w-7xl overflow-hidden"
        style={{ borderRadius: '24px', height: 'clamp(280px, 42vw, 480px)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
      >
        {/* Background images */}
        {bannerData.map((s, i) => (
          <div
            key={s._id || i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            <Image
              src={getSafeImageUrl(s.image)}
              alt={s.title || 'Fast2 Grocery Delivery'}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 1400px"
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
          </div>
        ))}

        {/* Gradient overlay — dark on right, transparent on left */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(270deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.52) 38%, rgba(0,0,0,0.12) 68%, transparent 100%)'
          }}
        />

        {/* Content layer */}
        <div className="absolute inset-0 z-20 flex items-center justify-end px-6 sm:px-10 lg:px-14">

          {/* RIGHT — Main hero content */}
          <div className="flex flex-col items-start gap-3 sm:gap-4 max-w-[280px] sm:max-w-[340px] lg:max-w-[380px]">

            {/* Badge */}
            <div
              className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
            >
              <span>⚡</span>
              <span>10 MINUTE DELIVERY</span>
            </div>

            {/* Headline */}
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight">
                {slide.title || 'Fresh Groceries'}
              </h1>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black leading-tight"
                style={{ color: '#4ade80' }}>
                {slide.subtitle || 'Delivered Fast'}
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xs">
              {slide.description || 'Farm fresh fruits, vegetables, dairy and daily essentials delivered to your doorstep in minutes.'}
            </p>

          </div>
        </div>

        {/* Slide dots */}
        {bannerData.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {bannerData.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === currentSlide ? '28px' : '8px',
                  height: '8px',
                  background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.45)',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Nav arrows */}
        {bannerData.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide(p => (p - 1 + bannerData.length) % bannerData.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide(p => (p + 1) % bannerData.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default Banner;
