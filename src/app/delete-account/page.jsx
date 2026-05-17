'use client';

import { useState } from 'react';
import Link from 'next/link';

const BASE_URL = 'https://www.fast2.in/proxy';

export default function DeleteAccountPage() {
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Login to get JWT
      const loginRes = await fetch(`${BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError(loginData.error || 'Invalid email or password.');
        setStep('form');
        return;
      }

      const token = loginData.token;

      // Step 2: Delete account
      const deleteRes = await fetch(`${BASE_URL}/api/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const deleteData = await deleteRes.json();

      if (!deleteRes.ok) {
        setError(deleteData.error || 'Failed to delete account. Please try again.');
        setStep('form');
        return;
      }

      setStep('success');
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Deleted</h1>
          <p className="text-gray-500 mb-6">
            Your account and all associated data have been permanently deleted.
          </p>
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Are you sure?</h1>
          <p className="text-gray-500 text-center mb-6">
            This will permanently delete the account for <span className="font-medium text-gray-700">{email}</span>. This action <span className="font-semibold text-red-600">cannot be undone</span>.
          </p>

          <ul className="bg-red-50 rounded-xl p-4 mb-6 space-y-2 text-sm text-red-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span> All your orders and order history will be erased
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span> Your wallet balance will be lost
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span> Saved addresses will be removed
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span> You will not be able to recover this account
            </li>
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setStep('form'); setError(''); }}
              disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deleting...
                </span>
              ) : 'Yes, Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Delete Your Account</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your credentials to permanently delete your fast2 account.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your registered email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-gray-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your account password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-gray-900 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors mt-2"
            >
              Continue to Delete Account
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            This action is permanent and cannot be reversed.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Changed your mind?{' '}
          <Link href="/" className="text-purple-600 font-medium hover:underline">
            Go back to fast2
          </Link>
        </p>
      </div>
    </div>
  );
}
