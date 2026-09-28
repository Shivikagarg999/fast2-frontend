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
      className="bg-white rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col h-full cursor-pointer border border-gray-100 relative"
      onClick={handleCardClick}
    >
      {/* Discount Badge — overall % off vs MRP (oldPrice), covering any active campaign too */}
      {hasMrpDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <div className="px-1.5 py-0.5 rounded text-[11px] font-bold text-white shadow-sm bg-red-600">
            {mrpDiscountPercent}% OFF
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-28 sm:h-32 bg-white flex items-center justify-center p-2">
        <img
          src={getProductImage()}
          alt={product?.name || "Product"}
          className={`object-contain h-full w-full transition-transform duration-300 hover:scale-105 ${
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
      <div className="px-2.5 pb-2.5 pt-1 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-0.5 leading-tight line-clamp-2 min-h-[2.2em]">
          {product?.name || "Unnamed Product"}
        </h3>

        {/* Product Weight */}
        {product?.weight && (
          <p className="text-xs text-gray-500 mb-2">
            {formatWeight(product.weight, product?.weightUnit)}
          </p>
        )}

        {/* Price + Add row */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900">
              {formatDisplayPrice(displayPrice)}
            </div>
            {hasMrpDiscount && (
              <div className="text-xs text-gray-400 line-through">
                {formatDisplayPrice(mrp)}
              </div>
            )}
          </div>

          {product?.stockStatus === 'out-of-stock' ? (
            <button
              className="flex-shrink-0 bg-gray-100 text-gray-400 py-1.5 px-3 rounded-lg text-xs font-bold cursor-not-allowed border border-gray-200"
              disabled
            >
              ADD
            </button>
          ) : cartQuantity === 0 ? (
            <button
              className={`flex-shrink-0 bg-white text-brand-600 hover:bg-brand-50 py-1.5 px-4 rounded-lg text-xs font-extrabold tracking-wide border border-brand-500 transition-colors ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={handleAdd}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center">
                  <LoadingDots size="sm" className="text-brand-600 mr-1" />
                  ADD
                </span>
              ) : (
                'ADD'
              )}
            </button>
          ) : (
            <div className="flex-shrink-0 flex items-center justify-between bg-brand-600 text-white rounded-lg shadow-sm h-8">
              <button
                className="w-7 h-full flex items-center justify-center hover:bg-brand-700 rounded-l-lg transition-colors"
                onClick={handleRemove}
              >
                <MinusIcon className="w-3.5 h-3.5 font-bold" />
              </button>

              <span className="font-bold text-xs px-1 min-w-[1.25rem] text-center">
                {cartQuantity}
              </span>

              <button
                className="w-7 h-full flex items-center justify-center hover:bg-brand-700 rounded-r-lg transition-colors"
                onClick={handleIncrement}
              >
                <PlusIcon className="w-3.5 h-3.5 font-bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
