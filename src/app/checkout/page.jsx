'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  HomeIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  HomeIcon as HomeSolidIcon,
  BuildingOfficeIcon as BuildingOfficeSolidIcon
} from '@heroicons/react/24/solid';

const CheckoutPage = () => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Confirmation
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const router = useRouter();

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    addressLine: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    addressType: 'home'
  });

  // Fetch cart items and saved addresses
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch cart
        const cartResponse = await fetch('https://api.fast2.in/api/cart/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!cartResponse.ok) throw new Error('Failed to fetch cart items');
        const cartData = await cartResponse.json();
        
        setCart(cartData);
        if (cartData.items && cartData.items.length > 0) {
          setCartItems(cartData.items);
        } else if (cartData.cart?.items) {
          setCartItems(cartData.cart.items);
        } else {
          setCartItems([]);
        }

        // Fetch saved addresses
        const addressesResponse = await fetch('https://api.fast2.in/api/user/addresses/get', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (addressesResponse.ok) {
          const addressesData = await addressesResponse.json();
          if (addressesData.success) {
            setSavedAddresses(addressesData.addresses || []);
            // Auto-select default address
            const defaultAddress = addressesData.addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddress(defaultAddress);
              populateFormFromAddress(defaultAddress);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const populateFormFromAddress = (address) => {
    setShippingInfo({
      addressLine: address.addressLine1 + (address.addressLine2 ? `, ${address.addressLine2}` : ''),
      city: address.city,
      state: address.state,
      pinCode: address.pincode,
      country: address.country,
      phone: address.phoneNumber,
      firstName: address.fullName?.split(' ')[0] || '',
      lastName: address.fullName?.split(' ').slice(1).join(' ') || '',
      email: '',
      addressType: address.label || 'home'
    });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    populateFormFromAddress(address);
    setShowAddressForm(false);
    setError(null);
  };

  const handleUseSavedAddress = () => {
    if (savedAddresses.length > 0) {
      setShowAddressForm(false);
      if (!selectedAddress) {
        const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
        setSelectedAddress(defaultAddress);
        populateFormFromAddress(defaultAddress);
      }
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setShippingInfo({
      addressLine: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      addressType: 'home'
    });
    setShowAddressForm(true);
  };

  const calculateTotal = () => {
    if (cart && cart.total) return cart.total;
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'addressLine', 'city', 'state', 'pinCode'];
    
    for (let field of requiredFields) {
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

      const response = await fetch('https://api.fast2.in/api/order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to place order');
      }

      const orderId = responseData.orderId || responseData._id || responseData.id;
      setOrderId(orderId || 'N/A');
      setStep(2);

      // Clear cart after successful order
      try {
        await fetch('https://api.fast2.in/api/cart/clear', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home': return HomeIcon;
      case 'work': return BuildingOfficeIcon;
      default: return MapPinIcon;
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'home': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'work': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-purple-600 bg-purple-50 border-purple-200';
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Progress Bar */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex justify-center items-center p-6">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600' : 'border-gray-300'}`}>
                  {step > 1 ? <CheckCircleSolidIcon className="w-5 h-5" /> : '1'}
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
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-6 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-red-700 text-sm">{error}</p>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="p-6 lg:flex lg:space-x-8">
            {/* Left Column - Address Selection & Form */}
            <div className="lg:w-2/3">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h2>

                  {/* Saved Addresses Section */}
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
                        <button
                          onClick={handleAddNewAddress}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Add New Address
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {savedAddresses.map((address) => {
                          const IconComponent = getAddressIcon(address.label);
                          return (
                            <div
                              key={address._id}
                              onClick={() => handleAddressSelect(address)}
                              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                selectedAddress?._id === address._id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAddressTypeColor(address.label)}`}>
                                      <IconComponent className="w-3 h-3 mr-1" />
                                      <span className="capitalize">{address.label}</span>
                                    </span>
                                    {address.isDefault && (
                                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-semibold text-gray-900">{address.fullName}</p>
                                  <p className="text-gray-600">{address.phoneNumber}</p>
                                  <p className="text-gray-700 mt-1">{address.addressLine1}</p>
                                  {address.addressLine2 && (
                                    <p className="text-gray-600 text-sm">{address.addressLine2}</p>
                                  )}
                                  <p className="text-gray-700">
                                    {address.city}, {address.state} - {address.pincode}
                                  </p>
                                </div>
                                {selectedAddress?._id === address._id && (
                                  <CheckCircleSolidIcon className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add New Address Button when no addresses */}
                  {!showAddressForm && savedAddresses.length === 0 && (
                    <div className="mb-8">
                      <div
                        onClick={handleAddNewAddress}
                        className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50"
                      >
                        <PlusIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Delivery Address</h3>
                        <p className="text-gray-600">Save your address for faster checkout</p>
                      </div>
                    </div>
                  )}

                  {/* Address Form */}
                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {savedAddresses.length > 0 ? 'Add New Address' : 'Delivery Address'}
                        </h3>
                        {savedAddresses.length > 0 && (
                          <button
                            onClick={handleUseSavedAddress}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Use Saved Address
                          </button>
                        )}
                      </div>

                      <div className="space-y-6">
                        {/* Address Type */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">Address Type</label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'home', label: 'Home', icon: HomeIcon },
                              { value: 'work', label: 'Work', icon: BuildingOfficeIcon },
                              { value: 'other', label: 'Other', icon: MapPinIcon }
                            ].map(({ value, label, icon: Icon }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setShippingInfo({...shippingInfo, addressType: value})}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                  shippingInfo.addressType === value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                              >
                                <Icon className="w-5 h-5 mb-2" />
                                <span className="text-sm font-medium">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name *</label>
                            <input
                              type="text"
                              name="firstName"
                              value={shippingInfo.firstName}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name *</label>
                            <input
                              type="text"
                              name="lastName"
                              value={shippingInfo.lastName}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                            <input
                              type="email"
                              name="email"
                              value={shippingInfo.email}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                            <input
                              type="tel"
                              name="phone"
                              value={shippingInfo.phone}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                              maxLength="10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Complete Address *</label>
                          <textarea
                            name="addressLine"
                            value={shippingInfo.addressLine}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            rows="3"
                            placeholder="House no., Building, Street, Area, Landmark..."
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={shippingInfo.city}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">State *</label>
                            <input
                              type="text"
                              name="state"
                              value={shippingInfo.state}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">PIN Code *</label>
                            <input
                              type="text"
                              name="pinCode"
                              value={shippingInfo.pinCode}
                              onChange={handleShippingChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              required
                              maxLength="6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-3">Payment Method</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center mr-3">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        </div>
                        <span className="text-blue-800 font-semibold">Cash on Delivery</span>
                      </div>
                      <span className="text-blue-700 font-medium">Pay with cash</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-3">Pay with cash when your order is delivered. Exact change is appreciated.</p>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing || !shippingInfo.addressLine}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </div>
                    ) : (
                      `Place Order • ₹${calculateTotal() + 25}`
                    )}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-12">
                  <CheckCircleSolidIcon className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                    Thank you for your purchase. Your order will be delivered to your address soon.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto mb-8">
                    <h3 className="font-semibold text-blue-800 mb-2">Payment: Cash on Delivery</h3>
                    <p className="text-blue-700">Please keep cash ready for when your order arrives</p>
                    {orderId && orderId !== 'N/A' && (
                      <p className="text-sm text-blue-600 mt-3">Order ID: #{orderId}</p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => {
                    const productName = item.product?.name || item.product?.title || 'Unknown Product';
                    const productPrice = item.price || item.product?.price || 0;
                    const quantity = item.quantity || 1;

                    return (
                      <div key={item._id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{productName}</p>
                          <p className="text-xs text-gray-500 mt-1">Qty: {quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">₹{productPrice * quantity}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-900">₹25</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">₹{calculateTotal() + 25}</span>
                  </div>
                </div>

                {/* Selected Address Preview */}
                {selectedAddress && !showAddressForm && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivering to:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium">{selectedAddress.fullName}</p>
                      <p>{selectedAddress.addressLine1}</p>
                      {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                      <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p>{selectedAddress.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;