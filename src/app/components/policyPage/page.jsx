"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../footer/page';
import PolicyService from '../../services/policyService';

export const POLICY_PAGES = [
  { type: 'terms', label: 'Terms & Conditions', icon: '📜', color: 'from-green-600 to-green-700', href: '/terms-and-conditions' },
  { type: 'return', label: 'Return Policy', icon: '🔄', color: 'from-green-600 to-green-700', href: '/return-policy' },
  { type: 'cancellation', label: 'Cancellation Policy', icon: '❌', color: 'from-red-600 to-red-700', href: '/cancellation-policy' },
  { type: 'refund', label: 'Refund Policy', icon: '💰', color: 'from-amber-600 to-amber-700', href: '/refund-policy' },
];

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

export default function PolicyPageLayout({ policyType }) {
  const meta = POLICY_PAGES.find((p) => p.type === policyType);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyType]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PolicyService.getActivePolicyByType(policyType);

      if (data.success) {
        setPolicy(data.data);
      } else {
        setError(data.message || 'Failed to fetch policy');
      }
    } catch (err) {
      console.error('Fetch policy error:', err);
      setError('An error occurred while fetching this policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="py-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / policy switcher */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
            <Link href="/policies" className="text-green-700 hover:underline font-medium">
              All Policies
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{meta?.label}</span>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {meta?.icon} {meta?.label}
            </h1>
            <p className="text-gray-600 text-lg">
              Please read this policy carefully before using our services
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading policy...</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Policy</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchPolicy}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Policy Content */}
          {!loading && !error && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
              <div className="p-8">
                {!policy ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No {meta?.label} Available
                    </h3>
                    <p className="text-gray-600">
                      This policy is currently being prepared. Please check back later.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Policy Header */}
                    <div className={`bg-gradient-to-r ${meta?.color} text-white rounded-2xl p-8 mb-8`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{meta?.icon}</span>
                            <h2 className="text-2xl font-bold">{policy.title}</h2>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                              Version {policy.version}
                            </span>
                            {policy.isActive && (
                              <span className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                Currently Active
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-sm mb-1">Effective Date</p>
                          <p className="font-semibold">{formatDate(policy.effectiveDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Policy Metadata */}
                    {policy.metadata && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {policy.metadata.returnPeriod && (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="text-sm text-green-600 font-medium mb-1">Return Period</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.metadata.returnPeriod} days</p>
                          </div>
                        )}
                        {policy.metadata.cancellationFee && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-sm text-red-600 font-medium mb-1">Cancellation Fee</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.metadata.cancellationFee}%</p>
                          </div>
                        )}
                        {policy.metadata.refundProcessingDays && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-sm text-amber-600 font-medium mb-1">Refund Processing</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.metadata.refundProcessingDays} business days</p>
                          </div>
                        )}
                        {policy.metadata.contactEmail && (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="text-sm text-green-600 font-medium mb-1">Contact Email</p>
                            <p className="text-lg font-semibold text-gray-900">{policy.metadata.contactEmail}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Policy Content */}
                    <div className="prose prose-lg max-w-none">
                      {/* Last Updated */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
                        <p className="text-gray-700 text-sm">
                          <span className="font-semibold">Last Updated:</span> {formatDate(policy.updatedAt || policy.createdAt)}
                        </p>
                      </div>

                      {/* Policy Content with TinyMCE styles */}
                      <div
                        className="policy-content"
                        dangerouslySetInnerHTML={{ __html: policy.content }}
                      />
                    </div>

                    {/* Acceptance Section */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                      <div className={`bg-gradient-to-r ${meta?.color}/10 rounded-2xl p-6 border ${meta?.color.replace('from-', 'border-').replace(' to-', '/20')}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {policyType === 'terms' ? 'Acceptance of Terms' : 'Important Notice'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {policyType === 'terms'
                            ? "By accessing or using GMKart's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
                            : "This policy is an integral part of our terms of service. By using our services, you agree to comply with this policy."
                          }
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
                    <div className="mt-8 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions About This Policy?</h3>
                      <p className="text-gray-600 mb-4">
                        If you have any questions regarding our {meta?.label.toLowerCase()}, please contact us:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-medium text-gray-900">
                            {policy.metadata?.contactEmail || 'support@fast2.in'}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">Business Hours</p>
                          <p className="font-medium text-gray-900">Mon-Fri, 9 AM - 6 PM IST</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Other Policies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Other Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {POLICY_PAGES.filter((p) => p.type !== policyType).map((p) => (
                <Link
                  key={p.type}
                  href={p.href}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <h3 className="font-semibold text-gray-900">{p.label}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Global Styles for TinyMCE Content */}
      <style jsx global>{`
        .policy-content {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #374151;
        }

        .policy-content h1,
        .policy-content h2,
        .policy-content h3,
        .policy-content h4 {
          color: #111827;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }

        .policy-content h1 {
          font-size: 1.875rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .policy-content h2 {
          font-size: 1.5rem;
          color: #1d4ed8;
        }

        .policy-content h3 {
          font-size: 1.25rem;
          color: #374151;
        }

        .policy-content p {
          margin-bottom: 1rem;
        }

        .policy-content ul,
        .policy-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .policy-content li {
          margin-bottom: 0.5rem;
        }

        .policy-content strong {
          color: #111827;
          font-weight: 600;
        }

        .policy-content a {
          color: #2563eb;
          text-decoration: underline;
        }

        .policy-content a:hover {
          color: #1d4ed8;
        }

        .policy-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }

        .policy-content th,
        .policy-content td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }

        .policy-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        .policy-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
