'use client'
import React, { useState } from 'react';

const BlinkitProductListing = () => {
  // Sample Blinkit-style product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Fresh Potatoes",
      description: "Farm fresh potatoes, 1 kg pack",
      category: "Vegetables",
      price: 35,
      image: "https://i.pinimg.com/736x/b6/c4/cd/b6c4cde196e12850d64cc6570eef7674.jpg",
      rating: 4.2,
      deliveryTime: "10 mins"
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      description: "Organic red tomatoes, 500 g",
      category: "Vegetables",
      price: 25,
      image: "https://i.pinimg.com/736x/f2/7c/1a/f27c1a4fdcc547bbced51a424492be2f.jpg",
      rating: 4.5,
      deliveryTime: "12 mins"
    },
    {
      id: 3,
      name: "Fresh Milk",
      description: "Pure cow milk, 500 ml",
      category: "Dairy",
      price: 30,
      image: "https://i.pinimg.com/736x/24/1d/d3/241dd354a1303f9cbeb6ad04d70a4211.jpg",
      rating: 4.7,
      deliveryTime: "8 mins"
    },
    {
      id: 4,
      name: "Whole Wheat Bread",
      description: "Freshly baked bread, 400 g",
      category: "Bakery",
      price: 45,
      image: "https://i.pinimg.com/736x/9b/87/24/9b8724dc3f7ba8a2a9674ae633e4064c.jpg",
      rating: 4.3,
      deliveryTime: "15 mins"
    }
  ]);

  // Format price in Indian rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Get unique categories for filtering
  const categories = [...new Set(products.map(product => product.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter products by category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 font-sans">
  

      <div className="max-w-6xl mx-auto">
        {/* Category Filter */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-transform hover:shadow-md">
              {/* Product Image */}
              <div className="h-40 bg-gray-100 flex items-center justify-center p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-contain h-full"
                />
              </div>
              
              {/* Product Details */}
              <div className="p-3">
                <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center bg-blue-50 px-1 rounded">
                    <span className="text-xs font-semibold text-blue-700">{product.rating}</span>
                    <svg className="w-3 h-3 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">• Delivery in {product.deliveryTime}</span>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg text-sm transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-300 text-5xl mb-4">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-around">
        <div className="flex flex-col items-center text-blue-600">
          <i className="fas fa-home mb-1"></i>
          <span className="text-xs">Home</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <i className="fas fa-search mb-1"></i>
          <span className="text-xs">Search</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <i className="fas fa-shopping-cart mb-1"></i>
          <span className="text-xs">Cart</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <i className="fas fa-user mb-1"></i>
          <span className="text-xs">Account</span>
        </div>
      </div>
    </div>
  );
};

export default BlinkitProductListing;