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
          subtotal: (order.total || 0) - 25, // Assuming ₹25 delivery fee
          deliveryFee: 25,
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
          updatedAt: order.updatedAt || new Date()
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
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <KeyIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Secret Code</span>
                      </div>
                      <code className="text-lg font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded">
                        {order.secretCode}
                      </code>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
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
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${statusInfo.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-blue-600" />
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
                  <CreditCardIcon className="w-4 h-4 text-blue-600" />
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
                    <span className={payableAmount > 0 ? 'text-orange-600' : 'text-blue-600'}>
                      ₹{payableAmount > 0 ? payableAmount : order.finalAmount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleReorder(order)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
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
                  <button className="flex-1 border border-blue-600 text-blue-600 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center text-sm">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Orders</h2>
          <p className="text-gray-600">We're fetching your order history...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Unable to Load Orders</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-2 scrollbar-hide">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
              { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
              { id: 'picked-up', label: 'Picked Up', count: orders.filter(o => o.status === 'picked-up').length },
              { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 font-medium text-sm rounded-lg transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {sortedOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <ShoppingBagIcon className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No orders found' : activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No orders found matching "${searchTerm}". Try searching with different terms.`
                : activeTab === 'all' 
                ? "Start shopping to see your orders here." 
                : `You don't have any ${activeTab} orders at the moment.`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center shadow-sm"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const payableAmount = getPayableAmount(order);
              const paymentMethod = getPaymentMethodDisplay(order);

              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200">
                  {/* Order Header with Secret Code & Payment Info */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                          <statusInfo.icon className={`w-5 h-5 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{statusInfo.label}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {order.orderId}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatRelativeTime(order.createdAt)}
                          </p>
                          
                          {/* Secret Code Badge */}
                          {order.secretCode && (
                            <div className="flex items-center space-x-1 mt-2">
                              <KeyIcon className="w-3 h-3 text-blue-600" />
                              <span className="text-xs text-blue-600 font-medium">
                                Secret Code: <code className="bg-blue-100 px-1 rounded">{order.secretCode}</code>
                              </span>
                            </div>
                          )}
                          
                          {/* Payment Summary */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {paymentMethod}
                            </span>
                            {order.walletDeduction > 0 && (
                              <span className="text-xs text-green-600">
                                • ₹{order.walletDeduction} from wallet
                              </span>
                            )}
                            {payableAmount > 0 && (
                              <span className="text-xs text-orange-600">
                                • ₹{payableAmount} via COD
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">₹{order.total}</p>
                        <p className="text-sm text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                        {payableAmount > 0 && payableAmount !== order.total && (
                          <p className="text-sm text-orange-600 font-medium">
                            Pay: ₹{payableAmount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide space-x-3">
                      {order.items.slice(0, 4).map((item, index) => (
                        <div key={item._id} className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {item.product?.images?.[0]?.url ? (
                                <img 
                                  src={item.product.images[0].url} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {index === 3 && order.items.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-medium">+{order.items.length - 4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <ReceiptPercentIcon className="w-4 h-4 mr-2" />
                        <span>
                          {paymentMethod} • 
                          <span className={`ml-1 ${
                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {/* Invoice Download Button */}
                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium px-3 py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors flex items-center"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                          Invoice
                        </button>
                        
                        <button
                          onClick={() => handleReorder(order)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Reorder
                        </button>
                        
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors shadow-blue-200/50 hover:shadow-blue-200/70 flex items-center justify-center">
          <PhoneIcon className="w-5 h-5" />
        </button>
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