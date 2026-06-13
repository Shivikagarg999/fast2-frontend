"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerData, setBannerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
  const imageUrl = getSafeImageUrl(slide.image);

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
        <div className="absolute inset-0 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-14">

          {/* LEFT — Floating glass card */}
          <div
            className="hidden lg:flex flex-col gap-4 p-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: '210px'
            }}
          >
            {[
              { emoji: '⚡', text: '10 Minute Delivery' },
              { emoji: '🌱', text: 'Farm Fresh Everyday' },
              { emoji: '⭐', text: 'Premium Quality Products' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  {item.emoji}
                </div>
                <span className="text-white font-semibold text-sm leading-tight">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* RIGHT — Main hero content */}
          <div className="flex flex-col items-start gap-3 sm:gap-4 max-w-[340px] sm:max-w-[400px] lg:max-w-[420px]">

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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight">
                {slide.title || 'Fresh Groceries'}
              </h1>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight"
                style={{ color: '#4ade80' }}>
                {slide.subtitle || 'Delivered Fast'}
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xs">
              {slide.description || 'Farm fresh fruits, vegetables, dairy and daily essentials delivered to your doorstep in minutes.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(90deg, #16a34a, #15803d)', boxShadow: '0 4px 15px rgba(22,163,74,0.4)' }}
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="font-bold text-sm text-white px-5 py-2.5 rounded-full border transition-all hover:bg-white/10 active:scale-95"
                style={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Browse Categories
              </button>
            </div>

            {/* Promo pills */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)', color: '#fde047' }}>
                50% OFF First Order
              </span>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}>
                BUY 1 GET 1
              </span>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
                FRESH TODAY
              </span>
            </div>
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
