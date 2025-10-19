"use client";

import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/logo.png';

export default function WarehousePartnerPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    city: '',
    state: '',
    highestEducation: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://api.fast2.in/api/warehouse/job-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Application submitted successfully! Our team will contact you within 24 hours.');
        setFormData({
          fullName: '',
          phoneNumber: '',
          city: '',
          state: '',
          highestEducation: ''
        });
      } else {
        alert(data.message || 'Application failed. Please try again.');
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl flex items-center justify-center">
                <Image 
                  src={Logo} 
                  alt="Fast2" 
                  width={100} 
                  height={100}
                />
              </div>
            </div>
           
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Fast2 Warehouse
              </span>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo and Badge */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-flex items-center space-x-3 border border-white/30">
                <div className="rounded-lg flex items-center justify-center">
                  <Image 
                    src={Logo} 
                    alt="Fast2" 
                    width={50} 
                    height={50}
                  />
                </div>
                <span className="text-white font-semibold text-sm">Join India's Fast-Growing Warehouse Team</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Come Bring <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">Orders to Life</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our team and be part of India's fastest-growing logistics network.
            </p>
            
            {!showRegistration ? (
              <div className="space-y-6">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="group bg-white text-blue-600 px-14 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                >
                  <span className="flex items-center justify-center">
                    Apply Now
                    <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                <p className="text-blue-200 text-sm font-medium">
                  Complete your application in just 2 minutes • Immediate openings available
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-2xl mx-auto transform hover:scale-[1.02] transition-transform duration-300">
                <div className="text-left mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="rounded-xl flex items-center justify-center">
                      <Image 
                        src={Logo} 
                        alt="Fast2" 
                        width={80} 
                        height={80}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Warehouse Job Application</h2>
                      <p className="text-gray-600">Start your career with Fast2 Warehouse</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 mb-8">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Your Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Phone Number *</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-3">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                          placeholder="Enter your city"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-3">State *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800"
                          required
                        >
                          <option value="">Select your state</option>
                          <option value="andhra-pradesh">Andhra Pradesh</option>
                          <option value="bihar">Bihar</option>
                          <option value="delhi">Delhi</option>
                          <option value="gujarat">Gujarat</option>
                          <option value="haryana">Haryana</option>
                          <option value="karnataka">Karnataka</option>
                          <option value="maharashtra">Maharashtra</option>
                          <option value="punjab">Punjab</option>
                          <option value="tamil-nadu">Tamil Nadu</option>
                          <option value="telangana">Telangana</option>
                          <option value="uttar-pradesh">Uttar Pradesh</option>
                          <option value="west-bengal">West Bengal</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Highest Education *</label>
                      <select
                        name="highestEducation"
                        value={formData.highestEducation}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800"
                        required
                      >
                        <option value="">Select highest education</option>
                        <option value="10th">10th Pass</option>
                        <option value="12th">12th Pass</option>
                        <option value="diploma">Diploma</option>
                        <option value="graduate">Graduate</option>
                        <option value="post-graduate">Post Graduate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Application...
                      </span>
                    ) : (
                      'Submit Application & Start Earning'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By applying, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Get answers to common questions about working at Fast2 Warehouse</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "What are the job responsibilities in the warehouse?",
                answer: "Your main responsibilities will include order picking, packing, inventory management, loading/unloading goods, and maintaining warehouse cleanliness and organization."
              },
              {
                question: "What are the working hours and shifts available?",
                answer: "We offer flexible shifts: Morning (8 AM - 4 PM), Evening (4 PM - 12 AM), and Night (12 AM - 8 AM). You can choose the shift that works best for you."
              },
              {
                question: "Is there any experience required?",
                answer: "No prior warehouse experience is required. We provide complete training to all new team members. Basic education and willingness to learn are all you need."
              },
              {
                question: "How and when will I get paid?",
                answer: "We process payments every week directly to your bank account. Salaries are paid every Friday for the previous week's work."
              },
              {
                question: "What is the selection process?",
                answer: "The process is simple: 1) Submit your application, 2) Quick phone interview, 3) Document verification, 4) Job offer and onboarding. The entire process takes 2-3 days."
              },
              {
                question: "Are there opportunities for career growth?",
                answer: "Yes! We regularly promote from within. You can grow from Warehouse Associate to Team Lead, Supervisor, and even Warehouse Manager based on performance."
              },
              {
                question: "What facilities are provided at the warehouse?",
                answer: "We provide safe working conditions, drinking water, rest areas, safety equipment, and clean washroom facilities. Some locations also provide meal facilities."
              },
              {
                question: "Is transportation provided?",
                answer: "While we don't provide transportation, our warehouses are located near public transport routes. We also offer shift allowance to help cover travel costs."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="rounded-xl flex items-center justify-center">
                <Image 
                  src={Logo} 
                  alt="Fast2" 
                  width={80} 
                  height={80}
                />
              </div>
              <span className="text-2xl font-bold text-white">Fast2 Warehouse</span>
            </div>
            
            <div className="flex space-x-8 text-gray-400">
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Help</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Fast2. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}