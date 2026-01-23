"use client"

import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProductCard = ({
  product = {},
  formatPrice,
  onProductClick = () => { },
  categoryName = "",
  cartQuantity = 0,
  onAddToCart = () => { },
  onUpdateQuantity = () => { },
  isAddingToCart = false,
  isLoggedIn = false,
  discountInfo = null
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

  const getProductImage = () => {
    if (!product?.images || product.images.length === 0) {
      return "https://via.placeholder.com/200x200?text=No+Image";
    }

    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) return primaryImage.url;

    return product.images[0].url;
  };

  // Strip HTML tags for plain text preview
  const getPlainTextDescription = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, '').substring(0, 100);
  };


  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

  const calculateDiscountInfo = () => {
    if (discountInfo && discountInfo.discountPercentage > 0) {
      const discountedPrice = product.price - (product.price * discountInfo.discountPercentage / 100);
      return {
        hasDiscount: true,
        discountPercent: discountInfo.discountPercentage,
        originalPrice: product.price,
        discountedPrice: discountedPrice,
        type: 'category',
        discountName: discountInfo.name,
        savings: product.price - discountedPrice
      };
    }

    return {
      hasDiscount: false,
      discountPercent: 0,
      originalPrice: product.price,
      discountedPrice: product.price,
      type: null,
      savings: 0
    };
  };

  const discount = calculateDiscountInfo();
  const displayPrice = discount.hasDiscount ? discount.discountedPrice : product.price;

  return (
    <div
      className="bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col h-full cursor-pointer border border-gray-100 hover:border-gray-200 relative"
      onClick={handleCardClick}
    >
      {/* Discount Badge - ONLY show if there's an APPLIED discount */}
      {discount.hasDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <div className="px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r from-purple-500 to-pink-500">
            {discount.discountPercent}% OFF
          </div>
          {discount.discountName && (
            <div className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              {discount.discountName}
            </div>
          )}
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-32 bg-gray-50 flex items-center justify-center p-3">
        <img
          src={getProductImage()}
          alt={product?.name || "Product"}
          className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
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
              {product?.delivery?.deliveryCharges > 0 ? (
                <span className="text-xs text-gray-500">
                  Delivery: ₹{product.delivery.deliveryCharges}
                </span>
              ) : (
                <span className="text-xs text-green-600 font-medium">Free Delivery</span>
              )}
            </div>
          </div>

          <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight line-clamp-2">
            {product?.name || "Unnamed Product"}
          </h3>



          {/* Product Weight */}
          {product?.weight && (
            <p className="text-xs text-gray-500 mb-2 font-bold">
              {product.weight} {product?.weightUnit || ''}
            </p>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-1">
            {/* DISCOUNTED PRICE as main price */}
            <span className="text-sm font-bold text-gray-900">
              ₹{Math.round(displayPrice)}
            </span>

            {/* Show ORIGINAL price crossed out if there's discount */}
            {discount.hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Math.round(discount.originalPrice)}
              </span>
            )}
          </div>

          {/* Show savings if there's discount */}
          {discount.hasDiscount && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-green-600 font-semibold">
                Save ₹{Math.round(discount.savings)}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart Section */}
        <div className="mt-auto">
          {cartQuantity === 0 ? (
            <button
              className={`w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors duration-200 ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
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