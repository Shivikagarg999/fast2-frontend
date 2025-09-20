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
  MapPinIcon
} from '@heroicons/react/24/outline';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

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
        const response = await fetch('https://api.fast2.in/api/order/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
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

  // Function to format date in a relative way (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffInDays} days ago`;
    }
  };

  // Function to format full date
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get status icon and color (Blinkit style)
  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          label: 'Order Placed'
        };
      case 'confirmed':
        return {
          icon: CheckCircleIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Confirmed'
        };
      case 'processing':
        return {
          icon: ClockIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          label: 'Processing'
        };
      case 'shipped':
        return {
          icon: TruckIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          label: 'Shipped'
        };
      case 'delivered':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Delivered'
        };
      case 'cancelled':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Cancelled'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: status
        };
    }
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
     
      {/* Tab Navigation */}
      <div className="bg-white">
        <div className=" px-4">
          <div className="flex space-x-4 overflow-x-auto py-3 -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap px-3 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'all'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`whitespace-nowrap px-3 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'pending'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`whitespace-nowrap px-3 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'delivered'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <ShoppingBagIcon className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet." 
                : `You don't have any ${activeTab} orders.`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors w-full max-w-xs"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusInfo(order.status).icon;
              const statusColor = getStatusInfo(order.status).color;
              const statusBgColor = getStatusInfo(order.status).bgColor;
              const statusLabel = getStatusInfo(order.status).label;

              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <div className={`p-2 rounded-full ${statusBgColor} mr-3`}>
                            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{statusLabel}</h3>
                            <p className="text-sm text-gray-500">
                              {formatRelativeTime(order.createdAt)} • {formatFullDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{order.total}</p>
                        <p className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    {order.shippingAddress && (
                      <div className="mt-3 flex items-start text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      {order.items.map((item, index) => (
                        <div key={item._id} className="flex-shrink-0 mr-4 last:mr-0">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {item.product?.images?.[0]?.url ? (
                              <img 
                                src={item.product.images[0].url} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs" style={{display: item.product?.images?.[0]?.url ? 'none' : 'flex'}}>
                              No Image
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Implement reorder functionality
                            console.log('Reorder:', order._id);
                          }}
                          className="text-green-600 hover:text-green-700 text-sm font-medium px-3 py-1 border border-green-200 rounded-full hover:bg-green-50 transition-colors"
                        >
                          Reorder
                        </button>
                        <button
                          onClick={() => {
                            // Implement view details functionality
                            console.log('View details:', order._id);
                          }}
                          className="text-gray-700 hover:text-gray-900 text-sm font-medium px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                        >
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
      <div className="fixed bottom-6 right-4 z-20">
        <button className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors">
          <PhoneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MyOrdersPage;