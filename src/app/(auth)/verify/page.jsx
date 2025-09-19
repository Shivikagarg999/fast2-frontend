'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Footer from '@/app/components/footer/page';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [storedOtp, setStoredOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get stored values from localStorage
    const savedOtp = localStorage.getItem('otp');
    const savedPhone = localStorage.getItem('phone');
    
    if (savedOtp) setStoredOtp(savedOtp);
    if (savedPhone) setPhone(savedPhone);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    // Focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  // Helper function to handle login success
  const handleLoginSuccess = (token) => {
    console.log('Login successful, storing token:', token);
    
    // Store the token
    localStorage.setItem('token', token);
    
    // Clean up temporary data
    localStorage.removeItem('otp');
    localStorage.removeItem('phone');
    
    // Notify all components about auth change
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('userLoggedIn'));
    window.dispatchEvent(new Event('storage'));
    
    console.log('Auth events dispatched');
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/api/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP verified successfully!');
        
        // Store the token and notify components
        handleLoginSuccess(data.token);
        
        // Redirect to home page after successful verification
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setError(data.error || data.message || 'Failed to verify OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setCanResend(false);
    setCountdown(30);

    try {
      const response = await fetch(`${BASE_URL}/api/user/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP resent successfully!');
        localStorage.setItem('otp', data.otp);
        setStoredOtp(data.otp);
        
        // Start countdown again
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || data.message || 'Failed to resend OTP');
        setCanResend(true);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Verify OTP | Fast2.in</title>
        <meta name="description" content="Verify your OTP" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 py-4 px-6">
            <h2 className="text-white text-xl font-bold">Verify OTP</h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-2">Enter the 6-digit code sent to</p>
            <p className="font-medium text-gray-900 mb-6">+91 {phone}</p>

            {/* Testing Note - Show OTP for development */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 text-center">
                <span className="font-semibold">Testing Mode:</span> Your OTP is {storedOtp}
              </p>
            </div>
            
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="flex justify-between space-x-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="tel"
                      name="otp"
                      maxLength="1"
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      className="w-12 h-12 border text-black border-gray-300 rounded-lg text-center text-xl font-semibold focus:ring-blue-500 focus:border-blue-500"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              
              {success && (
                <div className="mb-4 rounded-md bg-blue-50 p-4">
                  <div className="text-sm text-blue-700">{success}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    className="text-blue-600 font-medium hover:text-blue-700 focus:outline-none"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-400">Resend OTP in {countdown}s</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

     <Footer/>
    </div>
  );
}