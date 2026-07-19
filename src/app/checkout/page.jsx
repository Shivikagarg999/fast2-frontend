'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MapboxGeocoderComponent from '../components/mapbox/mapboxGeocoder';
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  HomeIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  WalletIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  HomeIcon as HomeSolidIcon,
  BuildingOfficeIcon as BuildingOfficeSolidIcon,
  WalletIcon as WalletSolidIcon,
  CreditCardIcon as CreditCardSolidIcon
} from '@heroicons/react/24/solid';

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCoupon, setAppliedPromoCoupon] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [scratchCard, setScratchCard] = useState(null);
  const [scratching, setScratching] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [scratchError, setScratchError] = useState('');
  const [scratchCopied, setScratchCopied] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [cashfreeOrder, setCashfreeOrder] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState({
    activeGateway: 'razorpay',
    onlinePaymentEnabled: true,
    cashfreeMode: 'production'
  });
  const [placedOrderSummary, setPlacedOrderSummary] = useState(null);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const router = useRouter();

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
    addressType: 'home',
    lat: null,
    lng: null,
    locationSelected: false,
  });

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          console.error(`Failed to load script: ${src}`);
          resolve();
        };
        document.body.appendChild(script);
      });
    };

    const loadPaymentGateway = async () => {
      try {
        const res = await fetch('/proxy/api/order/payment-options');
        const data = await res.json();

        if (data.success) {
          setPaymentOptions({
            activeGateway: data.activeGateway,
            onlinePaymentEnabled: data.onlinePaymentEnabled,
            cashfreeMode: data.cashfreeMode || 'production'
          });

          if (data.onlinePaymentEnabled && data.activeGateway === 'razorpay') {
            await loadScript('https://checkout.razorpay.com/v1/checkout.js');
          } else if (data.onlinePaymentEnabled && data.activeGateway === 'cashfree') {
            await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
          }
        }
      } catch (err) {
        console.error('Failed to load payment options:', err);
      }
    };

    loadPaymentGateway();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnOrderId = params.get('cfReturn');
    if (!returnOrderId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const confirmReturnedPayment = async () => {
      try {
        setOrderId(returnOrderId);
        const res = await fetch('/proxy/api/order/verify-cashfree-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: returnOrderId })
        });
        const data = await res.json();

        if (res.ok && data.success && data.paymentStatus === 'paid') {
          setStep(2);
          await clearCart(token);
        } else {
          setError('We could not confirm your payment. Please check My Orders before retrying.');
        }
      } catch (err) {
        setError('We could not confirm your payment. Please check My Orders before retrying.');
      }
    };

    confirmReturnedPayment();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);

        const cartResponse = await fetch('/proxy/api/cart/', {
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

        const addressesResponse = await fetch('/proxy/api/user/addresses/get', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (addressesResponse.ok) {
          const addressesData = await addressesResponse.json();
          if (addressesData.success) {
            setSavedAddresses(addressesData.addresses || []);
            const defaultAddress = addressesData.addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddress(defaultAddress);
              populateFormFromAddress(defaultAddress);
            }
          }
        }

        const walletResponse = await fetch('/proxy/api/user/wallet', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.success) {
            setWalletBalance(walletData.balance || 0);
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
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.effectivePrice || item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateTotal();

    if (subtotal > 199) {
      return 0;
    }

    return cartItems.reduce((total, item) => {
      return total + (item.product?.delivery?.deliveryCharges || 0);
    }, 0);
  };

  const calculateGst = () => {
    if (cart && cart.totalGst > 0) return cart.totalGst;
    return cartItems.reduce((total, item) => {
      if (item.gstAmount > 0) return total + item.gstAmount;
      const gstPercent = item.gstPercent || item.product?.category?.gstPercent || 0;
      const itemSubtotal = (item.price || 0) * (item.quantity || 0);
      return total + parseFloat(((itemSubtotal * gstPercent) / 100).toFixed(2));
    }, 0);
  };

  const calculateNumberOfShops = () => {
    const shopIds = new Set();
    cartItems.forEach((item) => {
      const rawShopId =
        item.product?.shop?._id ||
        item.product?.shopId ||
        item.product?.shop ||
        item.shop?._id ||
        item.shop;

      if (rawShopId) {
        shopIds.add(String(rawShopId));
      }
    });

    if (shopIds.size > 0) {
      return shopIds.size;
    }

    return Number(cart?.numberOfShops) || 0;
  };

  const calculateHandlingCharge = () => {
    if (typeof cart?.handlingCharge === 'number') {
      return cart.handlingCharge;
    }
    return calculateNumberOfShops() * 2;
  };

  const getRegularCouponDiscount = () => {
    return Number(appliedPromoCoupon?.discountAmount) || 0;
  };

  const getAmountBreakdown = () => {
    const subtotal = calculateTotal();
    const deliveryCharges = calculateDeliveryFee();
    const handlingCharge = calculateHandlingCharge();
    const total = subtotal + deliveryCharges + handlingCharge;
    const gst = calculateGst();
    const regularCouponDiscount = getRegularCouponDiscount();
    const scratchCouponDiscount = Number(appliedCoupon?.discountAmount) || 0;
    const afterDiscounts = Math.max(0, total + gst - regularCouponDiscount - scratchCouponDiscount);
    const walletDeduction = useWallet ? Math.min(walletBalance, afterDiscounts) : 0;
    const payableAmount = Math.max(0, afterDiscounts - walletDeduction);

    return {
      subtotal,
      deliveryCharges,
      handlingCharge,
      numberOfShops: calculateNumberOfShops(),
      total,
      gst,
      regularCouponDiscount,
      scratchCouponDiscount,
      afterDiscounts,
      walletDeduction,
      payableAmount
    };
  };

  const calculateWalletDeduction = () => {
    return getAmountBreakdown().walletDeduction;
  };

  const calculateFinalAmount = () => {
    return getAmountBreakdown().payableAmount;
  };

  const calculateRazorpayAmount = () => {
    return Math.round(calculateFinalAmount() * 100);
  };

  const requiresPrescription = () => {
    return cartItems.some(item =>
      item.product?.isPrescriptionRequired ||
      item.product?.prescriptionRequired ||
      item.product?.requiresPrescription ||
      item.product?.shop?.shopType === 'medical'
    );
  };

  const handlePrescriptionChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionImage(file);
      setPrescriptionPreview(URL.createObjectURL(file));
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleMapSelect = useCallback((result) => {
    const [lng, lat] = result.center;
    const ctx = result.context || [];
    const get = (prefix) => ctx.find(c => c.id.startsWith(prefix))?.text || '';
    setShippingInfo(prev => ({
      ...prev,
      city: get('place') || get('locality') || get('neighborhood'),
      state: get('region'),
      pinCode: get('postcode'),
      lat,
      lng,
      locationSelected: true,
    }));
  }, []);

  const handleResetLocation = () => {
    setShippingInfo(prev => ({
      ...prev,
      city: '', state: '', pinCode: '',
      lat: null, lng: null, locationSelected: false,
    }));
  };

  const validateShipping = () => {
    const requiredFields = ['firstName', 'lastName', 'phone', 'addressLine', 'city', 'state', 'pinCode'];
    for (const field of requiredFields) {
      if (!shippingInfo[field]?.trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (shippingInfo.pinCode.length !== 6) {
      setError('Please enter a valid 6-digit PIN code');
      return false;
    }

    setError(null);
    return true;
  };

  const processRazorpayPayment = async (razorpayOrderData) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const options = {
        key: razorpayOrderData.key,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: 'GMKart',
        description: 'Order Payment',
        order_id: razorpayOrderData.orderId,
        handler: async function (response) {
          try {
            const token = localStorage.getItem('token');
            const verifyResponse = await fetch('/proxy/api/order/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              resolve(verifyData);
            } else {
              reject(new Error(verifyData.error || 'Payment verification failed'));
            }
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        notes: {
          order_id: orderId,
          address: shippingInfo.addressLine
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    });
  };

  const processCashfreePayment = async (cashfreeOrderData) => {
    if (!window.Cashfree) {
      throw new Error('Cashfree SDK not loaded');
    }

    const cashfree = window.Cashfree({ mode: paymentOptions.cashfreeMode });

    const result = await cashfree.checkout({
      paymentSessionId: cashfreeOrderData.paymentSessionId,
      redirectTarget: '_modal'
    });

    if (result.error) {
      throw new Error('Payment cancelled by user');
    }

    const token = localStorage.getItem('token');
    const verifyResponse = await fetch('/proxy/api/order/verify-cashfree-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    const verifyData = await verifyResponse.json();

    if (verifyResponse.ok && verifyData.success && verifyData.paymentStatus === 'paid') {
      return verifyData;
    }

    throw new Error(verifyData.error || 'Payment verification failed');
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;

    if (requiresPrescription() && !prescriptionImage) {
      setError('A doctor\'s prescription is required for this order');
      return;
    }

    const isShopOpen = (shopTimings) => {
      if (!shopTimings) return true; // Default to open if no timings set
      
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      const todayTimings = shopTimings[currentDay];
      
      if (!todayTimings || todayTimings.closed) {
        return false;
      }

      if (!todayTimings.open || !todayTimings.close) {
        return false;
      }

      return currentTime >= todayTimings.open && currentTime <= todayTimings.close;
    };

    const getNextOpenTime = (shopTimings) => {
      if (!shopTimings) return null;
      
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const dayName = days[checkDate.getDay()];
        const dayTimings = shopTimings[dayName];
        
        if (dayTimings && !dayTimings.closed && dayTimings.open && dayTimings.close) {
          if (i === 0) {
            // Today
            const currentTime = now.toTimeString().slice(0, 5);
            if (currentTime < dayTimings.open) {
              return { day: dayName, time: dayTimings.open, isToday: true };
            }
          } else {
            // Future day
            return { day: dayName, time: dayTimings.open, isToday: false };
          }
        }
      }
      
      return null;
    };

    // Check if any shops in the order are closed
    const closedShops = [];
    for (const item of cartItems) {
      const shopTimings = item.product?.shop?.timings;
      if (!isShopOpen(shopTimings)) {
        const nextOpenTime = getNextOpenTime(shopTimings);
        closedShops.push({
          shopName: item.product?.shop?.shopName || 'Unknown Shop',
          nextOpenTime: nextOpenTime
        });
      }
    }

    if (closedShops.length > 0) {
      const shopNames = closedShops.map(s => s.shopName).join(', ');
      const nextOpenInfo = closedShops[0].nextOpenTime;
      const nextOpenText = nextOpenInfo 
        ? `Opens ${nextOpenInfo.isToday ? 'today' : nextOpenInfo.day} at ${nextOpenInfo.time}`
        : 'Shop is currently closed';
      
      setError(`Cannot place order. The following shops are currently closed: ${shopNames}. ${nextOpenText}`);
      return;
    }

    setProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const items = cartItems.map(item => ({
        product: item.product?._id || item.product,
        quantity: item.quantity || 1,
        price: item.price || item.product?.effectivePrice || item.product?.price || 0
      }));

      const orderData = {
        items,
        shippingAddress: {
          addressLine: shippingInfo.addressLine,
          city: shippingInfo.city,
          state: shippingInfo.state,
          pinCode: shippingInfo.pinCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
          lat: shippingInfo.lat || 0,
          lng: shippingInfo.lng || 0,
        },
        paymentMethod: paymentMethod,
        useWallet: useWallet
      };

      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      formData.append('shippingAddress', JSON.stringify(orderData.shippingAddress));
      formData.append('paymentMethod', paymentMethod);
      formData.append('useWallet', useWallet);
      formData.append('requiresPrescription', requiresPrescription());

      if (prescriptionImage) {
        formData.append('prescriptionImage', prescriptionImage);
      }

      if (appliedCoupon) {
        formData.append('scratchCouponCode', couponCode.trim());
      }

      if (appliedPromoCoupon) {
        formData.append('coupon', JSON.stringify({ code: appliedPromoCoupon.code }));
      }

      console.log('Sending order data via FormData');

      const response = await fetch('/proxy/api/order/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to place order');
      }

      console.log('Order response:', responseData);

      const newOrderId = responseData.order?.orderId || responseData.orderId;
      const orderResponse = responseData.order || {};
      setOrderId(newOrderId || 'N/A');
      setPlacedOrderSummary({
        total: Number(orderResponse.total) || 0,
        subtotal: Number(orderResponse.subtotal) || 0,
        deliveryCharges: Number(orderResponse.deliveryCharges) || 0,
        handlingCharge: Number(orderResponse.handlingCharge) || 0,
        numberOfShops: Number(orderResponse.numberOfShops) || 0,
        totalGst: Number(orderResponse.totalGst) || 0,
        finalAmount: Number(orderResponse.finalAmount) || 0,
        walletDeduction: Number(orderResponse.walletDeduction) || 0,
        cashOnDelivery: Number(orderResponse.cashOnDelivery) || 0,
        couponDiscount:
          Number(orderResponse.couponDiscount) ||
          Number(orderResponse.couponApplied?.discountAmount) ||
          0,
        scratchCouponDiscount:
          Number(orderResponse.scratchCouponDiscount) ||
          Number(orderResponse.scratchCouponApplied?.discountAmount) ||
          0
      });
      setScratchCard(
        responseData.order?.orderScratchCard ||
        responseData.orderScratchCard ||
        responseData.order?.scratchCard ||
        responseData.scratchCard ||
        null
      );
      console.log('Scratch card data:', responseData.order?.orderScratchCard, responseData);

      if (paymentMethod === 'online' && responseData.order?.razorpay) {
        setRazorpayOrder(responseData.order.razorpay);

        try {
          await processRazorpayPayment(responseData.order.razorpay);
          setStep(2);
          await clearCart(token);
        } catch (paymentError) {
          if (paymentError.message !== 'Payment cancelled by user') {
            setError(paymentError.message);
          }
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === 'online' && responseData.order?.cashfree) {
        setCashfreeOrder(responseData.order.cashfree);

        try {
          await processCashfreePayment(responseData.order.cashfree);
          setStep(2);
          await clearCart(token);
        } catch (paymentError) {
          if (paymentError.message !== 'Payment cancelled by user') {
            setError(paymentError.message);
          }
          setProcessing(false);
          return;
        }
      } else {
        setStep(2);
        await clearCart(token);
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const token = localStorage.getItem('token');
      const breakdown = getAmountBreakdown();
      const orderAmount = breakdown.total + breakdown.gst;
      const res = await fetch('/proxy/api/order/redeem-scratch-coupon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ couponCode: couponCode.trim(), orderAmount })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({ ...data.coupon, discountAmount: data.discount });
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Could not apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyPromoCoupon = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setAppliedPromoCoupon(null);
    try {
      const token = localStorage.getItem('token');
      const breakdown = getAmountBreakdown();
      const orderAmount = breakdown.total + breakdown.gst;
      const res = await fetch('/proxy/api/admin/coupon/coupons/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: promoCode.trim(), orderAmount })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromoCoupon({ ...data.coupon, discountAmount: data.discount });
      } else {
        setPromoError(data.message || 'Invalid coupon code');
      }
    } catch {
      setPromoError('Could not apply coupon. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleScratch = async () => {
    if (!orderId || orderId === 'N/A') return;
    setScratching(true);
    setScratchError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/proxy/api/order/${orderId}/scratch-coupon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.couponCode) {
        setScratchCard(prev => ({ ...prev, isScratched: true, couponCode: data.couponCode }));
        setScratchRevealed(true);
      } else {
        setScratchError(data.message || 'Could not scratch the card. Please try again.');
      }
    } catch {
      setScratchError('Something went wrong. Please try again.');
    } finally {
      setScratching(false);
    }
  };

  const clearCart = async (token) => {
    try {
      await fetch('/proxy/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (clearError) {
      console.warn('Failed to clear cart:', clearError);
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
      case 'home': return 'text-green-600 bg-green-50 border-green-200';
      case 'work': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const amountBreakdown = getAmountBreakdown();
  const displaySummary = placedOrderSummary || {};
  const displayWalletDeduction =
    typeof displaySummary.walletDeduction === 'number'
      ? displaySummary.walletDeduction
      : amountBreakdown.walletDeduction;
  const displayPayableAmount =
    paymentMethod === 'online'
      ? amountBreakdown.payableAmount
      : (typeof displaySummary.cashOnDelivery === 'number'
        ? displaySummary.cashOnDelivery
        : amountBreakdown.payableAmount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
            <div className="flex justify-center items-center max-w-sm mx-auto">
              <div className={`flex items-center gap-2.5 ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= 1 ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 1 ? <CheckCircleSolidIcon className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">Shipping Details</span>
              </div>

              <div className="flex-1 h-0.5 bg-gray-200 mx-3 min-w-10 rounded-full overflow-hidden">
                <div className={`h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-green-600 w-full' : 'w-0'}`}></div>
              </div>

              <div className={`flex items-center gap-2.5 ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= 2 ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">Confirmation</span>
              </div>
            </div>
          </div>

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
            <div className="lg:w-2/3">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h2>

                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
                        <button
                          onClick={handleAddNewAddress}
                          className="text-green-600 hover:text-green-700 font-medium flex items-center"
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
                              className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${selectedAddress?._id === address._id
                                ? 'border-green-500 bg-green-50/60 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                                      <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
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
                                  <CheckCircleSolidIcon className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!showAddressForm && savedAddresses.length === 0 && (
                    <div className="mb-8">
                      <div
                        onClick={handleAddNewAddress}
                        className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors bg-green-50"
                      >
                        <PlusIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Delivery Address</h3>
                        <p className="text-gray-600">Save your address for faster checkout</p>
                      </div>
                    </div>
                  )}

                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {savedAddresses.length > 0 ? 'Add New Address' : 'Delivery Address'}
                        </h3>
                        {savedAddresses.length > 0 && (
                          <button
                            onClick={handleUseSavedAddress}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Use Saved Address
                          </button>
                        )}
                      </div>

                      <div className="space-y-6">
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
                                onClick={() => setShippingInfo({ ...shippingInfo, addressType: value })}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${shippingInfo.addressType === value
                                  ? 'border-green-500 bg-green-50 text-green-700'
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                              required
                              maxLength="10"
                            />
                          </div>
                        </div>

                        {/* Map location picker */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Search Location on Map *</label>
                          {!shippingInfo.locationSelected ? (
                            <MapboxGeocoderComponent
                              key="checkout-geocoder"
                              onSelectLocation={handleMapSelect}
                              placeholder="Search area, street, locality..."
                            />
                          ) : (
                            <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-300 rounded-lg">
                              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                <MapPinIcon className="w-4 h-4" />
                                {shippingInfo.city}{shippingInfo.state ? `, ${shippingInfo.state}` : ''} - {shippingInfo.pinCode}
                              </div>
                              <button type="button" onClick={handleResetLocation} className="text-xs text-red-500 hover:text-red-700 font-medium">
                                Change
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Auto-filled from map */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={shippingInfo.city}
                              onChange={handleShippingChange}
                              readOnly={shippingInfo.locationSelected}
                              className={`w-full px-4 py-3 border rounded-lg bg-white ${shippingInfo.locationSelected ? 'border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'}`}
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
                              readOnly={shippingInfo.locationSelected}
                              className={`w-full px-4 py-3 border rounded-lg bg-white ${shippingInfo.locationSelected ? 'border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'}`}
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
                              readOnly={shippingInfo.locationSelected}
                              className={`w-full px-4 py-3 border rounded-lg bg-white ${shippingInfo.locationSelected ? 'border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'}`}
                              required
                              maxLength="6"
                            />
                          </div>
                        </div>

                        {/* Manual: house no. + landmark only */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">House No. / Flat / Landmark *</label>
                          <textarea
                            name="addressLine"
                            value={shippingInfo.addressLine}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                            rows="2"
                            placeholder="e.g. Flat 12B, Green Apartments, Near City Hospital"
                            required
                          />
                          <p className="text-xs text-gray-400 mt-1">This helps the driver find your exact location.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prescription Upload Section */}
                  {requiresPrescription() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                      <div className="flex items-center mb-4">
                        <CheckBadgeIcon className="w-6 h-6 text-amber-600 mr-2" />
                        <h3 className="text-lg font-bold text-amber-900">Prescription Required</h3>
                      </div>
                      <p className="text-sm text-amber-700 mb-6">
                        One or more items in your cart require a doctor&apos;s prescription. Please upload it to proceed.
                      </p>

                      <div className="flex items-start space-x-4">
                        <div className="w-32 h-32 border-2 border-dashed border-amber-300 rounded-xl flex items-center justify-center bg-white relative overflow-hidden flex-shrink-0">
                          {prescriptionPreview ? (
                            <img src={prescriptionPreview} alt="Prescription preview" className="w-full h-full object-cover" />
                          ) : (
                            <PencilIcon className="h-8 w-8 text-amber-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePrescriptionChange}
                            className="hidden"
                            id="prescription-upload"
                          />
                          <label
                            htmlFor="prescription-upload"
                            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 cursor-pointer shadow-sm transition-all"
                          >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            {prescriptionImage ? 'Change Prescription' : 'Upload Prescription'}
                          </label>
                          <p className="text-xs text-amber-600/80 mt-2">Maximum file size: 5MB (JPG, PNG)</p>
                          {prescriptionImage && (
                            <button
                              onClick={() => { setPrescriptionImage(null); setPrescriptionPreview(null); }}
                              className="mt-2 block text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove File
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    {walletBalance > 0 && (
                      <div className={`border rounded-2xl p-6 transition-colors ${useWallet ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <button
                              onClick={() => setUseWallet(!useWallet)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${useWallet
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300 hover:border-green-400'
                                }`}
                            >
                              {useWallet && <CheckCircleSolidIcon className="w-4 h-4 text-white" />}
                            </button>
                            <div className="flex items-center">
                              {useWallet ? <WalletSolidIcon className="w-5 h-5 text-green-600 mr-2" /> : <WalletIcon className="w-5 h-5 text-gray-500 mr-2" />}
                              <span className={`font-semibold ${useWallet ? 'text-green-800' : 'text-gray-800'}`}>Use Wallet Balance</span>
                            </div>
                          </div>
                          <span className={`font-semibold ${useWallet ? 'text-green-700' : 'text-gray-700'}`}>₹{walletBalance}</span>
                        </div>

                        {useWallet && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">
                              ₹{amountBreakdown.walletDeduction} will be deducted from your wallet balance.
                              {amountBreakdown.walletDeduction < amountBreakdown.afterDiscounts && (
                                <span className="block mt-1">
                                  Remaining ₹{amountBreakdown.payableAmount} to be paid via {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}.
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${paymentMethod === 'cod'
                          ? 'border-green-500 bg-green-50/60 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'cod'
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300'
                              }`}>
                              {paymentMethod === 'cod' && <CheckCircleSolidIcon className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex items-center">
                              <BanknotesIcon className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-600'} mr-2`} />
                              <span className={`font-semibold ${paymentMethod === 'cod' ? 'text-green-800' : 'text-gray-800'}`}>
                                Cash on Delivery
                              </span>
                            </div>
                          </div>
                          <span className={`font-medium ${paymentMethod === 'cod' ? 'text-green-700' : 'text-gray-700'}`}>
                            {useWallet && walletBalance > 0 ? `₹${amountBreakdown.payableAmount} to pay` : 'Pay with cash'}
                          </span>
                        </div>
                        <p className={`text-sm mt-3 ml-9 ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-600'}`}>
                          Pay with cash when your order is delivered. Exact change is appreciated.
                        </p>
                      </div>

                      {paymentOptions.onlinePaymentEnabled && (
                        <div
                          onClick={() => setPaymentMethod('online')}
                          className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${paymentMethod === 'online'
                            ? 'border-green-500 bg-green-50/60 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'online'
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300'
                                }`}>
                                {paymentMethod === 'online' && <CheckCircleSolidIcon className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex items-center">
                                <CreditCardIcon className={`w-5 h-5 ${paymentMethod === 'online' ? 'text-green-600' : 'text-gray-600'} mr-2`} />
                                <span className={`font-semibold ${paymentMethod === 'online' ? 'text-green-800' : 'text-gray-800'}`}>
                                  Pay Online
                                </span>
                              </div>
                            </div>
                            {paymentOptions.activeGateway === 'cashfree' ? (
                              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                                Cashfree
                              </span>
                            ) : (
                              <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" />
                            )}
                          </div>
                          <p className={`text-sm mt-3 ml-9 ${paymentMethod === 'online' ? 'text-green-600' : 'text-gray-600'}`}>
                            Pay instantly with UPI, Cards, Net Banking or Wallets &middot; 100% secure
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing || !shippingInfo.addressLine}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all shadow-md"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {paymentMethod === 'online' ? 'Processing Payment...' : 'Placing Order...'}
                      </div>
                    ) : paymentMethod === 'online' ? (
                      `Pay Now • ₹${amountBreakdown.payableAmount}`
                    ) : (
                      `Place Order • ₹${amountBreakdown.payableAmount}`
                    )}
                  </button>

                  {paymentMethod === 'online' && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        {paymentOptions.activeGateway === 'cashfree'
                          ? "You will be redirected to Cashfree's secure payment page"
                          : "You will be redirected to Razorpay's secure payment page"}
                      </p>
                      <div className="flex justify-center items-center mt-2 space-x-4">
                        {paymentOptions.activeGateway === 'cashfree' ? (
                          <span className="text-xs text-gray-500">Powered by Cashfree</span>
                        ) : (
                          <>
                            <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-4 opacity-75" />
                            <span className="text-xs text-gray-500">Powered by Razorpay</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="py-16 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h3>

                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => {
                    const productName = item.product?.name || item.product?.title || 'Unknown Product';
                    const productPrice = item.price || item.product?.effectivePrice || item.product?.price || 0;
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
                    <span className="font-medium text-gray-900">₹{amountBreakdown.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <div className="text-right">
                      {amountBreakdown.subtotal > 199 ? (
                        <div>
                          <span className="font-medium text-green-600 line-through text-sm">₹{amountBreakdown.deliveryCharges}</span>
                          <span className="font-medium text-green-600 ml-2">FREE</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">₹{amountBreakdown.deliveryCharges}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Handling Charge
                      {amountBreakdown.numberOfShops > 0 ? ` (${amountBreakdown.numberOfShops} shop${amountBreakdown.numberOfShops > 1 ? 's' : ''})` : ''}
                    </span>
                    <span className="font-medium text-gray-900">₹{amountBreakdown.handlingCharge}</span>
                  </div>

                  {amountBreakdown.subtotal > 199 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-green-700 font-medium">
                        🎉 Free delivery applied! Your order exceeds ₹199
                      </p>
                    </div>
                  )}

                  {/* Promo Coupon Input */}
                  <div className="border border-dashed border-gray-300 rounded-lg p-3">
                    {appliedPromoCoupon ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-green-700">🏷️ Coupon Applied</p>
                          <p className="text-xs text-gray-500 mt-0.5">{appliedPromoCoupon.code} — Save ₹{appliedPromoCoupon.discountAmount}</p>
                          {appliedPromoCoupon.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{appliedPromoCoupon.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => { setAppliedPromoCoupon(null); setPromoCode(''); setPromoError(''); }}
                          className="text-xs text-red-500 hover:text-red-600 font-medium ml-3"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCoupon()}
                            placeholder="Coupon code"
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 uppercase"
                          />
                          <button
                            onClick={handleApplyPromoCoupon}
                            disabled={promoLoading || !promoCode.trim()}
                            className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {promoLoading ? '...' : 'Apply'}
                          </button>
                        </div>
                        {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Scratch Coupon Input */}
                  <div className="border border-dashed border-gray-300 rounded-lg p-3">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-green-700">🎟️ Scratch Coupon Applied</p>
                          <p className="text-xs text-gray-500 mt-0.5">{couponCode.toUpperCase()} — Save ₹{appliedCoupon.discountAmount}</p>
                          {appliedCoupon.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{appliedCoupon.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }}
                          className="text-xs text-red-500 hover:text-red-600 font-medium ml-3"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Coupon code"
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 uppercase"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {couponLoading ? '...' : 'Apply'}
                          </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                      </div>
                    )}
                  </div>

                  {amountBreakdown.gst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST</span>
                      <span className="font-medium text-gray-900">₹{amountBreakdown.gst.toFixed(2)}</span>
                    </div>
                  )}

                  {amountBreakdown.regularCouponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-medium">-₹{amountBreakdown.regularCouponDiscount}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Scratch Coupon ({couponCode.toUpperCase()})</span>
                      <span className="font-medium">-₹{amountBreakdown.scratchCouponDiscount}</span>
                    </div>
                  )}

                  {useWallet && walletBalance > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Wallet Deduction</span>
                      <span className="font-medium">-₹{amountBreakdown.walletDeduction}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 pt-4 pb-1 px-1 -mx-1 border-t-2 border-dashed border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-green-600">₹{amountBreakdown.payableAmount}</span>
                  </div>

                  {useWallet && walletBalance > 0 && (
                    <div className="text-xs text-gray-500 text-center mt-2">
                      {paymentMethod === 'online'
                        ? `₹${amountBreakdown.walletDeduction} from wallet + ₹${amountBreakdown.payableAmount} online`
                        : `₹${amountBreakdown.walletDeduction} from wallet + ₹${amountBreakdown.payableAmount} via COD`
                      }
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-center mt-2">
                    Payment method: <span className="font-medium">{paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                  </div>
                </div>

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

    {/* Order Confirmed Popup */}
    {step === 2 && (
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[80px] lg:pt-[80px] px-4 pb-4 overflow-y-auto">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        {/* Modal Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-xs w-full p-5 text-center">

          {/* Success Icon */}
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">
            {paymentMethod === 'online' ? 'Payment Successful!' : 'Order Confirmed!'}
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            {paymentMethod === 'online' ? 'Payment processed successfully.' : 'Your order has been placed.'}
          </p>

          {/* Order ID + Payment Info row */}
          <div className="flex gap-2 mb-4">
            {orderId && orderId !== 'N/A' && (
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 text-left">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Order ID</p>
                <p className="text-sm font-bold text-gray-800">#{orderId}</p>
              </div>
            )}
            <div className="flex-1 bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-left">
              <p className="text-[9px] text-green-600 uppercase tracking-widest font-semibold">
                {paymentMethod === 'online' ? 'Payment' : 'Method'}
              </p>
              <p className="text-xs text-green-700 font-medium leading-tight">
                {paymentMethod === 'online'
                  ? useWallet
                    ? `₹${displayWalletDeduction} wallet + ₹${displayPayableAmount} online`
                    : `₹${displayPayableAmount} online`
                  : useWallet
                    ? `₹${displayWalletDeduction} wallet + ₹${displayPayableAmount} COD`
                    : 'Cash on Delivery'}
              </p>
            </div>
          </div>

          {/* Scratch Card */}
          {scratchCard?.isEligible && (
            <div className="mb-4">
              {(scratchCard.isScratched || scratchRevealed) ? (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-yellow-900 mb-1.5">🎉 Scratch Card Reward</p>
                  <div className="bg-white rounded-lg px-3 py-2 inline-flex items-center gap-2 shadow-sm">
                    <code className="text-sm font-bold text-gray-900 tracking-widest">{scratchCard.couponCode}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scratchCard.couponCode);
                        setScratchCopied(true);
                        setTimeout(() => setScratchCopied(false), 2000);
                      }}
                      className="text-xs text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                      {scratchCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 p-4 text-center">
                  <p className="text-yellow-900 font-bold text-xs mb-1">🎟️ You earned a Scratch Card!</p>
                  <button
                    onClick={handleScratch}
                    disabled={scratching}
                    className="bg-white text-amber-700 font-bold text-xs px-5 py-2 rounded-lg hover:bg-amber-50 active:scale-95 transition-all shadow-md disabled:opacity-70"
                  >
                    {scratching ? (
                      <span className="flex items-center gap-1.5">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full" />
                        Scratching...
                      </span>
                    ) : '✨ Scratch to Reveal'}
                  </button>
                  {scratchError && (
                    <p className="text-red-700 text-xs mt-1.5 bg-white/60 rounded px-2 py-0.5">{scratchError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/pages/orders')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Shop More
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CheckoutPage;
