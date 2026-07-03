"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../components/footer/page';
import PolicyService from '../services/policyService';
import { POLICY_PAGES } from '../components/policyPage/page';

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

export default function PoliciesLandingPage() {
  const [policies, setPolicies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllPolicies();
  }, []);

  const fetchAllPolicies = async () => {
    try {
      setLoading(true);
      const data = await PolicyService.getAllActivePolicies();

      if (data.success) {
        setPolicies(data.data);
      } else {
        setError(data.message || 'Failed to fetch policies');
      }
    } catch (err) {
      console.error('Fetch policies error:', err);
      setError('An error occurred while fetching policies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="py-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Legal Policies
            </h1>
            <p className="text-gray-600 text-lg">
              Please read our policies carefully before using our services
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading policies...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Policies</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAllPolicies}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {POLICY_PAGES.map((p) => {
                const policy = policies[p.type];
                return (
                  <Link
                    key={p.type}
                    href={p.href}
                    className="bg-white rounded-2xl p-6 border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{p.icon}</span>
                      <h3 className="font-semibold text-gray-900">{p.label}</h3>
                    </div>

                    {policy ? (
                      <>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Version</p>
                          <p className="font-medium text-gray-900">{policy.version}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Effective Date</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(policy.effectiveDate)}</p>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          policy.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.isActive ? '✓ Active' : 'Inactive'}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">Not available</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
