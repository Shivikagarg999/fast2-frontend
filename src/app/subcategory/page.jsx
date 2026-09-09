"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SubcategorySection() {
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/proxy/api/subcategory/getall');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setSubcategories(data);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError('Failed to load subcategories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubcategories();
  }, []);

  const fallbackImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Explore our store</p>
            <h2 className="text-2xl font-bold text-gray-900">Browse Subcategories</h2>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div>
            <div className="flex gap-3 mb-3" style={{ height: '400px' }}>
              <div className="flex-1 bg-gray-100 rounded-2xl animate-pulse"></div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex-1 bg-gray-100 rounded-2xl animate-pulse"></div>
                <div className="flex-1 bg-gray-100 rounded-2xl animate-pulse"></div>
                <div className="flex-1 bg-gray-100 rounded-2xl animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl aspect-square bg-gray-100 animate-pulse"></div>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories - Editorial Layout */}
        {!isLoading && !error && subcategories.length > 0 && (
          <div>
            {/* Featured grid: first 4 subcategories */}
            {subcategories.length >= 4 && (
              <>
                {/* Desktop editorial layout */}
                <div className="hidden md:flex gap-3 mb-3" style={{ height: '420px' }}>
                  {/* Large featured card */}
                  <Link
                    href={`/subcategory/${subcategories[0]._id}`}
                    className="flex-1 relative rounded-2xl overflow-hidden group block"
                  >
                    <Image
                      src={subcategories[0].image || fallbackImage}
                      alt={subcategories[0].name}
                      fill
                      sizes="35vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = fallbackImage; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-5 left-5">
                      <h3 className="font-bold text-white text-xl leading-tight">{subcategories[0].name}</h3>
                      <p className="text-white/60 text-sm mt-1">Shop now →</p>
                    </div>
                  </Link>

                  {/* Stack of 3 smaller cards */}
                  <div className="flex-1 flex flex-col gap-3">
                    {subcategories.slice(1, 4).map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        href={`/subcategory/${subcategory._id}`}
                        className="flex-1 relative rounded-2xl overflow-hidden group block"
                      >
                        <Image
                          src={subcategory.image || fallbackImage}
                          alt={subcategory.name}
                          fill
                          sizes="30vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.src = fallbackImage; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <h3 className="font-bold text-white text-base leading-tight">{subcategory.name}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile: simple 2-col grid for first 4 */}
                <div className="md:hidden grid grid-cols-2 gap-3 mb-3">
                  {subcategories.slice(0, 4).map((subcategory) => (
                    <Link
                      key={subcategory._id}
                      href={`/subcategory/${subcategory._id}`}
                      className="relative block rounded-2xl overflow-hidden"
                      style={{ height: '130px' }}
                    >
                      <Image
                        src={subcategory.image || fallbackImage}
                        alt={subcategory.name}
                        fill
                        sizes="50vw"
                        className="object-cover"
                        onError={(e) => { e.target.src = fallbackImage; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <h3 className="font-bold text-white text-sm leading-tight">{subcategory.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Remaining subcategories in regular grid */}
            {subcategories.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(subcategories.length >= 4 ? subcategories.slice(4) : subcategories).map((subcategory) => (
                  <Link
                    key={subcategory._id}
                    href={`/subcategory/${subcategory._id}`}
                    className="block rounded-xl overflow-hidden group relative transition-transform duration-200 hover:scale-[1.03]"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={subcategory.image || fallbackImage}
                        alt={subcategory.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = fallbackImage; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="font-bold text-white text-xs leading-tight line-clamp-2">{subcategory.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && subcategories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any subcategories at the moment. Please check back later or try refreshing the page.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
