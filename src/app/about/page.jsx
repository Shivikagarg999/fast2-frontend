"use client";
import { useState } from 'react';
import Image from 'next/image';
import { 
  ClockIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Footer from '@/app/components/footer/page';

const features = [
  {
    name: '10-Minute Delivery',
    description: 'Get your groceries delivered to your doorstep in just 10 minutes with our hyper-local delivery network.',
    icon: ClockIcon,
  },
  {
    name: 'Fresh & Quality Products',
    description: 'We source directly from trusted suppliers and local vendors to ensure the highest quality products.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Wide Selection',
    description: 'Choose from thousands of products across categories including groceries, snacks, beverages, and more.',
    icon: TruckIcon,
  },
  {
    name: 'Easy Returns',
    description: 'Not satisfied with a product? We offer hassle-free returns and refunds within 24 hours.',
    icon: ArrowPathIcon,
  },
];

const values = [
  {
    name: 'Customer First',
    description: 'Our customers are at the heart of everything we do. We listen, adapt, and prioritize your needs above all else.',
    icon: SparklesIcon,
  },
  {
    name: 'Speed & Efficiency',
    description: 'We value your time and strive to deliver faster than anyone else while maintaining the highest quality standards.',
    icon: ClockIcon,
  },
  {
    name: 'Quality Assurance',
    description: 'We never compromise on the quality of our products and services. Every item is carefully selected and checked.',
    icon: ShieldCheckIcon,
  },
];

export default function About() {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <div className="pt-10 px-4 sm:px-6 lg:px-8 lg:pt-16 lg:pr-0">
                <div className="lg:self-center">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                    About <span className="block text-yellow-400">Fast2</span>
                  </h1>
                  <p className="mt-5 text-xl text-blue-100 max-w-xl">
                    Revolutionizing grocery delivery with speed, convenience, and reliability. 
                    We're on a mission to make your life easier, one delivery at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full relative">
              <Image
                src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Fast delivery"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Intro Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Welcome to Fast2</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A New Era of Grocery Delivery
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                We're excited to launch Fast2, bringing you the fastest grocery delivery service in your neighborhood. 
                Our mission is simple: to save you time and make grocery shopping effortless.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Why Choose Us</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A better way to shop for groceries
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                We combine technology with a passion for customer service to deliver an exceptional shopping experience.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                      <p className="mt-2 text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Tabs */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Purpose</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Driving innovation in grocery delivery
              </p>
            </div>

            <div className="mt-12 max-w-3xl mx-auto">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'mission'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Our Mission
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'vision'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Our Vision
                </button>
                <button
                  onClick={() => setActiveTab('values')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'values'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Our Values
                </button>
              </div>

              <div className="mt-8">
                {activeTab === 'mission' && (
                  <div className="prose prose-lg text-gray-500">
                    <p>
                      Our mission is to revolutionize the way India shops for daily essentials by providing 
                      instant access to a wide range of high-quality products at competitive prices. We strive 
                      to save our customers time and effort while ensuring freshness and convenience.
                    </p>
                    <p className="mt-4">
                      Through our technology-driven platform and dedicated delivery network, we aim to make 
                      grocery shopping a seamless experience for every household.
                    </p>
                  </div>
                )}
                {activeTab === 'vision' && (
                  <div className="prose prose-lg text-gray-500">
                    <p>
                      We envision a future where no one has to worry about grocery shopping or waiting in long 
                      queues. Our vision is to become India's most trusted and preferred quick commerce platform, 
                      serving millions of customers with speed, reliability, and excellence.
                    </p>
                    <p className="mt-4">
                      We aim to expand our services to every corner of the country, creating employment 
                      opportunities and contributing to the digital transformation of retail in India.
                    </p>
                  </div>
                )}
                {activeTab === 'values' && (
                  <div className="grid gap-8 md:grid-cols-3 mt-6">
                    {values.map((value) => (
                      <div key={value.name} className="text-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                          <value.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">{value.name}</h3>
                        <p className="mt-2 text-gray-500 text-sm">{value.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-blue-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to experience instant delivery?</span>
              <span className="block text-yellow-400">Start shopping now.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Start Shopping
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