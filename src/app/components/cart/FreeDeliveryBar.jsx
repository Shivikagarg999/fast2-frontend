import { TruckIcon } from '@heroicons/react/24/outline';

export default function FreeDeliveryBar({ subtotal, threshold }) {
  if (!threshold || threshold <= 0) return null;

  const remaining = Math.max(0, Math.ceil(threshold - subtotal));
  const unlocked = remaining === 0;
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <TruckIcon className="w-5 h-5 text-brand-600 flex-shrink-0" />
        <p className="text-sm font-semibold text-gray-900">
          {unlocked ? 'You\'ve unlocked free delivery!' : `Add ₹${remaining} more for free delivery`}
        </p>
      </div>
      <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
