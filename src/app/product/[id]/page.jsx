'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Footer from '@/app/components/footer/page';

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get product data from sessionStorage
    if (typeof window !== 'undefined') {
      const storedProduct = sessionStorage.getItem('selectedProduct');
      if (storedProduct) {
        setProduct(JSON.parse(storedProduct));
      }
    }
    setLoading(false);
  }, []);

  // Format price in Indian rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAdd = () => {
    setQuantity(quantity + 1);
  };

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddToCart = () => {
    // Add your cart logic here
    console.log(`Added ${quantity} of ${product.name} to cart`);
    // You can integrate this with your cart state management
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className=" mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
              <img 
                src={product.image} 
                alt={product.name}
                className="max-w-full max-h-80 object-contain rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  {product.category}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>

              {/* Rating and Delivery Time */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                  <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold text-green-700">{product.rating}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">Delivery in {product.deliveryTime}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-800">{formatPrice(product.price)}</span>
                <span className="text-gray-500 ml-2">per unit</span>
              </div>

              {/* Full Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">About this product</h3>
                <p className="text-gray-600 leading-relaxed">{product.fullDescription}</p>
              </div>

              {/* Quantity Selector and Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                      <button 
                        onClick={handleRemove}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                        disabled={quantity === 0}
                      >
                        <span className="text-lg font-bold text-gray-600">-</span>
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">{quantity}</span>
                      <button 
                        onClick={handleAdd}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-bold text-gray-600">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatPrice(product.price * quantity)}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={quantity === 0}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${
                    quantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {quantity === 0 ? 'Select quantity to add to cart' : `Add ${quantity} to Cart`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ProductDetailPage;