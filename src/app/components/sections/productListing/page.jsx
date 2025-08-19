"use client";
import { useState, useEffect } from 'react';
import ProductCard from '../../productCard/page';

export default function ProductListingSection() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample product data
  const sampleProducts = [
    {
      id: 1,
      name: 'Organic Avocados',
      description: 'Fresh organic avocados, rich in nutrients and perfect for your healthy diet.',
      price: 4.99,
      originalPrice: 6.99,
      rating: 4.5,
      reviewCount: 128,
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'fruits',
      weight: '500g',
      organic: true,
      inStock: true,
      discount: 25,
      featured: true
    },
    {
      id: 2,
      name: 'Fresh Strawberries',
      description: 'Sweet and juicy strawberries, perfect for desserts or snacking.',
      price: 3.99,
      originalPrice: 4.99,
      rating: 4.2,
      reviewCount: 96,
      image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'fruits',
      weight: '400g',
      organic: false,
      inStock: true,
      discount: 20,
      featured: true
    },
    {
      id: 3,
      name: 'Whole Milk',
      description: 'Fresh whole milk from grass-fed cows, rich in calcium.',
      price: 2.49,
      originalPrice: 2.99,
      rating: 4.7,
      reviewCount: 204,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'dairy',
      weight: '1L',
      organic: true,
      inStock: true,
      discount: 15,
      featured: false
    },
    {
      id: 4,
      name: 'Organic Bread',
      description: 'Artisan organic bread made with whole grains and no preservatives.',
      price: 3.49,
      originalPrice: 3.99,
      rating: 4.3,
      reviewCount: 87,
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'bakery',
      weight: '500g',
      organic: true,
      inStock: true,
      discount: 12,
      featured: true
    },
    {
      id: 5,
      name: 'Free Range Eggs',
      description: 'Farm fresh free range eggs from happy chickens.',
      price: 4.29,
      originalPrice: 4.99,
      rating: 4.8,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'dairy',
      weight: 'Dozen',
      organic: false,
      inStock: false,
      discount: 14,
      featured: false
    },
    {
      id: 6,
      name: 'Organic Tomatoes',
      description: 'Vine-ripened organic tomatoes, perfect for salads and cooking.',
      price: 2.99,
      originalPrice: 3.49,
      rating: 4.4,
      reviewCount: 112,
      image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'vegetables',
      weight: '500g',
      organic: true,
      inStock: true,
      discount: 14,
      featured: false
    },
    {
      id: 7,
      name: 'Greek Yogurt',
      description: 'Creamy Greek yogurt with high protein content and probiotics.',
      price: 3.79,
      originalPrice: 4.29,
      rating: 4.6,
      reviewCount: 189,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'dairy',
      weight: '500g',
      organic: false,
      inStock: true,
      discount: 12,
      featured: true
    },
    {
      id: 8,
      name: 'Bananas',
      description: 'Fresh yellow bananas, a great source of potassium and energy.',
      price: 1.99,
      originalPrice: 2.49,
      rating: 4.1,
      reviewCount: 76,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      category: 'fruits',
      weight: '1kg',
      organic: false,
      inStock: true,
      discount: 20,
      featured: false
    }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'bakery', name: 'Bakery' },
    { id: 'meat', name: 'Meat & Seafood' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'priceLow', name: 'Price: Low to High' },
    { id: 'priceHigh', name: 'Price: High to Low' },
    { id: 'rating', name: 'Top Rated' },
    { id: 'newest', name: 'Newest' }
  ];

  // Simulate data loading
  useEffect(() => {
    const loadProducts = () => {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
        setLoading(false);
        console.log('Products loaded successfully');
      }, 1000);
    };

    loadProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'priceLow':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // For demo, we'll sort by ID which simulates newest first
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured products first
        result.sort((a, b) => b.featured - a.featured);
        break;
    }
    
    setFilteredProducts(result);
    console.log(`Filtered products: ${result.length} items found`);
  }, [products, selectedCategory, sortOption, searchQuery]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log(`Category changed to: ${categoryId}`);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    console.log(`Sort option changed to: ${option}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our wide selection of fresh and organic products, carefully curated for your health and wellness.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          // Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // No Products Found
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}

        {/* Load More Button (for pagination) */}
        {!loading && filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Load More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}