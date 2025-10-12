"use client";
import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ShareIcon, 
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  GiftIcon,
  BanknotesIcon,
  UsersIcon,
  StarIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function ReferAndEarn() {
  const [referralData, setReferralData] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [redeemResult, setRedeemResult] = useState(null);
  const [activeTab, setActiveTab] = useState('share');
  const router = useRouter();

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/signup?ref=${referralData?.referralCode}`
    : '';

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [statsResponse, historyResponse] = await Promise.all([
        fetch('https://api.fast2.in/api/referrals/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://api.fast2.in/api/referrals/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setReferralData(statsData.data);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setReferralHistory(historyData.data?.referrals || []);
      }

    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Get ₹50 Free on Fast2!',
          text: `Use my code ${referralData?.referralCode} to get ₹50 instantly when you sign up on Fast2!`,
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const redeemReferralCode = async () => {
    if (!referralCode.trim()) return;

    setRedeemLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.fast2.in/api/referrals/redeem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ referralCode: referralCode.toUpperCase() })
      });

      const result = await response.json();
      setRedeemResult(result);
      
      if (result.success) {
        setReferralCode('');
        fetchReferralData(); // Refresh data
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      setRedeemResult({ success: false, error: 'Redemption failed' });
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Refer & Earn</h1>
                <p className="text-gray-600 mt-1">Invite friends and earn rewards together</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex-1 mb-8 lg:mb-0">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
                  <StarIcon className="w-4 h-4 mr-2" />
                  Limited Time Offer
                </div>
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Earn ₹200 for every friend who joins Fast2
                </h2>
                <p className="text-blue-100 text-xl mb-8 max-w-2xl">
                  Share your unique code. Your friend gets ₹50 instantly, and you get ₹200 when they sign up.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                    <GiftIcon className="w-6 h-6" />
                    <div>
                      <div className="text-sm text-blue-200">Friend gets</div>
                      <div className="text-xl font-bold">₹50</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                    <BanknotesIcon className="w-6 h-6" />
                    <div>
                      <div className="text-sm text-blue-200">You earn</div>
                      <div className="text-xl font-bold">₹200</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <UserGroupIcon className="w-32 h-32 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-gray-200 max-w-md">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'share'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Share & Earn
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'redeem'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Redeem Code
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'share' && (
              <>
                {/* Referral Code Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Your Referral Code</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={shareReferral}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        <ShareIcon className="w-5 h-5" />
                        <span>Share Link</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Your referral code</p>
                        <div className="flex items-center space-x-4">
                          <code className="text-3xl font-bold text-gray-900 font-mono tracking-wider bg-white px-4 py-3 rounded-lg border">
                            {referralData?.referralCode}
                          </code>
                          <button
                            onClick={() => copyToClipboard(referralData?.referralCode)}
                            className="p-3 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-xl border border-gray-200 hover:border-gray-300"
                            title="Copy code only"
                          >
                            {copied ? (
                              <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                          Share the link: <span className="font-mono text-gray-700 text-xs">{referralLink}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {copied && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Referral code copied!</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                {referralData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total Referrals</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{referralData.totalReferrals}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <UsersIcon className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Earned</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">₹{referralData.earnedAmount}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                          <BanknotesIcon className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Pending</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{referralData.pendingReferrals}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl">
                          <ClockIcon className="w-8 h-8 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'redeem' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <TicketIcon className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Redeem Referral Code</h3>
                </div>
                <p className="text-gray-600 mb-8">Enter a friend's referral code to get ₹50 instantly</p>
                
                {redeemResult && (
                  <div className={`p-4 rounded-xl mb-6 ${
                    redeemResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {redeemResult.success ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                      )}
                      <span className={redeemResult.success ? 'text-green-700' : 'text-red-700'}>
                        {redeemResult.message || redeemResult.error}
                      </span>
                    </div>
                    {redeemResult.success && redeemResult.data && (
                      <div className="mt-2 text-sm text-green-600">
                        ₹{redeemResult.data.bonusReceived} credited to your wallet
                      </div>
                    )}
                  </div>
                )}

                {referralData?.hasUsedReferral ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Referral Code Applied</h4>
                    <p className="text-gray-600">You have already redeemed a referral code and received your bonus.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Enter Referral Code
                      </label>
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          placeholder="Enter friend's referral code"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono uppercase"
                        />
                        <button
                          onClick={redeemReferralCode}
                          disabled={!referralCode.trim() || redeemLoading}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                        >
                          {redeemLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <span>Redeem</span>
                              <ArrowRightIcon className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Referral History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Referrals</h3>
              
              {referralHistory.length > 0 ? (
                <div className="space-y-4">
                  {referralHistory.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {referral.name || `User ${referral.phone?.slice(-4) || 'N/A'}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{referral.phone}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status === 'completed' ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No referrals yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start sharing your code!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}