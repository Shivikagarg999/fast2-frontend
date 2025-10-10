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
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const router = useRouter();

  // Mock data for demonstration
  const mockOrders = [
    {
      _id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      total: 1247,
      items: [
        {
          _id: '1a',
          product: {
            name: 'Fresh Apples',
            price: 199,
            images: [{ url: '/api/placeholder/80/80' }]
          },
          quantity: 2
        },
        {
          _id: '1b',
          product: {
            name: 'Organic Milk',
            price: 65,
            images: [{ url: '/api/placeholder/80/80' }]
          },
          quantity: 3
        }
      ],
      shippingAddress: {
        addressLine: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        phone: '9876543210'
      },
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'processing',
      total: 847,
      items: [
        {
          _id: '2a',
          product: {
            name: 'Whole Wheat Bread',
            price: 45,
            images: [{ url: '/api/placeholder/80/80' }]
          },
          quantity: 2
        }
      ],
      shippingAddress: {
        addressLine: '456 Oak Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pinCode: '110001',
        phone: '9876543211'
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    }
  ];

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        // Uncomment the following code to use real API
        /*
        const response = await fetch('https://api.fast2.in/api/order/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        // Reverse the orders to show newest first
        setOrders(data.reverse());
        */
        
        // Using mock data for demonstration
        setTimeout(() => {
          setOrders(mockOrders.reverse());
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  // Function to format date in a relative way
  const formatRelativeTime = (dateString) => {
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
  };

  // Function to format full date
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get status icon and color
  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Order Placed',
          description: 'We have received your order'
        };
      case 'confirmed':
        return {
          icon: CheckCircleIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Confirmed',
          description: 'Order is being processed'
        };
      case 'processing':
        return {
          icon: ClockIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Processing',
          description: 'Getting your items ready'
        };
      case 'shipped':
        return {
          icon: TruckIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Shipped',
          description: 'On the way to you'
        };
      case 'delivered':
        return {
          icon: CheckCircleSolidIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Delivered',
          description: 'Order delivered successfully'
        };
      case 'cancelled':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Cancelled',
          description: 'Order has been cancelled'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status,
          description: 'Order status unknown'
        };
    }
  };

  const handleReorder = (order) => {
    // Implement reorder logic
    console.log('Reorder:', order._id);
    // Add items to cart and redirect to cart
    router.push('/cart');
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    const statusInfo = getStatusInfo(order.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">{order.orderNumber}</p>
          </div>

          {/* Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-full ${statusInfo.bgColor} mr-3`}>
                <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{statusInfo.label}</h3>
                <p className="text-sm text-gray-600">{statusInfo.description}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Ordered on {formatFullDate(order.createdAt)}
            </div>
            {order.deliveredAt && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <CheckCircleSolidIcon className="w-4 h-4 mr-2 text-green-600" />
                Delivered on {formatFullDate(order.deliveredAt)}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Items ({order.items.length})</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product?.images?.[0]?.url ? (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">₹{item.product.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.total - 40}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="text-gray-900">₹40</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-green-600">₹{order.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleReorder(order)}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                Reorder
              </button>
              {order.status === 'delivered' && (
                <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <StarIcon className="w-5 h-5 mr-2" />
                  Rate Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
            <XCircleIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full mr-2"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600">Track and manage your orders</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{orders.length} orders</p>
              <p className="text-xs text-gray-500">Total spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-8 overflow-x-auto px-4 py-3 -mb-px scrollbar-hide">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
              { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
              { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-1 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <ShoppingBagIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {activeTab === 'all' 
                ? "Start shopping to see your orders here. Your order history will appear once you make your first purchase." 
                : `You don't have any ${activeTab} orders at the moment.`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center shadow-sm"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${statusInfo.bgColor} mr-3`}>
                          <statusInfo.icon className={`w-5 h-5 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{statusInfo.label}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatRelativeTime(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                        <p className="text-sm text-gray-500">{order.orderNumber}</p>
                      </div>
                    </div>
                    
                    {order.shippingAddress && (
                      <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <MapPinIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
                        <div>
                          <span className="font-medium">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                          <p className="text-xs text-gray-500 mt-1">{order.shippingAddress.addressLine}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="flex overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                      {order.items.map((item, index) => (
                        <div key={item._id} className="flex-shrink-0 mr-4 last:mr-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                            {item.product?.images?.[0]?.url ? (
                              <img 
                                src={item.product.images[0].url} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center max-w-20 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-400 text-center">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <ReceiptPercentIcon className="w-4 h-4 mr-2" />
                        <span className="capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} • 
                          <span className={`ml-1 ${
                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReorder(order)}
                          className="text-green-600 hover:text-green-700 text-sm font-semibold px-4 py-2 border border-green-200 rounded-xl hover:bg-green-50 transition-colors flex items-center"
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Reorder
                        </button>
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-gray-700 hover:text-gray-900 text-sm font-semibold px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors flex items-center"
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

      {/* Support Floating Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors shadow-green-200">
          <PhoneIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Order Details Modal */}
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