'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  GiftIcon,
  ShareIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

const ReferralPage = () => {
  const [referralStats, setReferralStats] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setLoading(true);
      const response = await fetch('/proxy/api/referral/referral-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }

      const data = await response.json();
      setReferralStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReferral = async (e) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    try {
      setApplying(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch('/proxy/api/referral/apply-referral', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ referralCode: referralCode.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply referral code');
      }

      setSuccess(data.message || 'Referral applied successfully!');
      setReferralCode('');
      // Refresh stats
      await fetchReferralStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = async () => {
    const shareText = `Join me on GMKart! Use my referral code ${referralStats?.yourReferralCode} to get ₹50 bonus!`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GMKart Referral',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(`${shareText} ${shareUrl}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-gray-600">Invite friends and earn together!</p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {referralStats?.totalReferrals || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{referralStats?.totalEarnings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <GiftIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Wallet</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{referralStats?.currentWallet || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Your Referral Code Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referral Code</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-lg font-mono font-bold text-gray-900">
                  {referralStats?.yourReferralCode || 'Loading...'}
                </span>
                <button
                  onClick={() => copyToClipboard(referralStats?.yourReferralCode)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <ClipboardDocumentCheckIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={shareReferral}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Share Referral</span>
              </button>

              {/* QR Code Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-2">
                    <QrCodeIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Show this code to friends to share your referral
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Referral Code Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Apply Referral Code</h2>
            
            {referralStats?.referredBy ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Referral Applied!
                </h3>
                <p className="text-gray-600">
                  You were referred by {referralStats.referredBy.name || referralStats.referredBy.phone}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  ₹50 bonus has been added to your wallet
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyReferral} className="space-y-4">
                <div>
                  <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Referral Code
                  </label>
                  <input
                    type="text"
                    id="referralCode"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter friend's referral code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    maxLength={10}
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying || !referralCode.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {applying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Applying...
                    </div>
                  ) : (
                    'Apply Referral & Get ₹50'
                  )}
                </button>
              </form>
            )}

            {/* How it Works */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                  Share your referral code with friends
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                  Friend signs up using your code
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                  Both get ₹50 bonus in wallet
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Referral Benefits Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm p-8 mt-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Earn More With Every Referral</h2>
            <p className="text-green-100">Unlock amazing rewards as you refer more friends</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Refer Friends</h3>
              <p className="text-green-100 text-sm">Share your code with friends and family</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <GiftIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Earn ₹50 Each</h3>
              <p className="text-green-100 text-sm">Both you and your friend get ₹50 bonus</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CurrencyRupeeIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Use Wallet Money</h3>
              <p className="text-green-100 text-sm">Use your earnings for shopping on GMKart</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How much do I earn per referral?</h3>
              <p className="text-gray-600 text-sm">You earn ₹50 for every successful referral. Your friend also gets ₹50 when they use your code.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">When will I receive my referral bonus?</h3>
              <p className="text-gray-600 text-sm">The bonus is credited immediately to your wallet once your friend completes signup using your referral code.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I use multiple referral codes?</h3>
              <p className="text-gray-600 text-sm">No, you can only use one referral code during signup. Make sure to use the code from someone you know!</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Where can I use my wallet money?</h3>
              <p className="text-gray-600 text-sm">You can use your wallet balance for any purchase on GMKart platform. It will be automatically applied during checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;