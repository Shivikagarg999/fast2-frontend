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
  MapPinIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  KeyIcon,
  DocumentArrowDownIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  ReceiptPercentIcon,
  BellAlertIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { formatWeight } from '../../utils/formatWeight';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      try {
        setLoading(true);
        const response = await fetch('/proxy/api/order/my-orders', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);
        const data = await response.json();

        let ordersData = [];
        if (data.orders && Array.isArray(data.orders)) ordersData = data.orders;
        else if (Array.isArray(data)) ordersData = data;
        else if (data.data && Array.isArray(data.data)) ordersData = data.data;

        const transformedOrders = ordersData.map(order => {
          const subtotal = Number(order.subtotal) || (order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0);
          const deliveryFee = Number(order.deliveryCharges ?? order.deliveryFee) || 0;
          const handlingCharge = Number(order.handlingCharge) || 0;
          const total = Number(order.total) || (subtotal + deliveryFee + handlingCharge);
          const totalGst = Number(order.totalGst) || 0;
          const couponDiscount = Number(order.couponDiscount) || Number(order.couponApplied?.discountAmount) || 0;
          const scratchCouponDiscount = Number(order.scratchCouponDiscount) || Number(order.scratchCouponApplied?.discountAmount) || 0;
          const finalAmount = Number(order.finalAmount) || Math.max(0, total + totalGst - couponDiscount - scratchCouponDiscount);
          const walletDeduction = Number(order.walletDeduction) || 0;
          const paymentMethod = order.paymentMethod || 'cod';
          const cashOnDelivery = typeof order.cashOnDelivery === 'number'
            ? order.cashOnDelivery
            : (paymentMethod === 'cod' ? Math.max(0, finalAmount - walletDeduction) : 0);

          const prescription =
            order.prescription ||
            (order.prescriptionImage?.url ? {
              imageUrl: order.prescriptionImage.url,
              status: order.status === 'prescription-rejected'
                ? 'rejected'
                : order.status === 'prescription-approved'
                  ? 'approved'
                  : 'pending',
              rejectionReason: order.prescriptionRejectionReason || ''
            } : null);

          return {
            _id: order._id,
            orderId: order.orderId,
            orderNumber: order.orderId || `ORD${order._id?.slice(-6)?.toUpperCase() || '000000'}`,
            status: order.status || 'pending',
            total, finalAmount, walletDeduction, cashOnDelivery,
            secretCode: order.secretCode,
            totalGst, subtotal, deliveryFee, handlingCharge,
            numberOfShops: Number(order.numberOfShops) || 0,
            couponDiscount, scratchCouponDiscount,
            items: order.items?.map(item => ({
              _id: item._id,
              product: {
                name: item.product?.name || 'Product',
                price: item.price || 0,
                images: item.product?.images || [],
                weight: item.product?.weight ? formatWeight(item.product.weight, item.product.weightUnit) : '',
                category: item.product?.category,
              },
              quantity: item.quantity || 1,
              gstPercent: item.gstPercent || 0,
              gstAmount: item.gstAmount || 0,
              total: (item.price || 0) * (item.quantity || 1)
            })) || [],
            shippingAddress: order.shippingAddress || { addressLine: '', city: '', state: '', pinCode: '', phone: '' },
            paymentMethod,
            paymentStatus: order.paymentStatus || 'pending',
            prescription,
            createdAt: order.createdAt || new Date(),
            updatedAt: order.updatedAt || new Date(),
            orderScratchCard: order.orderScratchCard || null,
          };
        });

        setOrders(transformedOrders.reverse());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const handleDownloadInvoice = async (orderIdentifier) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/proxy/api/order/${orderIdentifier}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to download invoice');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderIdentifier}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      alert('Failed to download invoice. Please try again.');
    }
  };

  const scratchOrderCoupon = async (order) => {
    const token = localStorage.getItem('token');
    const candidateIds = [order.orderId, order._id].filter(Boolean);
    let lastErrorMessage = 'Could not scratch the card. Please try again.';
    for (const candidateId of candidateIds) {
      const res = await fetch(`/proxy/api/order/${candidateId}/scratch-coupon`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      const couponCode = data?.couponCode || data?.coupon?.code || data?.scratchCoupon?.couponCode || data?.data?.couponCode;
      if (couponCode) return { success: true, couponCode };
      if (data?.message) lastErrorMessage = data.message;
    }
    return { success: false, message: lastErrorMessage };
  };


  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(String(text));
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusPill = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':   return { label: 'Order Placed', cls: 'bg-yellow-100 text-yellow-700' };
      case 'pending-prescription': return { label: 'Prescription Review', cls: 'bg-amber-100 text-amber-700' };
      case 'prescription-approved': return { label: 'Prescription Approved', cls: 'bg-blue-100 text-blue-700' };
      case 'prescription-rejected': return { label: 'Prescription Rejected', cls: 'bg-red-100 text-red-600' };
      case 'confirmed': return { label: 'Confirmed',    cls: 'bg-blue-100 text-blue-700' };
      case 'accepted':  return { label: 'Confirmed',    cls: 'bg-blue-100 text-blue-700' };
      case 'picked-up': return { label: 'In Transit',   cls: 'bg-purple-100 text-purple-700' };
      case 'delivered': return { label: 'Delivered',    cls: 'bg-green-100 text-green-700' };
      case 'cancelled': return { label: 'Cancelled',    cls: 'bg-red-100 text-red-600' };
      default:          return { label: status,          cls: 'bg-gray-100 text-gray-600' };
    }
  };

  const getPaymentMethodDisplay = (order) => {
    if (order.walletDeduction > 0 && order.cashOnDelivery > 0) return 'Wallet + COD';
    if (order.walletDeduction > 0) return 'Wallet';
    return order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online';
  };

  const getShipmentSteps = (order) => {
    const base = new Date(order.createdAt);
    const fmt = (d) =>
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const levelMap = {
      pending: 1,
      'pending-prescription': 1,
      'prescription-approved': 2,
      confirmed: 2,
      accepted: 2,
      'picked-up': 3,
      delivered: 5,
      cancelled: 0,
      'prescription-rejected': 0
    };
    const done = levelMap[order.status] || 0;

    const steps = [
      { label: 'Order Placed', desc: 'Your order has been placed',    time: fmt(base),                                           icon: 'placed' },
      { label: 'Packed',       desc: 'Your item has been packed',     time: fmt(new Date(base.getTime() + 105 * 60000)),         icon: 'packed' },
      { label: 'Shipped',      desc: 'Your order has been shipped',   time: fmt(new Date(base.getTime() + 170 * 60000)),         icon: 'shipped' },
      { label: 'In Transit',   desc: 'Your order is on the way',      time: null,                                                icon: 'transit' },
      { label: 'Delivered',    desc: 'Estimated delivery',            time: null,                                                icon: 'delivered' },
    ];

    return steps.map((s, i) => ({ ...s, done: i < done, current: i === done && done < 5 }));
  };

  const getOrderUpdates = (order) => {
    const base = new Date(order.createdAt);
    const fmt = (d) =>
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const updates = [
      { title: 'Order Confirmed', desc: 'Your order has been confirmed', time: fmt(base), green: true },
    ];
    if (order.status === 'pending-prescription') {
      return [{ title: 'Prescription Under Review', desc: 'Your prescription is being verified by the medical shop', time: fmt(base), green: false }];
    }
    if (order.status === 'prescription-rejected') {
      return [{ title: 'Prescription Rejected', desc: order.prescription?.rejectionReason || 'Your prescription could not be verified', time: fmt(base), green: false, red: true }];
    }
    if (['prescription-approved', 'confirmed', 'accepted', 'picked-up', 'delivered'].includes(order.status)) {
      if (order.status === 'prescription-approved') {
        updates.push({ title: 'Prescription Approved', desc: 'Medical shop has approved your prescription', time: fmt(base), green: true });
      }
      updates.push({ title: "We're Preparing Your Order", desc: 'Seller has started preparing your order', time: fmt(new Date(base.getTime() + 105 * 60000)), green: false });
    }
    if (['picked-up', 'delivered'].includes(order.status)) {
      updates.push({ title: 'Out for Delivery', desc: 'Driver has picked up your order', time: fmt(new Date(base.getTime() + 170 * 60000)), green: false });
    }
    if (order.status === 'delivered') {
      updates.push({ title: 'Order Delivered', desc: 'Your order has been delivered successfully', time: fmt(new Date(base.getTime() + 300 * 60000)), green: true });
    }
    if (order.status === 'cancelled') {
      updates.push({ title: 'Order Cancelled', desc: 'Your order has been cancelled', time: fmt(new Date(base.getTime() + 10 * 60000)), green: false, red: true });
    }
    return updates;
  };

  // ── Shipment Progress panel (right side) ─────────────────────
  const ShipmentPanel = ({ order }) => {
    const [scratchCard, setScratchCard] = useState(order.orderScratchCard || null);
    const [scratching, setScratching] = useState(false);
    const [scratchError, setScratchError] = useState('');
    const [scratchRevealed, setScratchRevealed] = useState(order.orderScratchCard?.isScratched || false);
    const [copied2, setCopied2] = useState(false);

    const steps = getShipmentSteps(order);
    const pill = getStatusPill(order.status);
    const estDate = new Date(new Date(order.createdAt).getTime() + 24 * 3600000);
    const estLabel = estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleScratch = async () => {
      setScratching(true);
      setScratchError('');
      try {
        const result = await scratchOrderCoupon(order);
        if (result.success) {
          const updated = { ...scratchCard, isScratched: true, couponCode: result.couponCode };
          setScratchCard(updated);
          setScratchRevealed(true);
          setOrders(prev => prev.map(o => o._id === order._id ? { ...o, orderScratchCard: updated } : o));
        } else {
          setScratchError(result.message);
        }
      } catch {
        setScratchError('Something went wrong. Please try again.');
      } finally {
        setScratching(false);
      }
    };

    const StepIcon = ({ icon, done }) => {
      const cls = `w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`;
      if (icon === 'placed')    return <CheckCircleIcon className={cls} />;
      if (icon === 'packed')    return <CubeIcon className={cls} />;
      if (icon === 'shipped')   return <TruckIcon className={cls} />;
      if (icon === 'transit')   return <MapPinIcon className={cls} />;
      if (icon === 'delivered') return <ArchiveBoxIcon className={cls} />;
      return <CheckCircleIcon className={cls} />;
    };

    return (
      <div className="space-y-3">
        {/* Order header */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Order ID: {order.orderId}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${pill.cls}`}>{pill.label}</span>
          </div>
        </div>

        {/* Shipment Progress */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Shipment Progress</h3>
          <div>
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-600' : 'bg-gray-100'}`}>
                    <StepIcon icon={step.icon} done={step.done} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[32px] ${step.done ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
                {/* Text */}
                <div className="pb-5 pt-1">
                  <p className={`text-sm font-semibold leading-tight ${step.done ? 'text-green-700' : 'text-gray-500'}`}>{step.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  {step.done && step.time && <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>}
                  {step.label === 'Delivered' && !step.done && (
                    <p className="text-xs text-gray-400 mt-0.5">{estLabel} by 08:00 PM</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Delivery card */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Estimated Delivery</p>
            <p className="font-bold text-gray-900">{estLabel}</p>
            <p className="text-xs text-gray-500">By 08:00 PM</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items</span>
            <span className="font-medium text-gray-900">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-medium text-gray-900">₹{order.finalAmount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium text-gray-900">{getPaymentMethodDisplay(order)}</span>
          </div>
          {order.secretCode && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Secret Code</span>
              <span className="font-bold text-green-700">{order.secretCode}</span>
            </div>
          )}
        </div>

        {/* Secret Code big display */}
        {order.secretCode && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <KeyIcon className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-gray-800">Secret Code</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">Share this code with delivery partner at the time of delivery.</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-700 tracking-wider">{order.secretCode}</span>
              <button onClick={() => { navigator.clipboard.writeText(String(order.secretCode)); setCopied2(true); setTimeout(() => setCopied2(false), 2000); }}>
                <DocumentDuplicateIcon className={`w-5 h-5 ${copied2 ? 'text-green-600' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Scratch Card */}
        {scratchCard?.isEligible && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ReceiptPercentIcon className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-semibold text-gray-800">Scratch Card</p>
              {!scratchCard.isScratched && !scratchRevealed && (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span>
              )}
            </div>
            {(scratchCard.isScratched || scratchRevealed) ? (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-center">
                <p className="text-xs font-medium text-yellow-900 mb-2">Your Coupon Code</p>
                <div className="bg-white rounded-lg px-4 py-2 inline-flex items-center gap-3 shadow-sm">
                  <code className="text-base font-bold text-gray-900 tracking-widest">{scratchCard.couponCode}</code>
                  <button onClick={() => { navigator.clipboard.writeText(scratchCard.couponCode); }}>
                    <DocumentDuplicateIcon className="w-4 h-4 text-green-600" />
                  </button>
                </div>
                <p className="text-xs text-yellow-900/80 mt-2">Apply at checkout on your next order</p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 p-5 text-center">
                <p className="relative text-yellow-900 font-bold text-sm mb-1">You earned a Scratch Card!</p>
                <p className="relative text-yellow-800/80 text-xs mb-4">Scratch to reveal your reward</p>
                <button
                  onClick={handleScratch}
                  disabled={scratching}
                  className="relative bg-white text-amber-700 font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-amber-50 active:scale-95 transition-all shadow-md disabled:opacity-70"
                >
                  {scratching ? 'Scratching...' : 'Scratch to Reveal'}
                </button>
                {scratchError && <p className="text-red-700 text-xs mt-3 relative bg-white/60 rounded px-2 py-1">{scratchError}</p>}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleDownloadInvoice(order.orderId || order._id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Download Invoice
          </button>
          <button
            onClick={() => router.push('/contact')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 rounded-xl text-sm font-medium text-white hover:bg-green-700"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
            Need Help?
          </button>
        </div>
      </div>
    );
  };

  // ── Order Detail Panel (left side when viewMode='detail') ─────
  const OrderDetailPanel = ({ order }) => {
    const pill = getStatusPill(order.status);
    const updates = getOrderUpdates(order);
    const firstItem = order.items[0];

    return (
      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => setViewMode('list')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to all orders
        </button>

        {/* Order header card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
              {firstItem?.product?.images?.[0]?.url ? (
                <img src={firstItem.product.images[0].url} alt={firstItem.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">
                  {firstItem?.product?.name || 'Order'}
                </h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${pill.cls}`}>{pill.label}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{order.orderId}</span></p>
                <button onClick={() => copyToClipboard(order.orderId, `id-${order._id}`)}>
                  <DocumentDuplicateIcon className={`w-4 h-4 ${copiedId === `id-${order._id}` ? 'text-green-600' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* 4-col info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Order Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Amount</p>
              <p className="text-sm font-bold text-gray-900">₹{order.finalAmount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Payment</p>
              <p className="text-sm font-semibold text-gray-900">{getPaymentMethodDisplay(order)}</p>
            </div>
            {order.secretCode && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Secret Code</p>
                <p className="text-sm font-bold text-green-700 tracking-wider">{order.secretCode}</p>
              </div>
            )}
          </div>

          {/* Location */}
          <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            Delivering to {order.shippingAddress?.city || 'your location'}
            {firstItem?.product?.weight ? ` • ${firstItem.product.weight}` : ''}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleDownloadInvoice(order.orderId || order._id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4 text-green-600" />
              Download Invoice
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
              Need Help?
            </button>
          </div>
        </div>

        {order.prescription && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">Prescription</h3>
            <div className="flex items-start gap-4">
              {order.prescription.imageUrl && (
                <img
                  src={order.prescription.imageUrl}
                  alt="Prescription"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold text-gray-900 capitalize">{order.prescription.status || 'pending'}</span>
                </p>
                {order.prescription.rejectionReason && (
                  <p className="text-sm text-red-600 mt-2">
                    Reason: {order.prescription.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBagIcon className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                  {item.product.weight && <p className="text-xs text-gray-500">{item.product.weight}</p>}
                  <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 flex-shrink-0">₹{item.total}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Updates */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-4">Order Updates</h3>
          <div>
            {updates.map((update, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    update.red ? 'bg-red-100' : update.green ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {update.green ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : update.red ? (
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <BellAlertIcon className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  {i < updates.length - 1 && <div className="w-0.5 flex-1 min-h-[24px] bg-gray-200" />}
                </div>
                <div className="pb-5 pt-1">
                  <p className={`text-sm font-semibold ${update.green ? 'text-green-700' : update.red ? 'text-red-600' : 'text-gray-900'}`}>
                    {update.title}
                  </p>
                  <p className="text-xs text-gray-500">{update.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Need Help card */}
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Need help with your order?</p>
            <p className="text-xs text-gray-500 mt-0.5">Our support team is here to help you.</p>
          </div>
          <button
            onClick={() => router.push('/contact')}
            className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors whitespace-nowrap"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
            Contact Support
          </button>
        </div>
      </div>
    );
  };

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 relative">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-green-100 border-t-green-600" />
            <ShoppingBagIcon className="w-6 h-6 text-green-600 absolute inset-0 m-auto" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Loading Your Orders</h2>
          <p className="text-gray-400 text-sm mt-1">Fetching your order history...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Orders</h1>
          <p className="text-gray-400 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all',       label: 'All Orders', count: orders.length,                                         icon: ShoppingBagIcon },
    { id: 'pending',   label: 'Pending',    count: orders.filter(o => o.status === 'pending').length,     icon: ClockIcon },
    { id: 'pending-prescription', label: 'Prescription Review', count: orders.filter(o => o.status === 'pending-prescription').length, icon: ClockIcon },
    { id: 'confirmed', label: 'Confirmed',  count: orders.filter(o => ['prescription-approved','confirmed','accepted'].includes(o.status)).length, icon: CheckCircleIcon },
    { id: 'picked-up', label: 'In Transit', count: orders.filter(o => o.status === 'picked-up').length,  icon: TruckIcon },
    { id: 'delivered', label: 'Delivered',  count: orders.filter(o => o.status === 'delivered').length,  icon: CheckCircleSolidIcon },
    { id: 'cancelled', label: 'Cancelled',  count: orders.filter(o => ['cancelled','prescription-rejected'].includes(o.status)).length,  icon: XCircleIcon },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all'
      || (activeTab === 'confirmed'
        ? ['prescription-approved', 'confirmed', 'accepted'].includes(order.status)
        : activeTab === 'cancelled'
          ? ['cancelled', 'prescription-rejected'].includes(order.status)
          : order.status === activeTab);
    const matchesSearch = searchTerm === ''
      || order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      || order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      || order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-400 mt-0.5">Track, view and manage all your orders</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order ID, item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-60"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setViewMode('list'); }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">

          {/* Left panel */}
          <div className="flex-1 min-w-0">
            {viewMode === 'detail' && selectedOrder ? (
              <OrderDetailPanel order={selectedOrder} />
            ) : sortedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {searchTerm ? 'No orders found' : activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
                </h2>
                <p className="text-gray-400 mb-6 text-sm max-w-sm mx-auto">
                  {searchTerm ? `No orders matching "${searchTerm}".` : 'Start shopping to see your orders here.'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order & Items</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</p>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {sortedOrders.map(order => {
                    const pill = getStatusPill(order.status);
                    const firstItem = order.items[0];
                    const isSelected = selectedOrder?._id === order._id && viewMode === 'list';

                    return (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className={`grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr] gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-green-50' : ''}`}
                      >
                        {/* Order & Items */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            {firstItem?.product?.images?.[0]?.url ? (
                              <img src={firstItem.product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBagIcon className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {firstItem?.product?.name || 'Order'}
                              {order.items.length > 1 && (
                                <span className="text-gray-400 font-normal text-xs"> +{order.items.length - 1}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 truncate">Order ID: {order.orderId}</p>
                            <p className="text-xs text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex flex-col justify-center">
                          <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col justify-center">
                          <p className="text-sm font-semibold text-gray-900">₹{order.finalAmount}</p>
                          <p className={`text-xs font-medium ${order.paymentMethod === 'cod' ? 'text-orange-500' : 'text-green-600'}`}>
                            {order.paymentMethod === 'cod' ? 'COD' : 'Paid'}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${pill.cls}`}>{pill.label}</span>
                        </div>

                        {/* Action */}
                        <div className="flex items-center gap-2">
                          {order.status === 'cancelled' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setViewMode('detail'); }}
                              className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setViewMode('detail'); }}
                              className="text-xs font-medium text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
                            >
                              Track Order
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(order.orderId || order._id); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Download Invoice"
                          >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {sortedOrders.length >= 10 && (
                  <div className="text-center py-4 border-t border-gray-100">
                    <button className="text-sm text-gray-500 font-medium flex items-center gap-1 mx-auto hover:text-gray-700 transition-colors">
                      Load More Orders
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel — Shipment Progress */}
          {selectedOrder && (
            <div className="hidden lg:block w-80 flex-shrink-0 sticky top-6">
              <ShipmentPanel order={selectedOrder} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
