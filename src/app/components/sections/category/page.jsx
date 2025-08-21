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
      console.log('Component loaded successfully at:', new Date().toLocaleTimeString());
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

  // Log category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log(`Category selected: ${categoryId} at ${new Date().toLocaleTimeString()}`);
    
    // Log additional details for analytics
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      console.table({
        'Category Name': category.name,
        'Product Count': category.count,
        'Selection Time': new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onLoad={() => console.log(`Image loaded: ${category.name}`)}
                    onError={(e) => {
                      console.error(`Failed to load image for ${category.name}`);
                      e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.count}+ products
                  </p>
                  <button className="mt-4 text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}