'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cartEvents } from '../header/page';
import { useRouter } from 'next/navigation'; // Add this import

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // Add this line

  // Check authentication status
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
    
    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Subscribe to cart events from Header
  useEffect(() => {
    const handleOpenCart = () => {
      setIsOpen(true);
      if (isLoggedIn) {
        fetchCartItems(); // Refresh cart when opened
      }
    };

    cartEvents.subscribe(handleOpenCart);

    return () => {
      cartEvents.unsubscribe(handleOpenCart);
    };
  }, [isLoggedIn]);

  // API helper function
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

  // Fetch cart items from API
  const fetchCartItems = async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await makeAuthenticatedRequest('https://fast2-backend.onrender.com/api/cart/');
      setCartItems(data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      // If auth error, might need to logout
      if (err.message.includes('token') || err.message.includes('auth')) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.dispatchEvent(new Event('authChange'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) return;

    try {
      await makeAuthenticatedRequest('https://fast2-backend.onrender.com/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity
        })
      });
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || !isLoggedIn) return;
    
    try {
      await makeAuthenticatedRequest(`https://fast2-backend.onrender.com/api/cart/update/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantity: newQuantity
        })
      });
      
      // Update local state optimistically
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
      // Refresh cart to get accurate data
      await fetchCartItems();
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    if (!isLoggedIn) return;

    try {
      await makeAuthenticatedRequest(`https://fast2-backend.onrender.com/api/cart/remove/${itemId}`, {
        method: 'DELETE'
      });
      
      // Remove from local state optimistically
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message);
      // Refresh cart to get accurate data
      await fetchCartItems();
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isLoggedIn) return;

    try {
      await makeAuthenticatedRequest('https://fast2-backend.onrender.com/api/cart/clear', {
        method: 'DELETE'
      });
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle different possible API response structures
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const closeCart = () => {
    setIsOpen(false);
    setError(null);
  };

  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  // Show login prompt if not logged in
  if (!isLoggedIn && isOpen) {
    return (
      <>
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-xl border-l border-gray-100 z-60 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-5 flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button
              onClick={closeCart}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 text-blue-200">
                🔒
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Login Required</h3>
              <p className="text-gray-500 mb-6">Please login to view your cart items</p>
              <button
                onClick={() => {
                  closeCart();
                  window.location.href = '/login';
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 z-50"
            onClick={closeCart}
            style={{ backgroundColor: 'transparent' }}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Cart Sidebar - responsive width */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-xl border-l border-gray-100 z-60 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Your Cart</h2>
            <p className="text-blue-100 text-sm mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="flex items-center space-x-2">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-blue-200 hover:text-white text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={closeCart}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xs mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Cart Items */}
        <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] overflow-y-auto p-4">
          {!loading && cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 text-blue-200">
                🛒
              </div>
              <p className="text-lg font-medium text-gray-600">Your cart is empty</p>
              <p className="text-sm mt-2 text-gray-400">Add items to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                // Handle different possible API response structures
                const product = item.product || item;
                const itemId = item._id || item.id;
                const productName = product.name || product.title || 'Unknown Product';
                const productDescription = product.description || '';
                const productPrice = product.price || 0;
                const productImage = product.image || product.imageUrl || '';
                const quantity = item.quantity || 1;

                return (
                  <div key={itemId} className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={productName}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs" style={{display: productImage ? 'none' : 'flex'}}>
                          No Image
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm truncate">{productName}</h3>
                        {productDescription && (
                          <p className="text-gray-500 text-xs mt-1 truncate">{productDescription}</p>
                        )}
                        <p className="text-blue-600 font-bold mt-1">₹{productPrice}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-blue-50 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(itemId, quantity - 1)}
                          disabled={loading}
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(itemId, quantity + 1)}
                          disabled={loading}
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(itemId)}
                        disabled={loading}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 sm:p-5">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Subtotal:</span>
              <span className="font-medium">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Delivery:</span>
              <span className="font-medium">{calculateTotal() > 0 ? '₹25' : '₹0'}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-blue-600">₹{calculateTotal() > 0 ? calculateTotal() + 25 : 0}</span>
            </div>
          </div>
          <button
            disabled={cartItems.length === 0 || loading}
            onClick={() => {
              if (cartItems.length > 0 && !loading) {
                closeCart(); // Close the cart sidebar
                router.push('/checkout'); // Navigate to checkout page
              }
            }}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              cartItems.length === 0 || loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Loading...' : cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={closeCart}
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </>
  );

  // API functions to be used by other components
  Cart.addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to add items to cart');
    }

    try {
      const response = await fetch('https://fast2-backend.onrender.com/api/cart/add', {
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
};

export default Cart;