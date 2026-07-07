"use client";

import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/logo.png';
import Footer from '../components/footer/page';

export default function PromoterPartnerPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    city: '',
    state: '',
    experience: '',
    businessType: ''
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
      const response = await fetch('/proxy/api/promoter/partner-application', {
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
          experience: '',
          businessType: ''
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

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-400/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo and Badge */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-flex items-center space-x-3 border border-white/30">
                <div className="rounded-lg flex items-center justify-center">
                  <Image 
                    src={Logo} 
                    alt="GMKart" 
                    width={50} 
                    height={50}
                  />
                </div>
                <span className="text-white font-semibold text-sm">Join India's Fast-Growing Partner Network</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Become a <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">Growth Partner</span>
            </h1>
            <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our promoter network and earn lucrative commissions while helping businesses grow.
            </p>
            
            {!showRegistration ? (
              <div className="space-y-6">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="group bg-white text-green-600 px-14 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                >
                  <span className="flex items-center justify-center">
                    Apply Now
                    <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                <p className="text-green-200 text-sm font-medium">
                  Complete your application in just 2 minutes • High commission structure
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-2xl mx-auto transform hover:scale-[1.02] transition-transform duration-300">
                <div className="text-left mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="rounded-xl flex items-center justify-center">
                      <Image 
                        src={Logo} 
                        alt="GMKart" 
                        width={80} 
                        height={80}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Promoter Partner Application</h2>
                      <p className="text-gray-600">Start your partnership with GMKart</p>
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
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-gray-800 placeholder-gray-500"
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
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-gray-800 placeholder-gray-500"
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
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-gray-800 placeholder-gray-500"
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
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-gray-800"
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-3">Sales Experience *</label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-gray-800"
                          required
                        >
                          <option value="">Select experience</option>
                          <option value="none">No Experience</option>
                          <option value="0-1">0-1 Years</option>
                          <option value="1-3">1-3 Years</option>
                          <option value="3-5">3-5 Years</option>
                          <option value="5+">5+ Years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-3">Business Type *</label>
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all text-gray-800"
                          required
                        >
                          <option value="">Select business type</option>
                          <option value="individual">Individual</option>
                          <option value="agency">Agency</option>
                          <option value="corporate">Corporate Partner</option>
                          <option value="distributor">Distributor</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
                      'Submit Application & Start Partnering'
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

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Become a GMKart Partner?</h2>
            <p className="text-gray-600 text-lg">Unlock exceptional benefits and growth opportunities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "💰",
                title: "High Commissions",
                description: "Earn industry-leading commissions with transparent payout structure and regular bonuses"
              },
              {
                icon: "🚀",
                title: "Growth Support",
                description: "Get dedicated marketing support, training materials, and sales tools to help you succeed"
              },
              {
                icon: "🌐",
                title: "Pan-India Network",
                description: "Access our nationwide client base and expand your business across multiple regions"
              },
              {
                icon: "⚡",
                title: "Quick Onboarding",
                description: "Start earning within days with our streamlined onboarding and training process"
              },
              {
                icon: "🛡️",
                title: "Exclusive Territories",
                description: "Get exclusive rights to specific territories with protected business opportunities"
              },
              {
                icon: "📈",
                title: "Performance Rewards",
                description: "Additional incentives, international trips, and recognition for top performers"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Get answers to common questions about our Partner Program</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "What does a GMKart Promoter Partner do?",
                answer: "As a promoter partner, you'll help businesses onboard onto our platform, promote our services, generate leads, and build long-term client relationships while earning attractive commissions."
              },
              {
                question: "What commission structure do you offer?",
                answer: "We offer a competitive commission structure with percentage-based earnings on all successful referrals, plus performance bonuses, override commissions, and special incentives for achieving targets."
              },
              {
                question: "Is there any investment required?",
                answer: "No upfront investment is required. We provide all necessary training, marketing materials, and support. You just need a smartphone and internet connection to get started."
              },
              {
                question: "How and when will I get paid?",
                answer: "Commissions are processed monthly directly to your bank account. We provide detailed performance reports and transparent tracking of all your earnings."
              },
              {
                question: "What support will I receive?",
                answer: "You'll receive comprehensive training, marketing collateral, CRM access, dedicated account manager support, and regular updates on new products and promotions."
              },
              {
                question: "Can I work part-time as a promoter partner?",
                answer: "Yes! Many of our partners start part-time and gradually scale up. We offer flexible working hours that you can manage alongside your current commitments."
              },
              {
                question: "Are there opportunities for career growth?",
                answer: "Absolutely! Successful partners can grow to become Area Managers, Regional Heads, or even start their own distribution agencies with our support."
              },
              {
                question: "What are the eligibility criteria?",
                answer: "We look for individuals with good communication skills, basic smartphone knowledge, and a passion for sales. Prior experience is beneficial but not mandatory."
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

    <Footer/>
    </div>
  );
}