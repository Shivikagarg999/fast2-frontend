"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

  // Calculate discount percentage if oldPrice exists and is greater than current price
  const discount = product.oldPrice > product.price 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Construct image URL - you might need to adjust this based on your API
  const imageUrl = product.image.startsWith('http') 
    ? product.image 
    : `https://fast2-backend.onrender.com/images/${product.image}`;

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative">
        <Image
          src={imageUrl}
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
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </div>
        )}
        
        {/* Organic Badge - removed since API doesn't provide this info */}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 p-2 rounded-full shadow-md ${
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
        
        {/* Out of Stock Overlay - removed since API doesn't provide stock info */}
      </div>

      {/* Product Details */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{product.name}</h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        
        {/* Rating - removed since API doesn't provide rating data */}
        
        {/* Weight */}
        <div className="text-sm text-gray-500 mb-4">Weight: {product.weight}</div>
        
        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
          {product.oldPrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ₹{product.oldPrice}
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
            className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}