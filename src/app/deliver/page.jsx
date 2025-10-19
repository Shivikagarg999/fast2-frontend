"use client";

import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/logo.png';

export default function DeliveryPartnerPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    aadharFront: null,
    aadharBack: null,
    panCard: null
  });
  
  const [previews, setPreviews] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
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
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('aadharFront', formData.aadharFront);
      formDataToSend.append('aadharBack', formData.aadharBack);
      formDataToSend.append('panCard', formData.panCard);

      const response = await fetch('https://api.fast2.in/api/driver/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please check your email for further instructions.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          aadharFront: null,
          aadharBack: null,
          panCard: null
        });
        setPreviews({
          aadharFront: null,
          aadharBack: null,
          panCard: null
        });
      } else {
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl flex items-center justify-center">
                <Image 
                  src={Logo} 
                  alt="Fast2" 
                  width={80} 
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Partner Login
            </button>
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
                <div className=" rounded-lg flex items-center justify-center">
                  <Image 
                    src={Logo} 
                    alt="Fast2" 
                    width={50} 
                    height={50}
                    className=" object-contain"
                  />
                </div>
                <span className="text-white font-semibold text-sm">India's Newest Delivery Network</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Start <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">Earning</span> with Fast2
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join India's newest and most innovative delivery partner network. Earn competitive pay with complete flexibility and weekly settlements.
            </p>
            
            {/* Earnings Focus */}
            <div className="grid grid-cols-1 gap-6 mb-12 max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-2xl font-bold text-white mb-2">₹1,200-1,800</div>
                <div className="text-blue-100 text-sm">Potential Daily Earnings</div>
              </div>
            </div>
            
            {!showRegistration ? (
              <div className="space-y-6">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="group bg-white text-blue-600 px-14 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                >
                  <span className="flex items-center justify-center">
                    Start Registration
                    <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                <p className="text-blue-200 text-sm font-medium">
                  Complete your application in just 2 minutes • No upfront costs
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
                        width={100} 
                        height={100}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Partner Registration</h2>
                      <p className="text-gray-600">Start your journey with Fast2 Delivery</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-500"
                          placeholder="Create a strong password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Upload</h3>
                    <p className="text-gray-600 mb-6">Upload clear photos of your documents for verification</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { field: 'aadharFront', label: 'Aadhar Front' },
                        { field: 'aadharBack', label: 'Aadhar Back' },
                        { field: 'panCard', label: 'PAN Card' }
                      ].map((doc, index) => (
                        <div key={index}>
                          <label className="block text-gray-700 font-semibold mb-3">{doc.label} *</label>
                          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer h-32 group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, doc.field)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              required
                            />
                            {previews[doc.field] ? (
                              <img src={previews[doc.field]} alt={doc.label} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <div className="text-center h-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">Upload {doc.label.split(' ')[0]}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-blue-200/50 mb-8">
              <div className="rounded-lg flex items-center justify-center mr-3">
                <Image 
                  src={Logo} 
                  alt="Fast2" 
                  width={100} 
                  height={100}
                />
              </div>
              <span className="text-blue-600 font-semibold">Why Choose Fast2?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Be Among Our <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">First Partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our launch team and enjoy exclusive benefits as we build India's next-generation delivery network together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ),
                title: "Maximum Earnings",
                description: "Competitive daily earnings with special launch bonuses and incentive programs for our first partners",
                highlight: "Launch special bonuses",
                gradient: "from-green-500 to-emerald-600",
                bgColor: "bg-gradient-to-br from-green-500 to-emerald-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ),
                title: "Complete Flexibility",
                description: "Work whenever you want - full time, part time, or weekends. Perfect for students and earners",
                highlight: "24/7 availability",
                gradient: "from-blue-500 to-blue-600",
                bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                ),
                title: "Weekly Payments",
                description: "Get paid every week without delays. Direct bank transfers processed every Monday morning",
                highlight: "No payment delays",
                gradient: "from-purple-500 to-purple-600",
                bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                ),
                title: "Priority Support",
                description: "As a launch partner, get dedicated priority support and direct access to our team",
                highlight: "Founder-level support",
                gradient: "from-orange-500 to-red-500",
                bgColor: "bg-gradient-to-br from-orange-500 to-red-500"
              }
            ].map((benefit, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:scale-[1.02]">
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-lg">
                  {benefit.description}
                </p>
                <div className={`inline-block bg-gradient-to-r ${benefit.gradient} text-white px-4 py-2 rounded-xl font-semibold text-sm`}>
                  {benefit.highlight}
                </div>
              </div>
            ))}
          </div>

          {/* Launch Benefits */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Launch Partner Benefits</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be among the first to join and enjoy exclusive launch benefits
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Higher Commissions</div>
                <div className="text-blue-200">Special rates for our first 100 partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Priority Zones</div>
                <div className="text-blue-200">Access to premium delivery areas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Growth Opportunities</div>
                <div className="text-blue-200">Be part of our expansion story</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Left Content */}
            <div className="lg:w-1/2">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Get started with the Fast2 Partner app
                </h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant order alerts</h3>
                      <p className="text-gray-600">Get real-time delivery requests based on your location and preferences</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart navigation</h3>
                      <p className="text-gray-600">Built-in maps with optimized routes to save time and increase deliveries</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Earnings tracker</h3>
                      <p className="text-gray-600">Monitor your daily and weekly earnings, incentives, and performance metrics</p>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="mt-12">
                  <p className="text-gray-600 text-lg mb-6">Download the partner app to get started</p>
                  <div className="flex flex-wrap gap-4">
                    <a href="#" className="inline-flex items-center bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors">
                      <svg className="w-7 h-7 mr-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs opacity-80">GET IT ON</div>
                        <div className="text-lg font-semibold">Google Play</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-[600px] bg-gray-900 rounded-[48px] p-4 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[40px] overflow-hidden border-8 border-gray-900">
                    {/* App Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-bold text-lg flex items-center">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                            <Image 
                              src={Logo} 
                              alt="Fast2" 
                              width={14} 
                              height={14}
                              className="w-3.5 h-3.5 object-contain filter brightness-0 invert"
                            />
                          </div>
                          Fast2 Partner
                        </div>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Online</div>
                      </div>
                      <div className="text-3xl font-bold">₹1,240 earned</div>
                      <div className="text-blue-100">Today • 12 deliveries</div>
                    </div>

                    {/* Current Delivery */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600 font-medium">Active delivery</span>
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">In progress</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Grocery delivery</div>
                          <div className="text-sm text-gray-500">2.3 km • 18 mins remaining</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">₹85</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="p-6 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">8</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">4</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="p-6">
                      <div className="font-semibold text-gray-900 mb-4">Recent deliveries</div>
                      <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Order #{2800 + item}</div>
                                <div className="text-xs text-gray-500">{30 + item * 5} mins ago</div>
                              </div>
                            </div>
                            <div className="font-semibold text-gray-900">₹{65 + item * 5}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  width={100} 
                  height={100}
                />
              </div>
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