"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CategorySection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    {
      id: 'groceries',
      name: 'Groceries & Essentials',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      count: 245
    },
    {
      id: 'fruits',
      name: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      count: 156
    },
    {
      id: 'dairy',
      name: 'Dairy & Breakfast',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      count: 89
    },
    {
      id: 'bakery',
      name: 'Bakery & Bread',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      count: 63
    },
    {
      id: 'beverages',
      name: 'Beverages',
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      count: 118
    },
    {
      id: 'snacks',
      name: 'Snacks & Sweets',
      image: 'https://i.pinimg.com/736x/30/ed/5d/30ed5d5761e8994c51a55b882208ad70.jpg',
      count: 204
    },
    {
      id: 'household',
      name: 'Household Care',
      image: 'https://i.pinimg.com/1200x/c7/92/7e/c7927e3335694378d6faa4573c8fda8b.jpg',
      count: 137
    }
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="bg-white py-6 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
        {/* Category Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 hide-scrollbar">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleCategorySelect('all')}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="skeleton h-32 w-full"></div>
                <div className="p-3">
                  <div className="skeleton h-5 w-3/4 mb-2"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:shadow-md"
              >
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {category.count}+ products
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}