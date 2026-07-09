"use client";
import { useState } from 'react';
import Image from 'next/image';
import {
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  UserCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  LightBulbIcon,
  HeartIcon,
  RocketLaunchIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Footer from '@/app/components/footer/page';

const coreValues = [
  {
    name: 'Customer First',
    description: 'Every decision begins with the customer.',
    icon: HeartIcon,
  },
  {
    name: 'Trust & Integrity',
    description: 'Building lasting relationships through transparency, accountability, and reliability.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Innovation',
    description: 'Continuously improving products, services, and technology.',
    icon: LightBulbIcon,
  },
  {
    name: 'Quality',
    description: 'Delivering products and experiences customers can trust.',
    icon: SparklesIcon,
  },
  {
    name: 'Empowering Local Businesses',
    description: 'Enabling neighborhood retailers to succeed in the digital economy.',
    icon: BuildingOffice2Icon,
  },
  {
    name: 'Excellence',
    description: 'Pursuing the highest standards in operations, technology, and customer service.',
    icon: StarIcon,
  },
];

const whyChoose = [
  { text: 'Technology-powered Quick Commerce platform', icon: BoltIcon },
  { text: 'Trusted local retailers and verified sellers', icon: ShieldCheckIcon },
  { text: 'Wide selection of groceries and everyday essentials', icon: ArrowPathIcon },
  { text: 'Live order tracking with real-time updates', icon: TruckIcon },
  { text: 'Secure online payment options', icon: CheckCircleIcon },
  { text: 'Website live chat support', icon: ChatBubbleLeftRightIcon },
  { text: 'Transparent pricing and exclusive offers', icon: SparklesIcon },
  { text: 'Reliable order fulfillment', icon: RocketLaunchIcon },
  { text: 'Dedicated customer support', icon: UserCircleIcon },
  { text: 'Safe, seamless, and customer-focused shopping experience', icon: HeartIcon },
];

export default function About() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-600 to-green-800 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <div className="pt-10 px-4 sm:px-6 lg:px-8 lg:pt-16 lg:pr-0">
                <div className="lg:self-center">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                    About <span className="block text-yellow-400">GMKART</span>
                  </h1>
                  <p className="mt-5 text-xl text-green-100 max-w-xl">
                    A technology-driven Quick Commerce platform redefining how India shops for everyday essentials.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <a
                      href="/"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                    >
                      Start Shopping
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full relative">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="GMKART e-commerce platform"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
              <div className="flex space-x-1 rounded-xl bg-green-900/10 p-1">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-2.5 px-6 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'about'
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  About Us
                </button>
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`py-2.5 px-6 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'mission'
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Mission & Vision
                </button>
                <button
                  onClick={() => setActiveTab('corporate')}
                  className={`py-2.5 px-6 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'corporate'
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Corporate Info
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-12">

              {/* About Us Tab */}
              {activeTab === 'about' && (
                <div className="space-y-12">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-8 text-center">
                      About GMKART
                    </h2>

                    <div className="prose prose-lg text-gray-700 space-y-6">
                      <p className="text-lg leading-relaxed">
                        GMKART is a technology-driven Quick Commerce (Q-Commerce) platform operated by <strong>Fast2market Digital Solutions</strong>, built to redefine how India shops for everyday essentials. By combining advanced technology with a trusted network of local retailers, GMKART delivers a fast, seamless, and reliable shopping experience that brings convenience closer to every home.
                      </p>
                      <p className="text-lg leading-relaxed">
                        We are building a digital ecosystem where customers can effortlessly access groceries, fresh fruits and vegetables, dairy products, beverages, household essentials, personal care products, and other daily necessities through one secure and easy-to-use platform. Every interaction is designed to be simple, transparent, and dependable.
                      </p>
                      <p className="text-lg leading-relaxed">
                        At GMKART, we believe the future of retail belongs to local businesses empowered by technology. Our platform enables neighborhood retailers to embrace digital commerce, expand their customer reach, improve operational efficiency, and grow sustainably in an increasingly connected economy. As our partners grow, the communities they serve become stronger.
                      </p>
                      <p className="text-lg leading-relaxed">
                        Driven by innovation and customer satisfaction, GMKART offers a comprehensive shopping experience with live order tracking, real-time order notifications, secure online payments, transparent pricing, website live chat support, and reliable order fulfillment. Every feature is built with a single purpose—to deliver exceptional convenience while maintaining the highest standards of quality, security, and service.
                      </p>
                    </div>

                    {/* Tagline */}
                    <div className="mt-10 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-center">
                      <p className="text-xl font-semibold text-white italic">
                        "GMKART – Empowering Local Stores. Delivering Everyday Convenience."
                      </p>
                    </div>
                  </div>

                  {/* Why Choose GMKART */}
                  <div className="max-w-4xl mx-auto mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                      Why Choose GMKART?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {whyChoose.map((item) => (
                        <div key={item.text} className="flex items-start space-x-4 bg-green-50 rounded-xl p-4 border border-green-100">
                          <div className="flex-shrink-0">
                            <div className="h-9 w-9 rounded-lg bg-green-600 flex items-center justify-center">
                              <item.icon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <p className="text-gray-700 font-medium pt-1">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mission & Vision Tab */}
              {activeTab === 'mission' && (
                <div className="space-y-12">
                  <div className="max-w-4xl mx-auto">
                    {/* Mission Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 mb-10 border border-green-200">
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <RocketLaunchIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-2xl font-bold text-green-900">Our Mission</h3>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed text-gray-700">
                        To build India's most trusted Quick Commerce (Q-Commerce) platform by empowering local retailers with innovative technology and delivering everyday essentials through a fast, secure, reliable, and customer-centric shopping experience.
                      </p>
                    </div>

                    {/* Vision Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 mb-12 border border-green-200">
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <SparklesIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-2xl font-bold text-green-900">Our Vision</h3>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed text-gray-700">
                        To become India's leading Quick Commerce platform by creating a connected digital ecosystem where local businesses thrive, customers enjoy effortless shopping, and technology drives inclusive and sustainable growth.
                      </p>
                    </div>

                    {/* Core Values */}
                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
                        Our Core Values
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coreValues.map((value) => (
                          <div key={value.name} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                            <div className="flex justify-center mb-4">
                              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                                <value.icon className="h-7 w-7 text-white" />
                              </div>
                            </div>
                            <h4 className="text-lg font-semibold text-center text-gray-900 mb-3">
                              {value.name}
                            </h4>
                            <p className="text-sm text-gray-600 text-center">
                              {value.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Closing statement */}
                    <div className="mt-12 bg-gradient-to-r from-green-50 to-indigo-50 rounded-2xl p-8">
                      <p className="text-lg text-gray-700 leading-relaxed text-center">
                        At GMKART, we are building more than a shopping platform—we are shaping the future of neighborhood commerce. By connecting technology with trusted local retailers, we create lasting value for customers, empower businesses to grow, and strengthen the communities they serve.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Corporate Info Tab */}
              {activeTab === 'corporate' && (
                <div className="space-y-12">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-10 text-center">
                      Corporate Information
                    </h2>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
                      <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
                        <h3 className="text-2xl font-bold text-white">Company Details</h3>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BuildingOffice2Icon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Brand Name</p>
                            <p className="text-lg font-semibold text-gray-900">GMKART</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Operated By</p>
                            <p className="text-lg font-semibold text-gray-900">Fast2market Digital Solutions</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Registered Office</p>
                            <p className="text-lg font-semibold text-gray-900">
                              H. No. 39, Indra Nagar Road, Near Sai Devi School,<br />
                              Morar Road, Thatipur, Gwalior,<br />
                              Madhya Pradesh – 474011, India
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <GlobeAltIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Website</p>
                            <a href="https://www.gmkart.com" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-green-700 hover:text-green-900 transition-colors">
                              www.gmkart.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Support */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
                        <h3 className="text-2xl font-bold text-white">Customer Support</h3>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <EnvelopeIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <a href="mailto:support@gmkart.com" className="text-lg font-semibold text-green-700 hover:text-green-900 transition-colors">
                              support@gmkart.com
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <PhoneIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Customer Care</p>
                            <a href="tel:+919981306588" className="text-lg font-semibold text-green-700 hover:text-green-900 transition-colors">
                              +91 99813 06588
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Experience the GMKART Difference</span>
                <span className="block text-yellow-400">Fast, Reliable, Quality Shopping</span>
              </h2>
              <p className="mt-4 text-lg text-green-100 max-w-3xl">
                Join thousands of satisfied customers who trust us for their daily shopping needs.
                Fast delivery, quality products, and exceptional service await you.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-lg shadow">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-green-700 bg-white hover:bg-green-50 transition-colors duration-300"
                >
                  Start Shopping Now
                  <BoltIcon className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
