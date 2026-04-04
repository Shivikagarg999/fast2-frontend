'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TicketIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

const MyCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCoupons = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/order/my-scratch-coupons', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch coupons');
        const data = await res.json();
        setCoupons(data.scratchCoupons || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [router]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your coupons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Could not load coupons</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const available = coupons.filter(c => c.status === 'scratched');
  const unscratched = coupons.filter(c => c.status === 'unscratched');
  const redeemed = coupons.filter(c => c.status === 'redeemed');

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3d1a] to-[#2e6b2e]">
        <div className="max-w-2xl mx-auto px-4 py-7">
          <button
            onClick={() => router.back()}
            className="flex items-center text-green-300 text-sm mb-4 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </button>
          <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-1">Rewards</p>
          <h1 className="text-2xl font-bold text-white">My Scratch Coupons</h1>
          <p className="text-green-200/70 mt-0.5 text-sm">
            {coupons.length === 0
              ? 'Place an order above ₹200 to earn scratch cards'
              : `${available.length} available · ${unscratched.length} unscratched · ${redeemed.length} used`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 mx-auto bg-yellow-50 rounded-full flex items-center justify-center mb-4">
              <TicketIcon className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No scratch cards yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Place an order with a total above ₹200 and you'll receive a scratch card automatically.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center text-sm shadow-sm shadow-green-200"
            >
              <ShoppingBagIcon className="w-4 h-4 mr-2" />
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Available coupons */}
            {available.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Available</h2>
                <div className="space-y-3">
                  {available.map((coupon) => (
                    <CouponCard
                      key={coupon.orderId}
                      coupon={coupon}
                      onCopy={handleCopy}
                      copied={copiedCode === coupon.couponCode}
                      onUseNow={() => router.push('/checkout')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unscratched cards */}
            {unscratched.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Unscratched</h2>
                <div className="space-y-3">
                  {unscratched.map((coupon) => (
                    <CouponCard
                      key={coupon.orderId}
                      coupon={coupon}
                      onCopy={handleCopy}
                      copied={false}
                      onUseNow={() => router.push('/pages/orders')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Redeemed */}
            {redeemed.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Used</h2>
                <div className="space-y-3">
                  {redeemed.map((coupon) => (
                    <CouponCard
                      key={coupon.orderId}
                      coupon={coupon}
                      onCopy={handleCopy}
                      copied={false}
                      onUseNow={null}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const CouponCard = ({ coupon, onCopy, copied, onUseNow }) => {
  const statusConfig = {
    scratched: { label: 'Available', cls: 'bg-green-100 text-green-700' },
    redeemed: { label: 'Used', cls: 'bg-gray-100 text-gray-500' },
    unscratched: { label: 'Unscratched', cls: 'bg-yellow-100 text-yellow-700' },
  }[coupon.status] || { label: coupon.status, cls: 'bg-gray-100 text-gray-500' };

  const orderDate = new Date(coupon.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // Support multiple field names the API might use for expiry
  const expiryRaw = coupon.expiresAt || coupon.validUntil || coupon.expiry || coupon.couponExpiresAt || coupon.coupon?.expiresAt || coupon.coupon?.validUntil;
  const expiryDate = expiryRaw ? new Date(expiryRaw) : null;
  const now = new Date();
  const isExpired = expiryDate && expiryDate < now;
  const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;
  const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 7;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${coupon.status === 'redeemed' ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
      {/* Top gradient band */}
      <div className={`h-1.5 w-full ${
        coupon.status === 'scratched' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
        coupon.status === 'redeemed' ? 'bg-gray-200' :
        'bg-gradient-to-r from-yellow-300 to-amber-400'
      }`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-500">Order {coupon.orderId}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig.cls}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{orderDate}</span>
              <span>•</span>
              <span>₹{coupon.orderTotal}</span>
            </div>
          </div>
          <TicketIcon className={`w-6 h-6 flex-shrink-0 ${coupon.status === 'redeemed' ? 'text-gray-300' : 'text-yellow-500'}`} />
        </div>

        {coupon.status === 'unscratched' ? (
          <div className="mt-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 p-4 text-center">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
              <p className="relative text-yellow-900 font-semibold text-sm mb-2">Scratch card waiting!</p>
              <button
                onClick={onUseNow}
                className="relative bg-white text-amber-700 font-bold text-xs px-5 py-2 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
              >
                Go to Orders to Scratch
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Coupon Code</p>
            <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              coupon.status === 'redeemed'
                ? 'bg-gray-50 border border-gray-200'
                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
            }`}>
              <code className={`text-base font-bold tracking-widest ${coupon.status === 'redeemed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {coupon.couponCode}
              </code>
              <div className="flex items-center gap-2 ml-3">
                {coupon.status === 'redeemed' ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckCircleSolidIcon className="w-4 h-4 text-gray-300" />
                    Used {coupon.redeemedAt ? new Date(coupon.redeemedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => onCopy(coupon.couponCode)}
                      className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    {onUseNow && (
                      <button
                        onClick={onUseNow}
                        className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition-colors"
                      >
                        Use Now
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              {coupon.scratchedAt && (
                <p className="text-[10px] text-gray-400">
                  Scratched {new Date(coupon.scratchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              {expiryDate && coupon.status !== 'redeemed' && (
                <span className={`flex items-center gap-1 text-[10px] font-semibold ml-auto ${
                  isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  <ClockIcon className="w-3 h-3" />
                  {isExpired
                    ? 'Expired'
                    : daysLeft === 0
                    ? 'Expires today'
                    : daysLeft === 1
                    ? 'Expires tomorrow'
                    : isExpiringSoon
                    ? `Expires in ${daysLeft} days`
                    : `Valid till ${expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCouponsPage;
