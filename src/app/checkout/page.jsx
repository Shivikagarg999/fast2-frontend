"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LockClosedIcon, 
  TruckIcon, 
  CreditCardIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Header from '../components/header/page';
import Footer from '../components/footer/page';

export default function Checkout() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      if (!token) {
        router.push('/login?redirect=checkout');
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [router]);

  // Fetch cart items
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://193.203.163.101:5000/api/cart/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        setCartItems(data.items || []);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isLoggedIn]);

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const deliveryCharge = calculateSubtotal() > 0 ? 25 : 0;
  const totalAmount = calculateSubtotal() + deliveryCharge;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: cartItems,
        deliveryAddress,
        paymentMethod,
        orderNotes,
        subtotal: calculateSubtotal(),
        deliveryCharge,
        total: totalAmount
      };

      const response = await fetch('http://193.203.163.101:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const order = await response.json();
      
      // Clear cart after successful order
      await fetch('http://193.203.163.101:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Redirect to order confirmation page
      router.push(`/order-confirmation/${order._id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6 text-sm text-gray-600">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="hover:text-blue-600">Home</a>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <a href="/cart" className="hover:text-blue-600">Cart</a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-800 font-medium">Checkout</li>
            </ol>
          </nav>

          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 text-blue-200">
                🛒
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some items to your cart before checkout</p>
              <a
                href="/"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Delivery Information */}
              <div className="space-y-6">
                {/* Delivery Address Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <MapPinIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
                  </div>
                  
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress.fullName}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={deliveryAddress.phone}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complete Address *
                      </label>
                      <textarea
                        required
                        value={deliveryAddress.address}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, address: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="House no., Building, Street, Area"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress.pincode}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.landmark}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, landmark: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nearby landmark"
                      />
                    </div>
                  </form>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <CreditCardIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">Cash on Delivery</span>
                        <span className="block text-sm text-gray-500">Pay when you receive your order</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        disabled
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">Credit/Debit Card</span>
                        <span className="block text-sm text-gray-500">Pay securely with your card</span>
                        <span className="block text-xs text-blue-600 mt-1">Coming soon</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        disabled
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">UPI Payment</span>
                        <span className="block text-sm text-gray-500">Pay using UPI apps</span>
                        <span className="block text-xs text-blue-600 mt-1">Coming soon</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Order Instructions (Optional)</h3>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                  
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => {
                      const product = item.product || item;
                      const productName = product.name || product.title || 'Unknown Product';
                      const productPrice = product.price || 0;
                      const quantity = item.quantity || 1;

                      return (
                        <div key={item._id || item.id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              {quantity}
                            </span>
                            <span className="text-sm text-gray-700 truncate max-w-xs">
                              {productName}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{productPrice * quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Order Totals */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{calculateSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">₹{deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                      <span>Total</span>
                      <span className="text-blue-600">₹{totalAmount}</span>
                    </div>
                  </div>
                  
                  {/* Place Order Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isPlacingOrder || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode}
                    className={`w-full mt-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center ${
                      isPlacingOrder || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-5 h-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By placing your order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
                
                {/* Delivery Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <TruckIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Delivery Information</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Orders are typically delivered within 10-15 minutes</p>
                    <p>• Free delivery on orders above ₹299</p>
                    <p>• We'll call you if there are any issues with your order</p>
                  </div>
                </div>
                
                {/* Security Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Safe & Secure</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Your personal information is protected</p>
                    <p>• Secure payment processing</p>
                    <p>• Quality products guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}