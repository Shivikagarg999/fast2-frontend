"use client";

import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/gmkart-captain-logo.png';
import DeliverHeader from '../components/DeliverHeader';
import DeliverFooter from '../components/DeliverFooter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/proxy';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  aadharFront: null,
  aadharBack: null,
  panCard: null,
  drivingLicense: null,
  rcDocument: null,
  insurance: null,
  bankProof: null
};
const initialPreviews = {
  aadharFront: null,
  aadharBack: null,
  panCard: null,
  drivingLicense: null,
  rcDocument: null,
  insurance: null,
  bankProof: null
};

const DOCUMENTS = [
  { field: 'aadharFront', label: 'Aadhaar Front' },
  { field: 'aadharBack', label: 'Aadhaar Back' },
  { field: 'panCard', label: 'PAN Card' },
  { field: 'drivingLicense', label: 'Driving Licence' },
  { field: 'rcDocument', label: 'Vehicle RC' },
  { field: 'insurance', label: 'Insurance' },
  { field: 'bankProof', label: 'Bank Passbook / Cheque' }
];

export default function DriverRegisterPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [previews, setPreviews] = useState(initialPreviews);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setStatusMessage({ type: '', text: '' });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please upload image files only.'
      });
      e.target.value = '';
      return;
    }

    if (file) {
      setStatusMessage({ type: '', text: '' });
      setFormData({
        ...formData,
        [field]: file
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({
          ...previews,
          [field]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatusMessage({ type: '', text: '' });

    if (
      !formData.aadharFront ||
      !formData.aadharBack ||
      !formData.panCard ||
      !formData.drivingLicense ||
      !formData.rcDocument ||
      !formData.insurance ||
      !formData.bankProof
    ) {
      setStatusMessage({
        type: 'error',
        text: 'Please upload all required documents: Aadhaar front, Aadhaar back, PAN card, Driving Licence, Vehicle RC, Insurance and Bank Passbook/Cheque.'
      });
      return;
    }

    if (formData.password.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.'
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('aadharFront', formData.aadharFront);
      formDataToSend.append('aadharBack', formData.aadharBack);
      formDataToSend.append('panCard', formData.panCard);
      formDataToSend.append('drivingLicense', formData.drivingLicense);
      formDataToSend.append('rcDocument', formData.rcDocument);
      formDataToSend.append('insurance', formData.insurance);
      formDataToSend.append('bankProof', formData.bankProof);

      const response = await fetch(`${API_BASE_URL}/api/driver/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setStatusMessage({
        type: 'success',
        text: 'Registration successful. Download the GMKart Captain app from Google Play to continue.'
      });
      setFormData(initialFormData);
      setPreviews(initialPreviews);
      formEl?.reset();
    } catch (error) {
      console.error('Registration error:', error);
      setStatusMessage({
        type: 'error',
        text: error.message || 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DeliverHeader />

      <section className="bg-[#f7f6f4] py-16 sm:py-20 px-6 sm:px-12 flex-1">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[#eceae6] p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <Image src={Logo} alt="GMKart Captain" width={56} height={56} className="rounded-lg object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-[#14181c]">Partner Registration</h1>
              <p className="text-[#5a5f66]">Start your journey with GMKart Captain</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[#14181c] font-semibold mb-3">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#C9491D] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-gray-800 placeholder-gray-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-[#14181c] font-semibold mb-3">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#C9491D] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-gray-800 placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[#14181c] font-semibold mb-3">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#C9491D] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-gray-800 placeholder-gray-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <label className="block text-[#14181c] font-semibold mb-3">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#C9491D] focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-gray-800 placeholder-gray-500"
                    placeholder="Create a strong password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#14181c] mb-4">Document Upload</h3>
              <p className="text-[#5a5f66] mb-6">Upload clear photos of your documents for verification</p>

              <div className="grid md:grid-cols-3 gap-4">
                {DOCUMENTS.map((doc) => {
                  const inputId = `driver-${doc.field}`;

                  return (
                    <div key={doc.field}>
                      <span className="block text-[#14181c] font-semibold mb-3">{doc.label} *</span>
                      <input
                        id={inputId}
                        name={doc.field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, doc.field)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={inputId}
                        className="block border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#C9491D] focus-within:border-[#C9491D] transition-all cursor-pointer h-32 group"
                      >
                        {previews[doc.field] ? (
                          <img src={previews[doc.field]} alt={doc.label} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center h-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-orange-100 transition-colors">
                              <svg className="w-6 h-6 text-[#C9491D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Upload {doc.label.split(' ')[0]}</p>
                          </div>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {statusMessage.text && (
              <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9491D] text-white font-bold py-4 rounded-xl hover:bg-[#b03e18] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Registration...
                </span>
              ) : (
                'Complete Registration & Start Earning'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </section>

      <DeliverFooter />
    </div>
  );
}
