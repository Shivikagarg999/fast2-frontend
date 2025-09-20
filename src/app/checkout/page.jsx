'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CheckoutPage = () => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Confirmation
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const router = useRouter();

  // Form state - updated to match API requirements
  const [shippingInfo, setShippingInfo] = useState({
    addressLine: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    phone: '',
    firstName: '', // Additional field for UI
    lastName: '',  // Additional field for UI
    email: ''      // Additional field for UI
  });

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('https://api.fast2.in/api/cart/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        console.log('Cart data:', data);
        
        setCart(data);
        if (data.items && data.items.length > 0) {
          setCartItems(data.items);
        } else if (data.cart && data.cart.items && data.cart.items.length > 0) {
          setCartItems(data.cart.items);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const calculateTotal = () => {
    if (cart && cart.total) {
      return cart.total;
    }
    
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShipping = () => {
    // Required fields for API
    const apiRequiredFields = ['addressLine', 'city', 'state', 'pinCode', 'phone'];
    
    // Required fields for UI
    const uiRequiredFields = ['firstName', 'lastName', 'email'];
    
    // Check API required fields
    for (let field of apiRequiredFields) {
      if (!shippingInfo[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Check UI required fields
    for (let field of uiRequiredFields) {
      if (!shippingInfo[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!/^\d{10}$/.test(shippingInfo.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!/^\d{6}$/.test(shippingInfo.pinCode)) {
      setError('Please enter a valid 6-digit PIN code');
      return false;
    }

    setError(null);
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;

    setProcessing(true);
    const token = localStorage.getItem('token');

    try {
      // Prepare the request body according to API requirements
      const orderData = {
        shippingAddress: {
          addressLine: shippingInfo.addressLine,
          city: shippingInfo.city,
          state: shippingInfo.state,
          pinCode: shippingInfo.pinCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone
        },
        paymentMethod: 'cod'
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('https://api.fast2.in/api/order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textResponse = await response.text();
        console.log('Non-JSON response:', textResponse);
        
        // Try to parse as JSON anyway
        try {
          responseData = JSON.parse(textResponse);
        } catch {
          throw new Error(`Server returned unexpected response: ${textResponse.substring(0, 100)}...`);
        }
      }

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to place order');
      }

      // Extract order ID from response
      const orderId = responseData.orderId || responseData._id || responseData.id;
      setOrderId(orderId || 'N/A');
      setStep(2); // Success step

      // Clear cart after successful order
      try {
        await fetch('https://api.fast2.in/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError);
        // Don't show this error to the user as the order was successful
      }
    } catch (err) {
      setError(err.message);
      console.error('Order placement error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0 && step !== 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Progress Bar */}
          <div className="border-b border-gray-200">
            <div className="flex justify-center items-center p-6">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600' : 'border-gray-300'}`}>
                  {step > 1 ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Shipping Details</span>
              </div>

              <div className="flex-1 h-1 bg-gray-200 mx-4 max-w-20">
                <div className={`h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>

              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-6">
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="p-6 md:flex md:space-x-8">
            {/* Left Column - Form */}
            <div className="md:w-2/3">
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        maxLength="10"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line *</label>
                    <input
                      type="text"
                      name="addressLine"
                      value={shippingInfo.addressLine}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Street address, apartment, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={shippingInfo.pinCode}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        maxLength="6"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">Payment Method</h3>
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center mr-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-blue-800 font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">Pay with cash when your order is delivered.</p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-4">Thank you for your purchase. Your order will be delivered soon.</p>
                  <div className="bg-green-50 p-4 rounded-md max-w-md mx-auto mb-6">
                    <h3 className="font-medium text-green-800 mb-2">Payment Method: Cash on Delivery</h3>
                    <p className="text-sm text-green-600">Please keep cash ready for when your order arrives.</p>
                  </div>
                  {orderId && orderId !== 'N/A' && (
                    <p className="text-sm text-gray-500 mb-6">Order ID: #{orderId}</p>
                  )}
                  <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:w-1/3 mt-8 md:mt-0">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => {
                    const productName = item.product?.name || item.product?.title || 'Unknown Product';
                    const productPrice = item.price || item.product?.price || 0;
                    const quantity = item.quantity || 1;

                    return (
                      <div key={item._id} className="flex justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{productName}</p>
                          <p className="text-xs text-gray-500">Qty: {quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-800">₹{productPrice * quantity}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium text-gray-800">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivery</span>
                    <span className="text-sm font-medium text-gray-800">₹25</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-base font-bold text-gray-800">Total</span>
                    <span className="text-base font-bold text-blue-600">₹{calculateTotal() + 25}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;