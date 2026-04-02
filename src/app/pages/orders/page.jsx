'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  XCircleIcon, 
  ShoppingBagIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon,
  StarIcon,
  CalendarIcon,
  ReceiptPercentIcon,
  ArrowPathIcon,
  EyeIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  KeyIcon,
  CurrencyRupeeIcon,
  WalletIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  StarIcon as StarSolidIcon,
  ShieldCheckIcon,
  WalletIcon as WalletSolidIcon
} from '@heroicons/react/24/solid';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('https://api.fast2.in/api/order/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug: Log the API response to see the actual structure
        console.log('API Response:', data);

        // Handle different response structures
        let ordersData = [];
        
        if (data.orders && Array.isArray(data.orders)) {
          // Structure: { success: true, orders: [...] }
          ordersData = data.orders;
        } else if (Array.isArray(data)) {
          // Structure: [...orders] (direct array)
          ordersData = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Structure: { data: [...] }
          ordersData = data.data;
        } else {
          console.warn('Unexpected API response structure:', data);
          ordersData = [];
        }

        const transformedOrders = ordersData.map(order => ({
          _id: order._id,
          orderId: order.orderId,
          orderNumber: order.orderId || `ORD${order._id?.slice(-6)?.toUpperCase() || '000000'}`,
          status: order.status || 'pending',
          total: order.total || 0,
          finalAmount: order.finalAmount || order.total || 0,
          walletDeduction: order.walletDeduction || 0,
          cashOnDelivery: order.cashOnDelivery || order.finalAmount || order.total || 0,
          secretCode: order.secretCode,
          totalGst: order.totalGst || 0,
          subtotal: order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0,
          deliveryFee: Math.max(0, (order.total || 0) - (order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0)),
          items: order.items?.map(item => ({
            _id: item._id,
            product: {
              name: item.product?.name || 'Product',
              price: item.price || 0,
              originalPrice: item.product?.oldPrice || 0,
              images: item.product?.images || [],
              brand: item.product?.brand || '',
              weight: item.product?.weight ? `${item.product.weight}${item.product.weightUnit}` : '',
              category: item.product?.category,
              weightUnit: item.product?.weightUnit,
              unit: item.product?.unit,
              unitValue: item.product?.unitValue
            },
            quantity: item.quantity || 1,
            gstPercent: item.gstPercent || 0,
            gstAmount: item.gstAmount || 0,
            total: (item.price || 0) * (item.quantity || 1)
          })) || [],
          shippingAddress: order.shippingAddress || {
            addressLine: '',
            city: '',
            state: '',
            pinCode: '',
            phone: ''
          },
          paymentMethod: order.paymentMethod || 'cod',
          paymentStatus: order.paymentStatus || 'pending',
          createdAt: order.createdAt || new Date(),
          updatedAt: order.updatedAt || new Date(),
          orderScratchCard: order.orderScratchCard || null
        }));

        console.log('Transformed orders:', transformedOrders);
        setOrders(transformedOrders.reverse());

      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.fast2.in/api/order/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Invoice download error:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-high':
        return b.total - a.total;
      case 'price-low':
        return a.total - b.total;
      default:
        return 0;
    }
  });

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMins < 1) return 'Just now';
      if (diffInMins < 60) return `${diffInMins} min ago`;
      if (diffInHours < 24) return `${diffInHours} hr ago`;
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Order Placed',
          description: 'We have received your order',
          progress: 25
        };
      case 'confirmed':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Confirmed',
          description: 'Order is being processed',
          progress: 50
        };
      case 'picked-up':
        return {
          icon: TruckIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Picked Up',
          description: 'Driver has picked up your order',
          progress: 75
        };
      case 'delivered':
        return {
          icon: CheckCircleSolidIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Delivered',
          description: 'Order delivered successfully',
          progress: 100
        };
      case 'cancelled':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Cancelled',
          description: 'Order has been cancelled',
          progress: 0
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status,
          description: 'Order status unknown',
          progress: 0
        };
    }
  };

  const getPaymentMethodDisplay = (order) => {
    if (order.walletDeduction > 0 && order.cashOnDelivery > 0) {
      return 'Wallet + COD';
    } else if (order.walletDeduction > 0) {
      return 'Wallet';
    } else {
      return order.paymentMethod === 'cod' ? 'COD' : 'Online';
    }
  };

  const getPayableAmount = (order) => {
    return order.cashOnDelivery > 0 ? order.cashOnDelivery : 0;
  };

  const handleReorder = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.fast2.in/api/cart/reorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: order._id })
      });

      if (response.ok) {
        router.push('/cart');
      } else {
        throw new Error('Failed to reorder');
      }
    } catch (error) {
      console.error('Reorder error:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    const statusInfo = getStatusInfo(order.status);
    const payableAmount = getPayableAmount(order);
    const [scratchCard, setScratchCard] = useState(order.orderScratchCard || null);
    const [scratching, setScratching] = useState(false);
    const [scratchError, setScratchError] = useState('');
    const [scratchRevealed, setScratchRevealed] = useState(order.orderScratchCard?.isScratched || false);
    const [copied, setCopied] = useState(false);

    const handleScratch = async () => {
      setScratching(true);
      setScratchError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://api.fast2.in/api/order/${order.orderId}/scratch-coupon`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.couponCode) {
          const updated = { ...scratchCard, isScratched: true, couponCode: data.couponCode };
          setScratchCard(updated);
          setScratchRevealed(true);
          setOrders(prev => prev.map(o =>
            o._id === order._id ? { ...o, orderScratchCard: updated } : o
          ));
        } else {
          setScratchError(data.message || 'Could not scratch the card. Please try again.');
        }
      } catch {
        setScratchError('Something went wrong. Please try again.');
      } finally {
        setScratching(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="absolute mt-10 inset-0 bg-black bg-opacity-10 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col mx-auto z-10">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
              <p className="text-xs text-gray-500 mt-1">{order.orderId}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <XCircleIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Secret Code & Payment Info */}
            {(order.secretCode || order.walletDeduction > 0) && (
              <div className="p-4 border-b border-gray-100 space-y-3">
                {/* Secret Code */}
                {order.secretCode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <KeyIcon className="w-4 h-4 text-green-700" />
                        <span className="text-sm font-medium text-green-800">Secret Code</span>
                      </div>
                      <code className="text-lg font-bold text-green-800 bg-green-100 px-2 py-1 rounded">
                        {order.secretCode}
                      </code>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Share this code with the delivery executive to verify your order
                    </p>
                  </div>
                )}

                {/* Wallet Deduction */}
                {order.walletDeduction > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <WalletIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Wallet Used</span>
                      </div>
                      <span className="text-lg font-bold text-green-800">
                        -₹{order.walletDeduction}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payable Amount */}
                {payableAmount > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CurrencyRupeeIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Payable Amount</span>
                      </div>
                      <span className="text-lg font-bold text-orange-800">
                        ₹{payableAmount}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Pay this amount to the delivery executive
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                    <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{statusInfo.label}</h3>
                    <p className="text-xs text-gray-500">{statusInfo.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                  <p className="text-xs text-gray-500">Order Total</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${statusInfo.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-green-700" />
                  <h4 className="font-medium text-gray-900 text-sm">Delivery Address</h4>
                </div>
                {order.shippingAddress ? (
                  <div className="bg-gray-50 rounded p-3 text-xs border border-gray-200">
                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName || 'Customer'}</p>
                    <p className="text-gray-600 mt-1">{order.shippingAddress.addressLine}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                    </p>
                    <p className="text-gray-600 mt-2 flex items-center">
                      <PhoneIcon className="w-3 h-3 mr-1" />
                      {order.shippingAddress.phone || 'No phone provided'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-500 border border-gray-200">
                    No shipping address available
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCardIcon className="w-4 h-4 text-green-700" />
                  <h4 className="font-medium text-gray-900 text-sm">Payment</h4>
                </div>
                <div className="bg-gray-50 rounded p-3 text-xs border border-gray-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium text-gray-900">
                      {getPaymentMethodDisplay(order)}
                    </span>
                  </div>
                  {order.walletDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Used</span>
                      <span className="font-medium text-green-600">₹{order.walletDeduction}</span>
                    </div>
                  )}
                  {payableAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payable via COD</span>
                      <span className="font-medium text-orange-600">₹{payableAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                Items ({order.items.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-white rounded border border-gray-200 flex-shrink-0">
                        {item.product?.images?.[0]?.url ? (
                          <img 
                            src={item.product.images[0].url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ShoppingBagIcon className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          {item.product.weight && (
                            <span className="text-xs text-gray-500">• {item.product.weight}{item.product.weightUnit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-gray-900 text-sm">₹{item.total}</p>
                      <p className="text-xs text-gray-500">₹{item.product.price} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-gray-900">₹{order.deliveryFee}</span>
                  </div>
                  {order.totalGst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST</span>
                      <span className="text-gray-900">₹{order.totalGst.toFixed(2)}</span>
                    </div>
                  )}
                  {order.walletDeduction > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Wallet Deduction</span>
                      <span>-₹{order.walletDeduction}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                    <span className="text-gray-900">
                      {payableAmount > 0 ? 'Payable Amount' : 'Total'}
                    </span>
                    <span className={payableAmount > 0 ? 'text-orange-600' : 'text-green-700'}>
                      ₹{payableAmount > 0 ? payableAmount : order.finalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scratch Card */}
              {scratchCard?.isEligible && (
                <div className="mt-4 pt-4 border-t border-dashed border-yellow-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <ReceiptPercentIcon className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Scratch Card</h4>
                    {!scratchCard.isScratched && !scratchRevealed && (
                      <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                    )}
                  </div>

                  {(scratchCard.isScratched || scratchRevealed) ? (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-center">
                      <p className="text-xs font-medium text-yellow-900 mb-2">🎉 Your Coupon Code</p>
                      <div className="bg-white rounded-lg px-4 py-2.5 inline-flex items-center space-x-3 shadow-sm">
                        <code className="text-base font-bold text-gray-900 tracking-widest">{scratchCard.couponCode}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(scratchCard.couponCode);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-xs text-green-600 font-semibold hover:text-green-700 transition-colors"
                        >
                          {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-yellow-900/80 mt-2">Apply at checkout on your next order</p>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 p-5 text-center">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
                      <p className="relative text-yellow-900 font-bold text-sm mb-1">You earned a Scratch Card!</p>
                      <p className="relative text-yellow-800/80 text-xs mb-4">Order total exceeded ₹200 — scratch to reveal your reward</p>
                      <button
                        onClick={handleScratch}
                        disabled={scratching}
                        className="relative bg-white text-amber-700 font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-amber-50 active:scale-95 transition-all shadow-md disabled:opacity-70"
                      >
                        {scratching ? (
                          <span className="flex items-center space-x-2">
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full" />
                            <span>Scratching...</span>
                          </span>
                        ) : '✨ Scratch to Reveal'}
                      </button>
                      {scratchError && (
                        <p className="text-red-700 text-xs mt-3 relative bg-white/60 rounded px-2 py-1">{scratchError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleReorder(order)}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-1.5" />
                  Reorder
                </button>
                
                {/* Invoice Download Button */}
                <button
                  onClick={() => handleDownloadInvoice(order._id)}
                  className="flex-1 border border-green-600 text-green-600 py-2.5 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center text-sm"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1.5" />
                  Invoice
                </button>
                
                {order.status === 'delivered' && (
                  <button className="flex-1 border border-green-600 text-green-600 py-2.5 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center text-sm">
                    <StarIcon className="w-4 h-4 mr-1.5" />
                    Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-600"></div>
            <ShoppingBagIcon className="w-7 h-7 text-green-600 absolute inset-0 m-auto" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Loading Your Orders</h2>
          <p className="text-gray-500 text-sm">Fetching your order history...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Unable to Load Orders</h1>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeOrder = orders.find(o => ['pending', 'confirmed', 'picked-up'].includes(o.status));

  const getStatusPill = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':    return { label: 'Order Placed', cls: 'bg-yellow-100 text-yellow-700' };
      case 'confirmed':  return { label: 'Confirmed', cls: 'bg-green-100 text-green-700' };
      case 'picked-up':  return { label: 'In Transit', cls: 'bg-green-100 text-green-700' };
      case 'delivered':  return { label: 'Delivered', cls: 'bg-gray-100 text-gray-600' };
      case 'cancelled':  return { label: 'Cancelled', cls: 'bg-red-100 text-red-600' };
      default:           return { label: status, cls: 'bg-gray-100 text-gray-600' };
    }
  };

  const getTrackProgress = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':   return 15;
      case 'confirmed': return 40;
      case 'picked-up': return 70;
      case 'delivered': return 100;
      default:          return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3d1a] to-[#2e6b2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-1">Dashboard</p>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="text-green-200/70 mt-0.5 text-sm">Track and manage your orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-green-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-200/60 focus:outline-none focus:ring-2 focus:ring-white/30 w-full text-sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              >
                <option value="newest" className="text-gray-900">Newest First</option>
                <option value="oldest" className="text-gray-900">Oldest First</option>
                <option value="price-high" className="text-gray-900">Price: High to Low</option>
                <option value="price-low" className="text-gray-900">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-2 scrollbar-hide">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
              { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
              { id: 'picked-up', label: 'In Transit', count: orders.filter(o => o.status === 'picked-up').length },
              { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2.5 font-medium text-sm rounded-xl transition-all flex items-center ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">

          {/* Orders List */}
          <div className="flex-1 min-w-0">
            {sortedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
                <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBagIcon className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {searchTerm ? 'No orders found' : activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
                </h2>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                  {searchTerm
                    ? `No orders matching "${searchTerm}".`
                    : activeTab === 'all'
                    ? 'Start shopping to see your orders here.'
                    : `You don't have any ${activeTab} orders at the moment.`}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center shadow-sm shadow-green-200"
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => {
                  const pill = getStatusPill(order.status);
                  const payableAmount = getPayableAmount(order);
                  const paymentMethod = getPaymentMethodDisplay(order);
                  const firstItem = order.items[0];
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  const isActive = ['pending', 'confirmed', 'picked-up'].includes(order.status);

                  return (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="p-4 sm:p-5">
                        <div className="flex gap-4">
                          {/* Product image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            {firstItem?.product?.images?.[0]?.url ? (
                              <img
                                src={firstItem.product.images[0].url}
                                alt={firstItem.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                                  {firstItem?.product?.name || 'Order'}
                                  {order.items.length > 1 && (
                                    <span className="text-sm font-normal text-gray-400 ml-1">+{order.items.length - 1} more</span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">ID: {order.orderId}</p>
                              </div>
                              {/* Status pill */}
                              <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${pill.cls}`}>
                                {pill.label}
                              </span>
                            </div>

                            {/* Metadata grid */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Order Date</p>
                                <p className="text-xs font-semibold text-gray-900 mt-0.5">{orderDate}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                                <p className="text-xs font-semibold text-gray-900 mt-0.5">₹{order.total}</p>
                              </div>
                              {order.secretCode && (
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Secret Code</p>
                                  <p className="text-xs font-bold text-[#1a3d1a] mt-0.5 tracking-widest">{order.secretCode}</p>
                                </div>
                              )}
                              {payableAmount > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Pay on Delivery</p>
                                  <p className="text-xs font-semibold text-orange-600 mt-0.5">₹{payableAmount}</p>
                                </div>
                              )}
                              {order.orderScratchCard?.isEligible && !order.orderScratchCard?.isScratched && (
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Scratch Card</p>
                                  <p className="text-xs font-bold text-amber-600 mt-0.5 animate-pulse">Tap to Scratch!</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
                          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {order.shippingAddress?.city || 'N/A'}
                            {firstItem?.product?.weight ? ` • ${firstItem.product.weight}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                          >
                            Download Invoice
                          </button>
                          {order.status === 'delivered' ? (
                            <button
                              onClick={() => handleReorder(order)}
                              className="bg-[#1a3d1a] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#0f2510] transition-colors"
                            >
                              Reorder Item
                            </button>
                          ) : order.status === 'cancelled' ? (
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              View Details
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="bg-[#1a3d1a] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#0f2510] transition-colors"
                            >
                              Track Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Track Panel — desktop only */}
          {activeOrder && (
            <div className="hidden lg:block w-72 flex-shrink-0 sticky top-20">
              <div className="bg-[#1a3d1a] rounded-2xl p-5 text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-base">Active Track</h3>
                    <p className="text-green-400 text-xs mt-0.5 truncate">Shipment {activeOrder.orderId}</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <TruckIcon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Status display */}
                <div className="mb-5">
                  <div className="text-3xl font-bold leading-none">
                    {getStatusInfo(activeOrder.status).label}
                  </div>
                  <p className="text-green-400 text-[11px] uppercase tracking-widest mt-1.5">
                    {activeOrder.shippingAddress?.city
                      ? `DELIVERING TO ${activeOrder.shippingAddress.city.toUpperCase()}`
                      : 'EN ROUTE TO YOU'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="relative h-1.5 bg-white/20 rounded-full mb-2">
                    <div
                      className="absolute left-0 top-0 h-1.5 bg-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${getTrackProgress(activeOrder.status)}%` }}
                    />
                    {/* Dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-500"
                      style={{ left: `calc(${getTrackProgress(activeOrder.status)}% - 6px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-green-400/70 uppercase tracking-wider">
                    <span>Placed</span>
                    <span>In Transit</span>
                    <span>Delivered</span>
                  </div>
                </div>

                {/* Order summary */}
                <div className="bg-white/10 rounded-xl p-3 mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-green-300/70">Items</span>
                    <span>{activeOrder.items.length} item{activeOrder.items.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300/70">Total</span>
                    <span>₹{activeOrder.total}</span>
                  </div>
                  {activeOrder.secretCode && (
                    <div className="flex justify-between">
                      <span className="text-green-300/70">Secret Code</span>
                      <span className="font-bold tracking-widest">{activeOrder.secretCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderDetails(false)}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;