'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, StarIcon, ClockIcon, ShieldCheckIcon, TruckIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@heroicons/react/24/outline';
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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    checkAuthStatus();
    getProductData();
  }, []);

  useEffect(() => {
    if (product) {
      console.log('Product data:', product);
      console.log('Product variants:', product.variants);
      
      if (product.variants && product.variants.length > 0 && product.variants[0].options.length > 0) {
        const firstVariant = product.variants[0].options[0];
        setSelectedVariant(firstVariant);
        setCurrentPrice(Number(firstVariant.price) || Number(product.price));
        console.log('Setting first variant:', firstVariant);
      } else {
        // No variants, use base product price
        setCurrentPrice(Number(product.price));
      }
    }
  }, [product]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
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

      const cartData = {
        productId: product._id,
        quantity: quantity
      };

      if (selectedVariant) {
        cartData.variantSelection = selectedVariant;
      }

      const response = await fetch('https://api.fast2.in/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cartData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
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

  const calculateDiscount = () => {
    if (product?.oldPrice && product.oldPrice > currentPrice) {
      return Math.round(((product.oldPrice - currentPrice) / product.oldPrice) * 100);
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-2/5 bg-gray-50 flex items-center justify-center p-8">
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
            <div className="md:w-3/5 p-8">
              <div className="mb-4">
                <span className="inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full font-medium border border-blue-200">
                  {product.category?.name || 'Uncategorized'}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>

              {/* Selected Variant Display */}
              {selectedVariant && (
                <p className="text-green-600 font-medium mb-4">
                  Selected: {selectedVariant.value}
                </p>
              )}

              {/* Rating and Delivery Time */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-xs font-semibold text-green-800">
                    {product.ratings?.average || 4.5} • {product.ratings?.count || '2.5k'} ratings
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    Delivery in {product.delivery?.estimatedDeliveryTime || '15-25 mins'}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">₹{currentPrice}</span>
                  {product.oldPrice && product.oldPrice > currentPrice && (
                    <span className="text-lg text-gray-500 line-through">{formatPrice(product.oldPrice)}</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="text-green-600 font-semibold text-sm block mt-1">
                    You save {formatPrice(product.oldPrice - currentPrice)} ({discount}%)
                  </span>
                )}
              </div>

              {/* Variants Section (Blinkit Style) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Select {product.variants[0].name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants[0].options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => {
                          setSelectedVariant(option);
                          // Use the variant price directly (each variant has its own complete price)
                          setCurrentPrice(Number(option.price));
                        }}
                        className={`flex flex-col items-center justify-center w-24 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedVariant?.value === option.value
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-[13px] text-center">{option.value}</span>
                        <span className="font-bold text-[14px] mt-1">₹{option.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 px-2 py-2 rounded-lg">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600 mr-1" />
                  <span>Quality Assured</span>
                </div>
                <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 px-2 py-2 rounded-lg">
                  <TruckIcon className="w-4 h-4 text-blue-600 mr-1" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 px-2 py-2 rounded-lg">
                  <ArrowPathIcon className="w-4 h-4 text-orange-600 mr-1" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-3 py-1">
                      <button 
                        onClick={handleRemove}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-300"
                        disabled={quantity === 1}
                      >
                        <span className="text-lg font-bold text-gray-600">-</span>
                      </button>
                      <span className="w-6 text-center font-semibold text-gray-800">{quantity}</span>
                      <button 
                        onClick={handleAdd}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-300"
                      >
                        <span className="text-lg font-bold text-gray-600">+</span>
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
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Product Description</h2>
          
          <div className={`text-gray-600 leading-relaxed product-description ${!showFullDescription ? 'max-h-32 overflow-hidden' : ''}`}>
            <div dangerouslySetInnerHTML={createMarkup(product.description)} />
          </div>
          
          {product.description && product.description.length > 200 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-4 flex items-center text-green-600 font-medium"
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

        {/* Additional Product Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium">{product.brand || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Unit</span>
                <span className="font-medium">{product.unit || 'Piece'}</span>
              </div>
            </div>
            <div className="space-y-3">
              {product.weight && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium">{product.weight} {product.weightUnit}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Stock</span>
                <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
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
      `}</style>
      
      <Footer/>
    </div> 
  );
};

export default ProductDetailPage;