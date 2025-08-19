"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function ProductCard() {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Sample product data
  const product = {
    id: 1,
    name: 'Organic Avocados',
    description: 'Fresh organic avocados, rich in nutrients and perfect for your healthy diet.',
    price: 4.99,
    originalPrice: 6.99,
    rating: 4.5,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    category: 'Fruits & Vegetables',
    weight: '500g',
    organic: true,
    inStock: true,
    discount: 25,
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    console.log(`Product ${isWishlisted ? 'removed from' : 'added to'} wishlist`);
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} ${product.name} to cart`);
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-64 object-cover"
          onError={(e) => {
            console.error('Image failed to load');
            e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
          }}
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Organic Badge */}
        {product.organic && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            ORGANIC
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-12 right-4 p-2 rounded-full shadow-md ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={isWishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold py-2 px-4 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{product.name}</h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-gray-600 text-sm ml-2">
            {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>
        
        {/* Weight */}
        <div className="text-sm text-gray-500 mb-4">Weight: {product.weight}</div>
        
        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Quantity Selector and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-3 py-2">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-lg font-medium ${
              product.inStock
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}