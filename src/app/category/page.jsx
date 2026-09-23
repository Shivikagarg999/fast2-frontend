"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeading from '../components/sectionHeading/SectionHeading';

const fallbackImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

const TILE_WIDTH = 'w-[calc((100%-2.25rem)/4)] sm:w-28 md:w-32';

const CategoryTile = ({ category }) => (
  <Link
    href={`/category/${category.slug || category._id}`}
    className={`group flex flex-col items-center text-center ${TILE_WIDTH}`}
  >
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-brand-300">
      <Image
        src={category.image || fallbackImage}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => { e.target.src = fallbackImage; }}
      />
    </div>
    <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
      {category.name}
    </p>
  </Link>
);

// `limit` caps how many tiles show (home page); without it (the /category route) every category is listed.
export default function CategoryPage({ limit } = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [locationApplied, setLocationApplied] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        let url = '/proxy/api/category/getall';
        try {
          const location = JSON.parse(localStorage.getItem('userLocationData') || 'null');
          if (location?.latitude != null && location?.longitude != null) {
            url += `?latitude=${location.latitude}&longitude=${location.longitude}`;
            setLocationApplied(true);
          } else {
            setLocationApplied(false);
          }
        } catch {
          // ignore malformed saved location, fall back to the unfiltered list
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();

    window.addEventListener('locationUpdated', fetchCategories);
    return () => window.removeEventListener('locationUpdated', fetchCategories);
  }, []);

  const typeLimit = Number.isInteger(limit) && limit > 0 ? limit : null;
  const visible = typeLimit ? categories.slice(0, typeLimit) : categories;
  const hasMore = typeLimit !== null && categories.length > typeLimit;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">

        <SectionHeading
          title="Shop by category"
          href={hasMore ? '/category' : undefined}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading State - same grid as the loaded tiles so nothing jumps */}
        {isLoading && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-5">
            {[...Array(typeLimit || 8)].map((_, i) => (
              <div key={i} className={`flex flex-col items-center animate-pulse ${TILE_WIDTH}`}>
                <div className="w-full aspect-square rounded-2xl bg-gray-100"></div>
                <div className="h-3 w-4/5 bg-gray-100 rounded mt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Categories - compact, scannable grid */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-5">
            {visible.map((category) => (
              <CategoryTile key={category._id} category={category} />
            ))}
          </div>
        )}

        {/* Empty State (hidden when a location filter is active - the product section below explains it) */}
        {!isLoading && !error && categories.length === 0 && !locationApplied && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any categories at the moment. Please check back later or try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
