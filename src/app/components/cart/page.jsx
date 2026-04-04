'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cartEvents } from '../header/page';
import { useRouter } from 'next/navigation';

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const updateHeaderCartCount = () => {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      if (token) {
        fetchCartItems();
      } else {
        setCartItems([]);
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleOpenCart = () => {
      setIsOpen(true);
      if (isLoggedIn) {
        fetchCartItems();
      }
    };

    cartEvents.subscribe(handleOpenCart);

    return () => {
      cartEvents.unsubscribe(handleOpenCart);
    };
  }, [isLoggedIn]);

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    return response.json();
  };

  const fetchCartItems = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const data = await makeAuthenticatedRequest('http://localhost:5000/api/cart/');
      setCartItems(data.items || []);
      updateHeaderCartCount();
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      if (err.message.includes('token') || err.message.includes('auth')) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.dispatchEvent(new Event('authChange'));
        updateHeaderCartCount();
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) return;

    try {
      await makeAuthenticatedRequest('http://localhost:5000/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity
        })
      });
      await fetchCartItems();
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || !isLoggedIn) return;

    try {
      await makeAuthenticatedRequest(`http://localhost:5000/api/cart/update/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      updateHeaderCartCount();
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
      await fetchCartItems();
    }
  };

  const removeItem = async (itemId) => {
    if (!isLoggedIn) return;

    try {
      await makeAuthenticatedRequest(`http://localhost:5000/api/cart/remove/${itemId}`, {
        method: 'DELETE'
      });

      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
      updateHeaderCartCount();
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message);
      await fetchCartItems();
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) return;

    try {
      await makeAuthenticatedRequest('http://localhost:5000/api/cart/clear', {
        method: 'DELETE'
      });
      setCartItems([]);
      updateHeaderCartCount();
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateTotal();

    // Global Free Delivery Threshold - same as backend logic
    if (subtotal > 199) {
      return 0;
    }

    // Otherwise, sum up individual product delivery charges
    return cartItems.reduce((total, item) => {
      const product = item.product || item;
      return total + (product.delivery?.deliveryCharges || 0);
    }, 0);
  };

  const calculateGst = () => {
    return cartItems.reduce((total, item) => {
      if (item.gstAmount > 0) return total + item.gstAmount;
      // Fallback: compute from category gstPercent (handles pre-schema items)
      const gstPercent = item.gstPercent || item.product?.category?.gstPercent || 0;
      const itemSubtotal = (item.price || 0) * (item.quantity || 0);
      return total + parseFloat(((itemSubtotal * gstPercent) / 100).toFixed(2));
    }, 0);
  };

  const closeCart = () => {
    setIsOpen(false);
    setError(null);
  };

  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  const deliveryFee = calculateDeliveryFee();
  const subTotal = calculateTotal();
  const gstTotal = calculateGst();
  const finalTotal = subTotal + deliveryFee + gstTotal;

  // Helper to format weight from product
  const getProductWeight = (product) => {
    if (product.weight) {
      return `${product.weight} ${product.weightUnit || ''}`;
    }
    return '';
  };

  if (!isLoggedIn && isOpen) {
    return (
      <>
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-gray-800">My Cart</h2>
            <button
              onClick={closeCart}
              className="text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 p-2 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-3xl mb-4">
              🔒
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Login Required</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">Please login to view items in your cart</p>
            <button
              onClick={() => {
                closeCart();
                window.location.href = '/login';
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-shadow shadow-lg shadow-green-200"
            >
              Login to Proceed
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={closeCart}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">My Cart</h2>
            <p className="text-xs text-gray-500 mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="flex items-center space-x-3">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 p-2 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-4 mx-4 mt-4 rounded-xl flex justify-between items-start shrink-0">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700 ml-2"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!loading && cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
                🛒
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-gray-500 text-sm max-w-[200px]">Add items from the store to see them here</p>
              <button
                onClick={closeCart}
                className="mt-6 text-green-600 font-bold text-sm bg-green-50 px-6 py-2.5 rounded-xl hover:bg-green-100 transition-colors"
                style={{ width: 'auto' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const itemId = item._id || item.id;
                  const productName = product.name || product.title || 'Unknown Product';
                  const productWeight = getProductWeight(product);
                  const productPrice = product.price || 0;
                  const quantity = item.quantity || 1;

                  let productImage = '';
                  if (product.images && product.images.length > 0) {
                    productImage = product.images[0].url || '';
                  } else if (product.image) {
                    productImage = product.image;
                  } else if (product.imageUrl) {
                    productImage = product.imageUrl;
                  }

                  return (
                    <div key={itemId} className="flex gap-3 bg-white">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs" style={{ display: productImage ? 'none' : 'flex' }}>
                          No Image
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{productName}</h3>
                          {productWeight && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">{productWeight}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">₹{productPrice}</span>
                            {product.delivery?.deliveryCharges > 0 && (
                              <span className="text-[10px] text-gray-500">+ ₹{product.delivery.deliveryCharges} del.</span>
                            )}
                          </div>

                          {/* Quantity Control Pill */}
                          <div className="flex items-center bg-green-600 rounded-lg shadow-sm shadow-green-100 p-1 h-8">
                            <button
                              onClick={() => quantity === 1 ? removeItem(itemId) : updateQuantity(itemId, quantity - 1)}
                              disabled={loading}
                              className="w-7 h-full text-white flex items-center justify-center hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-white font-bold text-sm">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(itemId, quantity + 1)}
                              disabled={loading}
                              className="w-7 h-full text-white flex items-center justify-center hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bill Details */}
              <div className="bg-gray-50 rounded-2xl p-4 mt-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bill Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Item Total</span>
                    <span>₹{subTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <div className="flex items-center">
                      <span>Delivery Fee</span>
                      {deliveryFee === 0 && (
                        <span className="ml-2 bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">FREE</span>
                      )}
                    </div>
                    <div className="text-right">
                      {subTotal > 199 ? (
                        <div>
                          <span className="text-gray-400 line-through text-xs">₹{cartItems.reduce((total, item) => {
                            const product = item.product || item;
                            return total + (product.delivery?.deliveryCharges || 0);
                          }, 0)}</span>
                          <span className="text-green-600 ml-2 font-medium">₹0</span>
                        </div>
                      ) : (
                        <span>{deliveryFee > 0 ? `₹${deliveryFee}` : '₹0'}</span>
                      )}
                    </div>
                  </div>

                  {subTotal > 199 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                      <p className="text-xs text-green-700 font-medium">
                        🎉 Free delivery applied! Your order exceeds ₹199
                      </p>
                    </div>
                  )}
                  {gstTotal > 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>GST</span>
                      <span>₹{gstTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Padding for bottom fixed button */}
              <div className="h-24"></div>
            </>
          )}
        </div>

        {/* Bottom Action Bar */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 text-center z-10">
            <button
              disabled={loading}
              onClick={() => {
                closeCart();
                router.push('/checkout');
              }}
              className="w-full bg-green-600 text-white py-3.5 px-4 rounded-xl font-bold text-base shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-between items-center group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-start px-2">
                <span className="text-xs font-medium opacity-90">Total</span>
                <span className="text-lg">₹{finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center text-white/95 group-hover:text-white">
                Proceed
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      )}
    </>
  );
};

Cart.addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Please login to add items to cart');
  }

  try {
    const response = await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        quantity
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add to cart');
    }

    return response.json();
  } catch (err) {
    console.error('Error adding to cart:', err);
    throw err;
  }
};

export default Cart;