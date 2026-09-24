"use client"
import LoadingDots from '@/app/components/loaders/LoadingDots';

import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { formatWeight } from '../../utils/formatWeight';

const ProductCard = ({
  product = {},
  formatPrice,
  onProductClick = () => { },
  categoryName = "",
  cartQuantity = 0,
  onAddToCart = () => { },
  onUpdateQuantity = () => { },
  isAddingToCart = false,
  isLoggedIn = false
}) => {
  const getNumber = (value, fallback = 0) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
  };

  const originalPrice = getNumber(product?.price);
  const effectivePrice = getNumber(product?.effectivePrice, originalPrice);
  const campaignDiscountPercent = getNumber(product?.campaignDiscountPercentage);
  const hasDiscount = campaignDiscountPercent > 0;
  const displayPrice = hasDiscount ? effectivePrice : originalPrice;

  // Overall discount vs MRP (oldPrice), covering both a marked-up list price and any
  // active campaign discount - this drives the badge AND the struck-through price shown
  // on the card, so a plain price markdown (no active campaign) still shows crossed out.
  const mrp = getNumber(product?.oldPrice);
  const hasMrpDiscount = mrp > displayPrice;
  const mrpDiscountPercent = hasMrpDiscount ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;
  const mrpSavings = Math.max(mrp - displayPrice, 0);

  const formatDisplayPrice = (price) => {
    const roundedPrice = Math.round(getNumber(price));
    return formatPrice ? formatPrice(roundedPrice) : `\u20B9${roundedPrice}`;
  };


  const handleAdd = async (e) => {
    e.stopPropagation();
    if (product?._id) {
      await onAddToCart(product._id, 1, effectivePrice, product);
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

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col h-full cursor-pointer border border-gray-200 shadow-sm relative"
      onClick={handleCardClick}
    >
      {/* Discount Badge — overall % off vs MRP (oldPrice), covering any active campaign too */}
      {hasMrpDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <div className="px-2 py-1 rounded-md text-xs font-extrabold text-white shadow-sm bg-red-600">
            {mrpDiscountPercent}% OFF
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-32 bg-gray-50 flex items-center justify-center">
        <img
          src={getProductImage()}
          alt={product?.name || "Product"}
          className={`object-cover h-full w-full transition-transform duration-300 hover:scale-105 ${
            product?.stockStatus === 'out-of-stock' ? 'opacity-80' : ''
          }`}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
          }}
        />
        
        {/* Out of Stock Overlay */}
        {product?.stockStatus === 'out-of-stock' && (
          <div className="absolute inset-0 bg-white/30 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                Out of Stock
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight line-clamp-2">
            {product?.name || "Unnamed Product"}
          </h3>

          {/* Product Weight */}
          {product?.weight && (
            <p className="text-xs text-gray-500 mb-2 font-medium">
              {formatWeight(product.weight, product?.weightUnit)}
            </p>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-1">
            {/* Selling price as main price */}
            <span className="text-base font-extrabold text-gray-900">
              {formatDisplayPrice(displayPrice)}
            </span>

            {/* MRP crossed out whenever it's higher than the selling price */}
            {hasMrpDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatDisplayPrice(mrp)}
              </span>
            )}
          </div>

          {/* Savings vs MRP */}
          {hasMrpDiscount && mrpSavings > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-brand-700 font-bold">
                Save {formatDisplayPrice(mrpSavings)}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart Section */}
        <div className="mt-auto">
          {product?.stockStatus === 'out-of-stock' ? (
            <button
              className="w-full bg-gray-100 text-gray-500 py-2 px-3 rounded-xl text-sm font-bold cursor-not-allowed border border-gray-200"
              disabled
            >
              Out of Stock
            </button>
          ) : cartQuantity === 0 ? (
            <button
              className={`w-full bg-brand-600 text-white hover:bg-brand-700 py-2 px-3 rounded-xl text-sm font-extrabold tracking-wide transition-all duration-200 shadow-sm ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={handleAdd}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center">
                  <LoadingDots size="sm" className="text-white mr-2" />
                  ADDING
                </span>
              ) : (
                'ADD'
              )}
            </button>
          ) : (
            <div className="flex items-center justify-between bg-brand-600 text-white rounded-xl shadow-sm h-9">
              <button
                className="w-8 h-full flex items-center justify-center hover:bg-brand-700 rounded-l-xl transition-colors"
                onClick={handleRemove}
              >
                <MinusIcon className="w-4 h-4 font-bold" />
              </button>

              <span className="font-bold text-sm px-1 min-w-[1.5rem] text-center">
                {cartQuantity}
              </span>

              <button
                className="w-8 h-full flex items-center justify-center hover:bg-brand-700 rounded-r-xl transition-colors"
                onClick={handleIncrement}
              >
                <PlusIcon className="w-4 h-4 font-bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
