'use client'
import React, { useState } from 'react';

const BlinkitProductListing = () => {
  const [products] = useState([
    {
      id: 1,
      name: "Fresh Potatoes",
      description: "Farm fresh, 1 kg",
      category: "Vegetables",
      price: 35,
      image: "https://i.pinimg.com/736x/b6/c4/cd/b6c4cde196e12850d64cc6570eef7674.jpg",
      rating: 4.2,
      deliveryTime: "10 mins"
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      description: "Organic red, 500 g",
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
      name: "Paneer",
      description: "Fresh cottage cheese, 200 g",
      category: "Dairy",
      price: 80,
      image: "https://i.pinimg.com/736x/cf/d4/36/cfd4360fb7a7c8e5e020c7637b4dd091.jpg",
      rating: 4.6,
      deliveryTime: "10 mins"
    },
    {
      id: 5,
      name: "Whole Wheat Bread",
      description: "Freshly baked, 400 g",
      category: "Bakery",
      price: 45,
      image: "https://i.pinimg.com/736x/9b/87/24/9b8724dc3f7ba8a2a9674ae633e4064c.jpg",
      rating: 4.3,
      deliveryTime: "15 mins"
    },
    {
      id: 6,
      name: "Croissants",
      description: "Buttery, 4 pcs",
      category: "Bakery",
      price: 85,
      image: "https://i.pinimg.com/1200x/f9/91/50/f991505ccd4167cbdf25259e052d73a5.jpg",
      rating: 4.4,
      deliveryTime: "12 mins"
    },
    {
      id: 7,
      name: "Mineral Water",
      description: "1L purified bottle",
      category: "Beverages",
      price: 20,
      image: "https://i.pinimg.com/736x/ef/da/27/efda27f5c7a74c56764bd4270f1004ff.jpg",
      rating: 4.1,
      deliveryTime: "7 mins"
    },
    {
      id: 8,
      name: "Orange Juice",
      description: "Freshly squeezed, 1L",
      category: "Beverages",
      price: 120,
      image: "https://i.pinimg.com/1200x/1d/85/66/1d856623b2d1ee0d53394b6cb0c84a54.jpg",
      rating: 4.5,
      deliveryTime: "10 mins"
    },
    {
      id: 9,
      name: "Potato Chips",
      description: "Crunchy, 50g pack",
      category: "Snacks",
      price: 20,
      image: "https://i.pinimg.com/736x/43/d7/04/43d70491c3558804a4bdcde044e38c9d.jpg",
      rating: 4.3,
      deliveryTime: "9 mins"
    },
    {
      id: 10,
      name: "Chocolate Cookies",
      description: "Choco chip, 200g",
      category: "Snacks",
      price: 65,
      image: "https://i.pinimg.com/736x/2e/6d/1d/2e6d1dfe3cd862d3e884169a75a19510.jpg",
      rating: 4.6,
      deliveryTime: "11 mins"
    },
    {
      id: 11,
      name: "Apples",
      description: "Kashmiri, 1kg",
      category: "Fruits",
      price: 110,
      image: "https://i.pinimg.com/736x/1e/fe/06/1efe0654537adf9efa4bbdcec5eb433c.jpg",
      rating: 4.4,
      deliveryTime: "12 mins"
    },
    {
      id: 12,
      name: "Bananas",
      description: "Fresh yellow, 6 pcs",
      category: "Fruits",
      price: 40,
      image: "https://i.pinimg.com/736x/5d/e9/22/5de9226b74c2d216310205611319a8f7.jpg",
      rating: 4.2,
      deliveryTime: "10 mins"
    }
  ]);

  // Format price in Indian rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get unique categories for filtering
  const categories = [...new Set(products.map(product => product.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter products by category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Group products by category for the category-wise view
  const productsByCategory = {};
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  return (
    <div className="bg-gray-50 py-4 px-4 font-sans bg-white">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Vegetarian Products</h1>
          <div className="text-sm text-gray-500">Delivery in 10 minutes</div>
        </div>
        {/* Category-wise Product Sections (shown when "All" is selected) */}
        {selectedCategory === 'All' ? (
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {categoryProducts.map(product => (
                    <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Category View */
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {selectedCategory}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-300 text-5xl mb-4">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Product Card Component (Blinkit style)
const ProductCard = ({ product, formatPrice }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
    setQuantity(quantity + 1);
  };

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden transition-transform hover:shadow-md flex flex-col h-full">
      {/* Product Image */}
      <div className="h-28 bg-gray-100 flex items-center justify-center p-2">
        <img 
          src={product.image} 
          alt={product.name}
          className="object-contain h-full rounded"
        />
      </div>
      
      {/* Product Details */}
      <div className="p-2 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-800 text-xs mb-1 leading-tight">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.description}</p>
        
        <div className="flex items-center mb-2 mt-auto">
          <div className="flex items-center bg-blue-50 px-1.5 py-0.5 rounded">
            <span className="text-xs font-semibold text-blue-700">{product.rating}</span>
            <svg className="w-3 h-3 text-yellow-400 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 ml-1.5">• {product.deliveryTime}</span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          
          {quantity === 0 ? (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2.5 rounded text-xs transition-colors"
              onClick={handleAdd}
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 bg-blue-100 rounded-full px-1.5 py-0.5">
              <button 
                className="text-blue-600 text-sm font-bold"
                onClick={handleRemove}
              >
                -
              </button>
              <span className="text-xs font-medium text-blue-600">{quantity}</span>
              <button 
                className="text-blue-600 text-sm font-bold"
                onClick={handleAdd}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlinkitProductListing;