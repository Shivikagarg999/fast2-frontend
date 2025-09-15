"use client"

import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ 
  product = {}, 
  formatPrice, 
  onProductClick = () => {}, 
  categoryName = "", 
  cartQuantity = 0,
  onAddToCart = () => {}, 
  onUpdateQuantity = () => {}, 
  isAddingToCart = false, 
  isLoggedIn = false
}) => {
  const handleAdd = async (e) => {
    e.stopPropagation();
    if (product?._id) {
      await onAddToCart(product._id, 1);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (cartQuantity > 0 && product?._id) {
      await onUpdateQuantity(product._id, cartQuantity - 1);
    }
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    if (product?._id) {
      await onUpdateQuantity(product._id, cartQuantity + 1);
    }
  };

  const handleCardClick = () => {
    if (product) {
      onProductClick(product);
    }
  };

  // Get the primary image or first image from the images array
  const getProductImage = () => {
    if (!product?.images || product.images.length === 0) {
      return "https://via.placeholder.com/200x200?text=No+Image";
    }
    
    // Try to find primary image first
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) return primaryImage.url;
    
    // Otherwise return the first image
    return product.images[0].url;
  };

  const deliveryTime = `${Math.floor(Math.random() * 11) + 5} mins`;
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

  const discountPercent = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-32 bg-white flex items-center justify-center p-3">
        {discountPercent && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium z-10">
            {discountPercent}% OFF
          </div>
        )}
        <img 
          src={getProductImage()} 
          alt={product?.name || "Product"}
          className="object-contain h-full w-full"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
          }}
        />
      </div>
      
      {/* Product Details */}
      <div className="p-3 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{deliveryTime}</span>
            </div>
            <div className="flex items-center bg-blue-100 px-1.5 py-0.5 rounded">
              <StarSolidIcon className="w-3 h-3 text-blue-600 mr-0.5" />
              <span className="text-xs font-medium text-blue-700">{rating}</span>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight line-clamp-2">
            {product?.name || "Unnamed Product"}
          </h3>
          
          {/* Display category name if available */}
          {categoryName && typeof categoryName === 'string' && (
            <p className="text-xs text-gray-500 mb-1 line-clamp-1">
              {categoryName}
            </p>
          )}
          
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            {product?.description || ""}
          </p>
        </div>
        
        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">
              ₹{product?.price ?? 0}
            </span>
            {product?.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.oldPrice}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Section */}
        <div className="mt-auto">
          {cartQuantity === 0 ? (
            <button 
              className={`w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors duration-200 ${
                isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleAdd}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? 'ADDING...' : 'ADD'}
            </button>
          ) : (
            <div className="flex items-center justify-between border-2 border-blue-600 bg-blue-600 text-white rounded-lg px-2 py-1">
              <button 
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
                onClick={handleRemove}
              >
                <MinusIcon className="w-3 h-3" />
              </button>
              
              <span className="font-bold text-sm px-2">
                {cartQuantity}
              </span>
              
              <button 
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
                onClick={handleIncrement}
              >
                <PlusIcon className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
