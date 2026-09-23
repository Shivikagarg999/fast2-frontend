"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import orderConfirmedImg from '@/assets/images/order-confirmed.png';

const readConfirmation = () => {
  try {
    return JSON.parse(sessionStorage.getItem('orderConfirmation') || 'null');
  } catch {
    return null;
  }
};

export default function OrderConfirmedPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [scratchCard, setScratchCard] = useState(null);
  const [scratching, setScratching] = useState(false);
  const [scratchError, setScratchError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = readConfirmation();
    if (!saved) {
      // Nothing to confirm (direct visit, or the session data is gone)
      router.replace('/pages/orders');
      return;
    }
    setData(saved);
    setScratchCard(saved.scratchCard || null);
    setReady(true);
  }, [router]);

  const handleScratch = async () => {
    if (!data?.orderId || data.orderId === 'N/A') return;
    setScratching(true);
    setScratchError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/proxy/api/order/${data.orderId}/scratch-coupon`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.couponCode) {
        setScratchCard((prev) => ({ ...prev, isScratched: true, couponCode: result.couponCode }));
      } else {
        setScratchError(result.message || 'Could not scratch the card. Please try again.');
      }
    } catch {
      setScratchError('Something went wrong. Please try again.');
    } finally {
      setScratching(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(scratchCard.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ready) {
    return <div className="min-h-screen bg-white" />;
  }

  const isOnline = data.paymentMethod === 'online';
  const hasOrderId = data.orderId && data.orderId !== 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-md mx-auto px-4 pt-10 pb-12 text-center">

        {/* Animated tick */}
        <div className="relative w-28 h-28 mx-auto">
          <span className="oc-ring absolute inset-0 rounded-full bg-brand-300/50" />
          <div className="oc-pop relative w-28 h-28">
            <svg viewBox="0 0 56 56" className="w-28 h-28">
              <circle cx="28" cy="28" r="26.5" fill="#0c831f" />
              <circle className="oc-circle" cx="28" cy="28" r="26.5" fill="none" stroke="#9de8b6" strokeWidth="2" />
              <path className="oc-check" d="M16 29 l8 8 l16 -17" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h1 className="oc-rise text-2xl sm:text-3xl font-extrabold text-gray-900 mt-6" style={{ animationDelay: '0.9s' }}>
          {isOnline ? 'Payment successful!' : 'Order confirmed!'}
        </h1>
        <p className="oc-rise text-gray-500 mt-1" style={{ animationDelay: '1s' }}>
          Thank you for shopping with GMKart. We are getting your order ready.
        </p>

        {/* Graphic */}
        <div className="oc-rise mt-6 rounded-3xl bg-brand-50 border border-brand-100 overflow-hidden" style={{ animationDelay: '1.1s' }}>
          <Image
            src={orderConfirmedImg}
            alt="Delivery partner bringing your order"
            priority
            className="w-full h-auto max-h-64 object-contain mix-blend-multiply"
          />
        </div>

        {/* Details */}
        <div className="oc-rise mt-5 grid grid-cols-2 gap-3 text-left" style={{ animationDelay: '1.2s' }}>
          {hasOrderId && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Order ID</p>
              <p className="text-sm font-bold text-gray-900 break-all">#{data.orderId}</p>
            </div>
          )}
          {data.paymentLabel && (
            <div className={`bg-white rounded-2xl border border-gray-100 p-3 shadow-sm ${hasOrderId ? '' : 'col-span-2'}`}>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">{isOnline ? 'Payment' : 'Method'}</p>
              <p className="text-sm font-bold text-gray-900 leading-snug">{data.paymentLabel}</p>
            </div>
          )}
        </div>

        {/* Scratch card */}
        {scratchCard?.isEligible && (
          <div className="oc-rise mt-5" style={{ animationDelay: '1.3s' }}>
            {scratchCard.isScratched ? (
              <div className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">Your scratch card reward</p>
                <div className="bg-white rounded-xl px-4 py-2 inline-flex items-center gap-3 shadow-sm">
                  <code className="text-base font-bold text-gray-900 tracking-widest">{scratchCard.couponCode}</code>
                  <button onClick={copyCode} className="text-brand-600 hover:text-brand-700" aria-label="Copy code">
                    {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 p-4">
                <p className="text-yellow-900 font-bold text-sm mb-2">You earned a scratch card!</p>
                <button
                  onClick={handleScratch}
                  disabled={scratching}
                  className="bg-white text-amber-700 font-bold text-sm px-6 py-2 rounded-xl hover:bg-amber-50 active:scale-95 transition-all shadow-md disabled:opacity-70"
                >
                  {scratching ? 'Scratching...' : 'Scratch to reveal'}
                </button>
                {scratchError && <p className="text-red-700 text-xs mt-2 bg-white/60 rounded px-2 py-1">{scratchError}</p>}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="oc-rise mt-6 flex gap-3" style={{ animationDelay: '1.4s' }}>
          <Link
            href="/pages/orders"
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            View orders
          </Link>
          <Link
            href="/"
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
