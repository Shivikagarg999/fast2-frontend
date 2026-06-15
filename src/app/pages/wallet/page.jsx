'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchWallet(token);
    fetchOrders(token);
  }, []);

  const fetchWallet = async (token) => {
    try {
      const res = await fetch('/proxy/api/auth/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setUser(data.user);
      }
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (token) => {
    try {
      const res = await fetch('/proxy/api/order/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const walletOrders = (data.orders || []).filter(
          (o) => o.paymentMethod === 'wallet' || o.walletAmountUsed > 0
        );
        setOrders(walletOrders.slice(0, 10));
      }
    } catch {
      // no-op
    } finally {
      setOrdersLoading(false);
    }
  };

  const fmt = (n) => parseFloat(n || 0).toFixed(2);

  const statusColor = (s) => {
    if (s === 'delivered') return 'text-green-600 bg-green-50';
    if (s === 'cancelled') return 'text-red-500 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Wallet</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Balance card */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)' }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BanknotesIcon className="w-5 h-5 text-green-200" />
              <span className="text-green-100 text-sm font-medium">Wallet Balance</span>
            </div>

            {loading ? (
              <div className="h-10 w-36 bg-white/20 rounded-lg animate-pulse mb-2" />
            ) : (
              <p className="text-4xl font-black mb-1">₹{fmt(balance)}</p>
            )}
            <p className="text-green-200 text-sm">
              {user?.name || ''}{user?.phone ? ` · ${user.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-0.5">How wallet balance works</p>
            <p className="text-yellow-700 leading-relaxed">
              Your wallet balance is credited by Fast2 as cashback or promotional rewards. It is automatically applied during checkout to reduce your order total.
            </p>
          </div>
        </div>

        {/* Wallet orders */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Orders using wallet
          </h2>

          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <ShoppingBagIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No orders paid with wallet yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => router.push('/pages/orders')}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{order.orderId || order._id?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">₹{fmt(order.totalAmount)}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
