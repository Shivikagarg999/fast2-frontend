'use client'
import { useState } from 'react';
import Head from 'next/head';
import Footer from '@/app/components/footer/page';
import Link from 'next/link';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured, missingFirebaseConfigKeys } from '@/app/lib/firebase';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.fast2.in/proxy";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState('phone');
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const storeLoginSession = (data) => {
    if (!data.token) return;

    localStorage.setItem('token', data.token);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('userLoggedIn'));
    window.dispatchEvent(new Event('storage'));
  };

  const setupRecaptcha = async () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        size: 'invisible',
      });
      await window.recaptchaVerifier.render();
    }
    return window.recaptchaVerifier;
  };

  const resetRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/user/login' : '/api/user/register';
      const payload = isLogin 
        ? { email, password }
        : { email, password, referralCode: referralCode || undefined };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
        
        storeLoginSession(data);

        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setError(data.error || `Failed to ${isLogin ? 'login' : 'register'}`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFirebaseOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (!isFirebaseConfigured) {
      setError(`Firebase phone login is missing config: ${missingFirebaseConfigKeys.join(', ')}`);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setOtpLoading(true);

    try {
      const phoneNumber = `+91${cleanPhone}`;
      const appVerifier = await setupRecaptcha();
      const result = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);

      console.log('OTP sent successfully');
      setConfirmationResult(result);
      setOtpSent(true);
      setSuccess('OTP sent successfully.');
    } catch (err) {
      resetRecaptcha();
      
      // Better error messages with more details
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      console.error('Full OTP error:', {
        code: err?.code,
        message: err?.message,
        customData: err?.customData,
        toString: err?.toString()
      });
      
      if (err?.message?.includes('already been rendered')) {
        errorMessage = 'reCAPTCHA error. Please refresh the page and try again.';
      } else if (err?.message?.includes('invalid variables env')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (err?.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again in a few minutes.';
      } else if (err?.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Use 10-digit number.';
      } else if (err?.code === 'auth/invalid-api-key') {
        errorMessage = 'Firebase API key is invalid. Check configuration.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        errorMessage = 'Phone authentication is not enabled. Check Firebase Console.';
      } else if (err?.message?.includes('400')) {
        errorMessage = `Firebase error: ${err.message}. Check console for details.`;
      } else {
        errorMessage = err?.message || errorMessage;
      }
      
      setError(errorMessage);
      console.error('OTP send error:', err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyFirebaseOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!confirmationResult) {
      setError('Please request an OTP first.');
      return;
    }

    if (!/^\d{6}$/.test(phoneOtp)) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setOtpLoading(true);

    try {
      const credential = await confirmationResult.confirm(phoneOtp);
      const idToken = await credential.user.getIdToken();
      const fcmToken = localStorage.getItem('fcmToken') || undefined;

      const response = await fetch(`${BASE_URL}/api/user/firebase-otp-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          name: name.trim() || undefined,
          referralCode: referralCode.trim() || undefined,
          fcmToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        storeLoginSession(data);
        setSuccess(data.message || 'Login successful!');

        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      } else {
        setError(data.error || data.message || 'Failed to login with phone OTP');
      }
    } catch (err) {
      setError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setForgotLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Password reset link has been sent to your email!');
        setShowForgotPassword(false);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const switchToLogin = () => {
    resetRecaptcha();
    setIsLogin(true);
    setAuthMethod('email');
    setShowForgotPassword(false);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setPhoneOtp('');
    setPhone('');
  };

  const switchToRegister = () => {
    resetRecaptcha();
    setIsLogin(false);
    setAuthMethod('email');
    setShowForgotPassword(false);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setPhoneOtp('');
    setPhone('');
  };

  const switchToPhone = () => {
    resetRecaptcha();
    setAuthMethod('phone');
    setShowForgotPassword(false);
    setError('');
    setSuccess('');
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>{isLogin ? 'Login' : 'Register'} - Your App</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 py-4 px-6">
            <h2 className="text-white text-xl font-bold text-center">
              {showForgotPassword ? 'Reset Password' : authMethod === 'phone' ? 'Login with Phone OTP' : isLogin ? 'Login to Your Account' : 'Create New Account'}
            </h2>
          </div>
          
          <div className="p-6">
            {!isLogin && !showForgotPassword && authMethod === 'email' && (
              <div className="mb-6 text-center">
                <p className="text-gray-600 text-sm">
                  Join thousands of users and start earning rewards today!
                </p>
              </div>
            )}

            {!showForgotPassword && (
              <div className="flex justify-center mb-6 bg-gray-100 rounded-md p-1">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${authMethod === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={switchToPhone}
                >
                  Phone OTP
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${authMethod === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={switchToLogin}
                >
                  Email
                </button>
              </div>
            )}

            {!showForgotPassword && authMethod === 'email' && (
              <div className="flex justify-center mb-6 bg-gray-100 rounded-md p-1">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={switchToRegister}
                >
                  Register
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={switchToLogin}
                >
                  Login
                </button>
              </div>
            )}

            {showForgotPassword ? (
              // Forgot Password Form
              <div>
                <p className="text-gray-600 mb-6 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <div className="mb-4">
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="forgotEmail"
                    name="forgotEmail"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotLoading || !email}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {forgotLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Reset Link'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            ) : authMethod === 'phone' ? (
              <form onSubmit={otpSent ? handleVerifyFirebaseOtp : handleSendFirebaseOtp}>
                {!isFirebaseConfigured && (
                  <div className="mb-4 rounded-md bg-yellow-50 p-4">
                    <div className="text-sm text-yellow-800">
                      Firebase phone login is missing config: {missingFirebaseConfigKeys.join(', ')}.
                    </div>
                  </div>
                )}

                <div id="recaptcha-container" />

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                      +91
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength="10"
                      required
                      disabled={otpSent}
                      className="w-full rounded-r-md border border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:ring-green-500 disabled:bg-gray-50"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </div>

                {otpSent && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="phoneOtp" className="block text-sm font-medium text-gray-700 mb-1">
                        OTP
                      </label>
                      <input
                        id="phoneOtp"
                        name="phoneOtp"
                        type="tel"
                        inputMode="numeric"
                        maxLength="6"
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:ring-green-500"
                        placeholder="Enter 6-digit OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:ring-green-500"
                        placeholder="Customer Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="phoneReferralCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Referral Code <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <input
                        id="phoneReferralCode"
                        name="phoneReferralCode"
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-green-500 focus:ring-green-500"
                        placeholder="Enter referral code if you have one"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || !isFirebaseConfigured || !phone || (otpSent && phoneOtp.length !== 6)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {otpSent ? 'Verifying...' : 'Sending OTP...'}
                    </>
                  ) : otpSent ? 'Verify and Login' : 'Send OTP'}
                </button>

                {otpSent && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setConfirmationResult(null);
                        setPhoneOtp('');
                        setError('');
                        setSuccess('');
                        resetRecaptcha();
                      }}
                      className="text-sm font-medium text-green-600 hover:text-green-800"
                    >
                      Change number
                    </button>
                  </div>
                )}
              </form>
            ) : (
              // Login/Register Form
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                    placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {!isLogin && (
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 6 characters long
                    </p>
                  )}
                </div>

                {!isLogin && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Referral Code <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <input
                        id="referralCode"
                        name="referralCode"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                        placeholder="Enter referral code if you have one"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                      />
                      {referralCode && (
                        <p className="mt-1 text-xs text-green-600">
                          You'll receive bonus rewards for using a referral code!
                        </p>
                      )}
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="mb-6 text-right">
                    <button
                      type="button"
                      onClick={toggleForgotPassword}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password || (!isLogin && password !== confirmPassword)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Logging in...' : 'Creating Account...'}
                    </>
                  ) : isLogin ? 'Login to Account' : 'Create Account'}
                </button>
              </form>
            )}

            {!showForgotPassword && authMethod === 'email' && !isLogin && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Login here
                  </button>
                </p>
              </div>
            )}

            {!showForgotPassword && authMethod === 'email' && isLogin && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Register here
                  </button>
                </p>
              </div>
            )}

            {!showForgotPassword && (
              <p className="mt-6 text-center text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-green-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Benefits Section for Register Page */}
        {!isLogin && !showForgotPassword && authMethod === 'email' && (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Register?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Get ₹20 welcome bonus in your wallet</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Earn ₹200 for each successful referral</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Access exclusive features and rewards</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
