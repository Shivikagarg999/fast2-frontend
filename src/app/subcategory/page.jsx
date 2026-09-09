"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MIN_SUBCATEGORIES_FOR_OWN_ROW = 3;

const fallbackImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

const SubcategoryTile = ({ subcategory }) => (
  <Link href={`/subcategory/${subcategory._id}`} className="flex-shrink-0 w-36 sm:w-40 group">
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-gray-300 transition-colors">
      <Image
        src={subcategory.image || fallbackImage}
        alt={subcategory.name}
        fill
        sizes="(max-width: 640px) 144px, 160px"
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => { e.target.src = fallbackImage; }}
      />
    </div>
    <p className="mt-2 text-sm font-semibold text-gray-800 text-center leading-tight line-clamp-2">
      {subcategory.name}
    </p>
  </Link>
);

export default function SubcategorySection() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/proxy/api/subcategory/getall');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const byCategory = new Map();
        data.forEach((subcategory) => {
          const category = subcategory.category;
          if (!category?._id) return;
          if (!byCategory.has(category._id)) {
            byCategory.set(category._id, { category, subcategories: [] });
          }
          byCategory.get(category._id).subcategories.push(subcategory);
        });

        const groupList = Array.from(byCategory.values()).sort((a, b) => {
          const sortDiff = (a.category.sortOrder ?? 0) - (b.category.sortOrder ?? 0);
          return sortDiff !== 0 ? sortDiff : (a.category.name || '').localeCompare(b.category.name || '');
        });

        setGroups(groupList);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError('Failed to load subcategories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubcategories();
  }, []);

  const richGroups = groups.filter((g) => g.subcategories.length >= MIN_SUBCATEGORIES_FOR_OWN_ROW);
  const moreSubcategories = groups
    .filter((g) => g.subcategories.length < MIN_SUBCATEGORIES_FOR_OWN_ROW)
    .flatMap((g) => g.subcategories);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">

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
          <div className="space-y-8">
            {[...Array(2)].map((_, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="h-5 w-40 bg-gray-100 rounded animate-pulse mb-3"></div>
                <div className="flex gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-36 sm:w-40">
                      <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse"></div>
                      <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-2 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category-wise subcategory rows (only for categories with enough subcategories to fill a row) */}
        {!isLoading && !error && groups.length > 0 && (
          <div className="space-y-8">
            {richGroups.map(({ category, subcategories }) => (
              <div key={category._id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  <Link
                    href={`/category/${category._id}`}
                    className="text-sm font-semibold text-[#1a3a1a] hover:text-[#0f2510] flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    See all <span className="text-base">→</span>
                  </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                  {subcategories.map((subcategory) => (
                    <SubcategoryTile key={subcategory._id} subcategory={subcategory} />
                  ))}
                </div>
              </div>
            ))}

            {/* Categories with too few subcategories for their own row share a compact grid instead */}
            {moreSubcategories.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">More to explore</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-5">
                  {moreSubcategories.map((subcategory) => (
                    <SubcategoryTile key={subcategory._id} subcategory={subcategory} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && groups.length === 0 && (
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
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
