"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/logo.png';
import Footer from '../components/footer/page';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.fast2.in/api/admin/terms/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTermsData(data.data);
      } else {
        setError(data.message || 'Failed to fetch terms and conditions');
      }
    } catch (error) {
      console.error('Fetch terms error:', error);
      setError('An error occurred while fetching terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="rounded-xl flex items-center justify-center">
                <Image 
                  src={Logo} 
                  alt="Fast2" 
                  width={100} 
                  height={100}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Fast2
              </span>
            </Link>
            <Link 
              href="/warehouse-partner" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Apply for Job
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <Image 
                  src={Logo} 
                  alt="Fast2" 
                  width={80} 
                  height={80}
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-gray-600 text-lg">
              Please read these terms carefully before using our services
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading terms and conditions...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Terms</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchTermsAndConditions}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Terms Content */}
          {termsData && !loading && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Terms Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{termsData.title}</h2>
                    <div className="flex items-center space-x-4">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        Version {termsData.version}
                      </span>
                      {termsData.isActive && (
                        <span className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Currently Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm mb-1">Effective Date</p>
                    <p className="font-semibold">{formatDate(termsData.effectiveDate)}</p>
                  </div>
                </div>
              </div>

              {/* Terms Body */}
              <div className="p-8 md:p-10">
                <div className="prose prose-lg max-w-none">
                  {/* Last Updated */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
                    <p className="text-blue-800 text-sm">
                      <span className="font-semibold">Last Updated:</span> {formatDate(termsData.updatedAt || termsData.createdAt)}
                    </p>
                  </div>

                  {/* Terms Content */}
                  <div 
                    className="terms-content"
                    dangerouslySetInnerHTML={{ __html: termsData.content }}
                  />
                </div>

                {/* Acceptance Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceptance of Terms</h3>
                    <p className="text-gray-600 mb-6">
                      By accessing or using Fast2's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                    </p>
                    <div className="flex items-center space-x-3 text-gray-700">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>This document is legally binding</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions About These Terms?</h3>
                  <p className="text-gray-600 mb-4">
                    If you have any questions regarding these Terms and Conditions, please contact us:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">legal@fast2.in</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Business Hours</p>
                      <p className="font-medium text-gray-900">Mon-Fri, 9 AM - 6 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/warehouse-partner"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center shadow-lg hover:shadow-xl"
            >
              Return to Job Application
            </Link>
            <Link
              href="/privacy-policy"
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-center"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
              <p className="text-gray-600 text-sm">
                Our terms comply with Indian laws and regulations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Protected</h3>
              <p className="text-gray-600 text-sm">
                Your rights and obligations are clearly defined and protected
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Regular Updates</h3>
              <p className="text-gray-600 text-sm">
                Terms are regularly reviewed and updated as needed
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}