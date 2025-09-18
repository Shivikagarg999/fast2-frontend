"use client"

import { useState } from 'react';
import Head from 'next/head';
import Footer from '../components/footer/page';

export default function DeliveryPartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    vehicle: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Application submitted! We will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      <Head>
        <title>Become a Delivery Partner | Fast2</title>
        <meta name="description" content="Join as a delivery partner and earn competitive pay with flexible schedules" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="relative gradient-bg text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Earn on your <span className="text-blue-200">own terms</span></h1>
            <p className="text-xl mb-8">Join as a delivery partner and earn competitive pay with flexible schedules.</p>
            <div className="flex flex-col space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Flexible hours</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Weekly payments</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Instant withdrawals</span>
              </div>
            </div>
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-50 transition duration-300 transform hover:-translate-y-1">
              Start Earning Today
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-blue-500 rounded-2xl transform rotate-3 opacity-30"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Join as Delivery Partner</h3>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="city">City</label>
                    <select 
                      id="city" 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    >
                      <option value="">Select your city</option>
                      <option value="delhi">Delhi</option>
                      <option value="mumbai">Mumbai</option>
                      <option value="bangalore">Bangalore</option>
                      <option value="hyderabad">Hyderabad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="vehicle">Vehicle Type</label>
                    <select 
                      id="vehicle" 
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    >
                      <option value="">Select vehicle</option>
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="bicycle">Bicycle</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1 shadow-lg">
                    Apply Now
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-4">
                    By signing up, I agree to the Terms & Conditions
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Why Deliver With Us?</h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">We provide the best earning opportunities and support for our delivery partners</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl text-center card-hover border border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Great Earnings</h3>
              <p className="text-gray-600">Earn competitive rates for each delivery with additional incentives during peak hours.</p>
              <div className="mt-6 bg-blue-100 text-blue-700 py-2 px-4 rounded-full inline-block text-sm font-medium">
                Up to ₹1,500 per day
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl text-center card-hover border border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Schedule</h3>
              <p className="text-gray-600">You're your own boss. Work whenever you want, for as long as you want.</p>
              <div className="mt-6 bg-blue-100 text-blue-700 py-2 px-4 rounded-full inline-block text-sm font-medium">
                Choose your hours
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl text-center card-hover border border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Insurance Coverage</h3>
              <p className="text-gray-600">We provide accidental insurance coverage for all our delivery partners.</p>
              <div className="mt-6 bg-blue-100 text-blue-700 py-2 px-4 rounded-full inline-block text-sm font-medium">
                ₹5 Lakh coverage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">How It Works</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">Start earning in just 3 simple steps</p>
          
          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="relative flex-1 text-center mb-16 md:mb-0 step-connector">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">1</div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
                <h3 className="text-xl font-semibold mb-3">Sign Up</h3>
                <p className="text-gray-600">Complete the application form with your details</p>
              </div>
            </div>
            
            <div className="relative flex-1 text-center mb-16 md:mb-0 step-connector">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">2</div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
                <h3 className="text-xl font-semibold mb-3">Verify</h3>
                <p className="text-gray-600">Submit required documents for verification</p>
              </div>
            </div>
            
            <div className="relative flex-1 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">3</div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
                <h3 className="text-xl font-semibold mb-3">Start Delivering</h3>
                <p className="text-gray-600">Get the app, accept orders, and start earning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">What Our Partners Say</h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">Hear from our delivery partners about their experience</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl testimonial-card border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-5 flex items-center justify-center text-white font-bold text-lg">RS</div>
                <div>
                  <h4 className="font-semibold text-lg">Rahul Sharma</h4>
                  <p className="text-gray-600">Delivery Partner since 2021</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">"The flexibility is amazing. I can work around my college schedule and still make enough to cover my expenses. The weekly payments are always on time."</p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl testimonial-card border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-5 flex items-center justify-center text-white font-bold text-lg">VS</div>
                <div>
                  <h4 className="font-semibold text-lg">Vikram Singh</h4>
                  <p className="text-gray-600">Delivery Partner since 2020</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">"I've been delivering with Fast2 for over two years now. The earnings have allowed me to support my family and even save for the future."</p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay animate-float"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white rounded-full mix-blend-overlay animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of delivery partners who are earning money on their own schedule.</p>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-50 transition duration-300 transform hover:-translate-y-1">
            Apply Now
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">Get answers to common questions about becoming a delivery partner</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-3">How much can I earn as a delivery partner?</h3>
              <p className="text-gray-600">Our delivery partners typically earn between ₹800 to ₹1,500 per day, depending on hours worked and order volume.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-3">What documents do I need to apply?</h3>
              <p className="text-gray-600">You'll need a valid ID proof, address proof, and vehicle documents to complete the verification process.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-3">How flexible are the working hours?</h3>
              <p className="text-gray-600">You can choose your own working hours. Work full-time, part-time, or just during peak hours - it's completely up to you.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-3">How often will I get paid?</h3>
              <p className="text-gray-600">We process payments weekly. You can also make instant withdrawals for a small fee whenever you need access to your earnings.</p>
            </div>
          </div>
        </div>
      </section>

    <Footer/>
    </div>
  );
}