'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, StarIcon, ClockIcon, ShieldCheckIcon, TruckIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Footer from '@/app/components/footer/page';

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    checkAuthStatus();
    getProductData();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Verify token format and expiration
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          console.log('Token expired');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('Invalid token:', error.message);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  const getProductData = () => {
    if (typeof window !== 'undefined') {
      const storedProduct = sessionStorage.getItem('selectedProduct');
      if (storedProduct) {
        try {
          const productData = JSON.parse(storedProduct);
          setProduct(productData);
        } catch (error) {
          console.error('Error parsing product data:', error);
        }
      }
    }
    setLoading(false);
  };

  const getProductImage = () => {
    if (!product?.images || product.images.length === 0) {
      return "https://via.placeholder.com/400x400?text=No+Image";
    }
    
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) return primaryImage.url;
    
    return product.images[0].url;
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent || 'No detailed description available.' };
  };

  const handleAdd = () => {
    setQuantity(quantity + 1);
  };

  const handleRemove = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setAddingToCart(true);
    setCartMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setShowLoginPrompt(true);
        setTimeout(() => setShowLoginPrompt(false), 3000);
        return;
      }

      const response = await fetch('https://api.fast2.in/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setCartMessage('Session expired. Please login again.');
          setTimeout(() => setCartMessage(''), 3000);
          return;
        }
        throw new Error(data.error || data.message || 'Failed to add to cart');
      }

      setCartMessage('Product added to cart successfully!');
      setTimeout(() => setCartMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage(error.message || 'Failed to add to cart. Please try again.');
      setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    // Implement buy now logic here
    console.log(`Buying ${quantity} of ${product?.name} now`);
  };

  const calculateDiscount = () => {
    if (product?.oldPrice && product.oldPrice > product.price) {
      return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Login Prompt Toast */}
      {showLoginPrompt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <p className="text-sm font-medium">Please login to add items to cart</p>
        </div>
      )}

      {/* Cart Message Toast */}
      {cartMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
          cartMessage.includes('success') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="text-sm font-medium">{cartMessage}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                <img 
                  src={getProductImage()} 
                  alt={product.name}
                  className="w-full h-80 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                    {discount}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Product Info - Right Side */}
            <div className="md:w-1/2 p-8">
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-full font-medium">
                  {product.category?.name || 'Uncategorized'}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Product Qualities */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Key Features:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>High quality {product.brand || 'product'}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Perfect for daily use</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Fresh and premium quality</span>
                  </li>
                  {product.weight && (
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Net weight: {product.weight}{product.weightUnit}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Rating and Delivery Time */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                  <StarIconSolid className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-sm font-semibold text-green-800">
                    {product.ratings?.average || 4.5} • {product.ratings?.count || '2.5k'} ratings
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    Delivery in {product.delivery?.estimatedDeliveryTime || '15-25 mins'}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.oldPrice)}</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="text-green-600 font-semibold mt-2 block">
                    You save {formatPrice(product.oldPrice - product.price)} ({discount}%)
                  </span>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span>Quality Assured</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TruckIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ArrowPathIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-700 text-lg">Quantity:</span>
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                      <button 
                        onClick={handleRemove}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-300"
                        disabled={quantity === 1}
                      >
                        <span className="text-xl font-bold text-gray-600">-</span>
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800 text-lg">{quantity}</span>
                      <button 
                        onClick={handleAdd}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-300"
                      >
                        <span className="text-xl font-bold text-gray-600">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section with Read More */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
          
          <div className={`text-gray-600 leading-relaxed product-description ${!showFullDescription ? 'max-h-32 overflow-hidden' : ''}`}>
            <div dangerouslySetInnerHTML={createMarkup(product.description)} />
          </div>
          
          {product.description && product.description.length > 200 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-4 flex items-center text-blue-600 font-medium"
            >
              {showFullDescription ? (
                <>
                  <ChevronUpIcon className="w-5 h-5 mr-1" />
                  Read Less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-5 h-5 mr-1" />
                  Read More
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .product-description :global(p) {
          margin-bottom: 1rem;
        }
        .product-description :global(strong) {
          font-weight: bold;
        }
        .product-description :global(em) {
          font-style: italic;
        }
        .product-description :global(ul) {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description :global(ol) {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description :global(li) {
          margin-bottom: 0.5rem;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      
      <Footer/>
    </div> 
  );
};

export default ProductDetailPage;