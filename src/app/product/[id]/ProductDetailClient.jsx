'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Footer from '@/app/components/footer/page';
import ProductCard from '@/app/components/productCard/page';
import { formatWeight } from '@/app/utils/formatWeight';

const ProductDetailClient = ({ initialProduct }) => {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(initialProduct || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!initialProduct);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Image gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    getProductData();
    fetchDiscountInfo();
  }, []);

  useEffect(() => {
    if (product && product.category?._id) {
      fetchRelatedProducts(product.category._id, product._id);
    }
  }, [product]);

  useEffect(() => {
    // Scroll to top when component mounts
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0 && product.variants[0].options.length > 0) {
        const firstVariant = product.variants[0].options[0];
        setSelectedVariant(firstVariant);
        setCurrentPrice(Number(firstVariant.price) || Number(product.price));
      } else {
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

  const getProductData = async () => {
    // Fast path: came here via a product card click, which stashes the full
    // product object so we don't need a second network round-trip.
    if (typeof window !== 'undefined') {
      const storedProduct = sessionStorage.getItem('selectedProduct');
      if (storedProduct) {
        try {
          const productData = JSON.parse(storedProduct);
          if (productData?._id === params.id) {
            setProduct(productData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing product data:', error);
        }
      }
    }

    // Already have it from the server-rendered page (direct link / search engine visit).
    if (initialProduct) {
      setLoading(false);
      return;
    }

    // Last resort: fetch it ourselves (e.g. initial server fetch failed).
    try {
      const response = await fetch(`/proxy/api/product/${params.id}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountInfo = async () => {
    try {
      const response = await fetch('/proxy/api/admin/discount/active');
      const data = await response.json();

      if (data.discounts && data.discounts.length > 0) {
        const storedProduct = sessionStorage.getItem('selectedProduct');
        const productData = storedProduct ? JSON.parse(storedProduct) : initialProduct;
        if (productData) {
          const categoryDiscount = data.discounts.find(discount =>
            discount.category && discount.category._id === productData.category?._id
          );

          if (categoryDiscount) {
            setDiscountInfo(categoryDiscount);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching discount info:', error);
    }
  };

  // Get all product images
  const getProductImages = () => {
    if (!product?.images || product.images.length === 0) {
      return ["https://via.placeholder.com/400x400?text=No+Image"];
    }
    return product.images.map(img => img.url);
  };

  // Get current displayed image
  const getCurrentImage = () => {
    const images = getProductImages();
    return images[selectedImageIndex] || images[0];
  };

  // Navigate to next image
  const nextImage = () => {
    const images = getProductImages();
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  // Navigate to previous image
  const prevImage = () => {
    const images = getProductImages();
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Open image in modal
  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
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

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    setLoadingRelated(true);
    try {
      const userPincode = localStorage.getItem('userPincode');
      let url = `/proxy/api/product/category/${categoryId}`;
      const params = new URLSearchParams();

      if (userPincode) {
        params.append('pincode', userPincode);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.data || data || [];
        // Filter out the current product and limit to 8 products
        const filtered = products
          .filter(p => p._id !== currentProductId)
          .slice(0, 8);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleProductClick = (product) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
      window.scrollTo(0, 0);
    }
    router.push(`/product/${product._id}`);
  };

  const addToCart = async (productId, quantity = 1, price) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/proxy/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity,
          price
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        setCartMessage('Product added to cart successfully!');
        setTimeout(() => setCartMessage(''), 3000);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setShowLoginPrompt(true);
          setTimeout(() => setShowLoginPrompt(false), 3000);
        }
        throw new Error(responseData.error || responseData.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setCartMessage(err.message || 'Failed to add item to cart. Please try again.');
      setTimeout(() => setCartMessage(''), 3000);
    }
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
        quantity: quantity,
        price: displayPrice
      };

      if (selectedVariant) {
        cartData.variantSelection = selectedVariant;
      }

      const response = await fetch('/proxy/api/cart/add', {
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

  // Calculate discount information
  const calculateDiscount = () => {
    const campaignDiscountPercentage = Number(product?.campaignDiscountPercentage) || 0;
    const effectivePrice = Number(product?.effectivePrice) || currentPrice;

    if (!selectedVariant && campaignDiscountPercentage > 0) {
      return {
        hasDiscount: true,
        discountPercent: campaignDiscountPercentage,
        originalPrice: currentPrice,
        discountedPrice: effectivePrice,
        type: 'campaign',
        discountName: null,
        savings: currentPrice - effectivePrice
      };
    }

    return {
      hasDiscount: false,
      discountPercent: 0,
      originalPrice: currentPrice,
      discountedPrice: currentPrice,
      type: null,
      savings: 0
    };
  };

  const discount = calculateDiscount();
  const displayPrice = discount.hasDiscount ? discount.discountedPrice : currentPrice;
  const images = getProductImages();
  const hasMultipleImages = images.length > 1;
  const medicineDetails = product?.medicineDetails || {};
  const prescriptionRequired =
    product?.isPrescriptionRequired ||
    product?.prescriptionRequired ||
    product?.requiresPrescription ||
    product?.shop?.shopType === 'medical';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">

      {showLoginPrompt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm font-medium">Please login to add items to cart</p>
        </div>
      )}

      {cartMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
          cartMessage.includes('success') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="text-sm font-medium">{cartMessage}</p>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="flex items-center justify-center h-full">
              <img
                src={getCurrentImage()}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={closeImageModal}
              />
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
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
            {/* Product Image Gallery */}
            <div className="md:w-2/5 bg-gray-50 p-8">
              <div className="max-w-md mx-auto">
                {/* Main Image */}
                <div className="relative mb-4">
                  <div
                    className="w-full h-80 bg-white rounded-lg overflow-hidden cursor-zoom-in flex items-center justify-center"
                    onClick={() => openImageModal(selectedImageIndex)}
                  >
                    <img
                      src={getCurrentImage()}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
                      }}
                    />

                    {/* Navigation arrows for main image */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Discount Badges */}
                  {discount.hasDiscount && (
                    <div className="absolute top-4 left-4 space-y-2">
                      <div className="px-4 py-2 rounded-full text-white font-bold shadow-lg bg-gradient-to-r from-purple-500 to-pink-500">
                        {discount.discountPercent}% OFF
                      </div>
                      {discount.discountName && (
                        <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-semibold shadow-lg">
                          {discount.discountName}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {hasMultipleImages && (
                  <div className="flex space-x-2 overflow-x-auto py-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedImageIndex === index
                            ? 'border-green-500 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Image {selectedImageIndex + 1} of {images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info - Right Side */}
            <div className="md:w-3/5 p-8">
              <div className="mb-4">
                <span className="inline-block bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full font-medium border border-green-200">
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
                  <span className="text-3xl font-bold text-gray-900">₹{Math.round(displayPrice)}</span>

                  {discount.hasDiscount && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(discount.originalPrice)}
                    </span>
                  )}
                </div>

                {discount.hasDiscount && (
                  <span className="text-green-600 font-semibold text-sm block mt-1">
                    You save {formatPrice(discount.savings)} ({discount.discountPercent}%)
                  </span>
                )}
              </div>

              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Select {product.variants[0].name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants[0].options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => {
                          setSelectedVariant(option);
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
                  <TruckIcon className="w-4 h-4 text-green-600 mr-1" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 px-2 py-2 rounded-lg">
                  <ArrowPathIcon className="w-4 h-4 text-orange-600 mr-1" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {prescriptionRequired && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="font-semibold text-amber-800">Prescription Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Doctor prescription is required to purchase this medicine.
                  </p>
                </div>
              )}

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
                  className="w-full bg-white text-green-600 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span className="font-medium">{formatWeight(product.weight, product.weightUnit)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Stock</span>
                <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {(medicineDetails.salt || medicineDetails.composition) && (
                <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                  <span className="text-gray-500">Salt / Composition</span>
                  <span className="font-medium text-right">{medicineDetails.salt || medicineDetails.composition}</span>
                </div>
              )}
              {medicineDetails.dosage && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Dosage</span>
                  <span className="font-medium">{medicineDetails.dosage}</span>
                </div>
              )}
              {medicineDetails.manufacturer && (
                <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                  <span className="text-gray-500">Manufacturer</span>
                  <span className="font-medium text-right">{medicineDetails.manufacturer}</span>
                </div>
              )}
              {medicineDetails.expiryDate && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Expiry Date</span>
                  <span className="font-medium">{new Date(medicineDetails.expiryDate).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More Products from {product.category?.name || 'This Category'}</h2>

            {loadingRelated ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                    formatPrice={formatPrice}
                    onProductClick={handleProductClick}
                    categoryName={product.category?.name || ''}
                    cartQuantity={0}
                    onAddToCart={addToCart}
                    onUpdateQuantity={() => {}}
                    isAddingToCart={false}
                    isLoggedIn={isLoggedIn}
                    discountInfo={discountInfo}
                  />
                ))}
              </div>
            )}
          </div>
        )}
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

      <div className="mt-auto"><Footer/></div>
    </div>
  );
};

export default ProductDetailClient;
