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
  BoltIcon
} from '@heroicons/react/24/outline';
import Footer from '@/app/components/footer/page';

const features = [
  {
    name: 'Fast Delivery',
    description: 'Get your products delivered quickly with our efficient delivery network.',
    icon: ClockIcon,
  },
  {
    name: 'Quality Products',
    description: 'We deliver quality products sourced from trusted suppliers with transparency.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Wide Selection',
    description: 'Choose from a diverse range of products across multiple categories.',
    icon: TruckIcon,
  },
  {
    name: 'Hassle-Free Service',
    description: 'Enjoy a seamless shopping experience with easy returns and prompt support.',
    icon: ArrowPathIcon,
  },
];

const values = [
  {
    name: 'Customer First',
    description: 'Our customers are at the heart of everything we do. We listen, adapt, and prioritize your needs.',
    icon: HeartIcon,
  },
  {
    name: 'Speed & Efficiency',
    description: 'We value your time and deliver rapid service with the highest efficiency standards.',
    icon: BoltIcon,
  },
  {
    name: 'Trust & Quality',
    description: 'We never compromise on quality. Every product and service reflects our commitment to excellence.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Innovation',
    description: 'Continuously improving our platform to provide a better shopping experience.',
    icon: LightBulbIcon,
  },
];

const leadership = [
  {
    name: 'Smt. Meena Singh',
    role: 'Owner',
    description: 'Visionary leader guiding Fast2.in\'s growth with commitment to quality and customer satisfaction.',
    icon: SparklesIcon,
  },
  {
    name: 'Mr. Lalit Kumar',
    role: 'Platform Runner',
    description: 'Ensuring smooth operations and prompt customer support for a seamless shopping experience.',
    icon: UserCircleIcon,
  },
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
                    About <span className="block text-yellow-400">Fast2.in</span>
                  </h1>
                  <p className="mt-5 text-xl text-green-100 max-w-xl">
                    A quick e-commerce platform that makes online shopping fast, simple, and hassle-free.
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
                alt="Fast2.in e-commerce platform"
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
                  Our Mission
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`py-2.5 px-6 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'team'
                      ? 'bg-green-600 text-white shadow'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Leadership Team
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-12">
              {/* About Us Tab */}
              {activeTab === 'about' && (
                <div className="space-y-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                      Welcome to Fast2.in
                    </h2>
                    <div className="mt-6 prose prose-lg text-gray-600 mx-auto max-w-4xl">
                      <p className="text-xl leading-relaxed">
                        Fast2.in is a quick e-commerce platform that makes online shopping fast, simple, and hassle-free. 
                        We deliver quality products, rapid service, and a seamless shopping experience right to your doorstep.
                      </p>
                      
                      <div className="mt-10 bg-gradient-to-r from-green-50 to-indigo-50 rounded-2xl p-8">
                        <h3 className="text-2xl font-semibold text-green-900 mb-6">What Makes Us Different</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <RocketLaunchIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Quick Commerce</h4>
                              <p className="mt-2 text-gray-600">
                                We specialize in fast delivery without compromising on product quality or customer service.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Trust & Reliability</h4>
                              <p className="mt-2 text-gray-600">
                                Built on a foundation of trust, we ensure every transaction is secure and satisfactory.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 sm:text-4xl mb-12">
                      Our Key Features
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {features.map((feature) => (
                        <div key={feature.name} className="relative bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                          <div className="absolute -top-4 left-6 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <div className="pt-8">
                            <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                            <p className="mt-3 text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mission Tab */}
              {activeTab === 'mission' && (
                <div className="space-y-12">
                  <div className="text-center">
                    <div className="flex justify-center mb-6">
                      <LightBulbIcon className="h-16 w-16 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                      Our Mission & Vision
                    </h2>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    {/* Mission Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 mb-12 border border-green-200">
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <RocketLaunchIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-2xl font-bold text-green-900">Our Mission</h3>
                          <p className="text-green-700">Driving Purpose & Commitment</p>
                        </div>
                      </div>
                      <div className="prose prose-lg text-gray-700">
                        <p className="text-lg leading-relaxed">
                          To provide every customer with a quick, reliable, and enjoyable shopping experience, 
                          offering quality products with transparency and speed. Fast2.in is more than an online 
                          store—we are a fast, trustworthy marketplace built for today's busy shopper.
                        </p>
                      </div>
                    </div>

                    {/* Vision Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <SparklesIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-2xl font-bold text-green-900">Our Vision</h3>
                          <p className="text-green-700">Future Aspirations</p>
                        </div>
                      </div>
                      <div className="prose prose-lg text-gray-700">
                        <p className="text-lg leading-relaxed">
                          To become the most trusted quick-commerce platform in India, known for exceptional 
                          speed, unparalleled quality, and outstanding customer service. We envision creating 
                          a shopping ecosystem that saves time while enriching lives.
                        </p>
                      </div>
                    </div>

                    {/* Values Section */}
                    <div className="mt-16">
                      <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
                        Our Core Values
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value) => (
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
                  </div>
                </div>
              )}

              {/* Leadership Team Tab */}
              {activeTab === 'team' && (
                <div className="space-y-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                      Our Leadership Team
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                      Meet the dedicated individuals who drive Fast2.in's success with passion and commitment.
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="bg-gradient-to-r from-green-50 to-indigo-50 rounded-2xl p-8 mb-12">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        The platform is run by Mr. Lalit Kumar, ensuring smooth operations and prompt customer support, 
                        and owned by Smt. Meena Singh, whose vision and commitment to quality guide Fast2.in's growth. 
                        Together, they lead a team dedicated to trust, innovation, and customer satisfaction.
                      </p>
                    </div>

                    {/* Leadership Cards */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {leadership.map((person, index) => (
                        <div key={person.name} className={`rounded-2xl overflow-hidden shadow-xl ${index === 0 ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-green-50 to-cyan-50'}`}>
                          <div className="p-8">
                            <div className="flex items-center mb-6">
                              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-cyan-500'}`}>
                                <person.icon className="h-8 w-8 text-white" />
                              </div>
                              <div className="ml-6">
                                <h3 className="text-2xl font-bold text-gray-900">{person.name}</h3>
                                <p className={`text-lg font-semibold ${index === 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  {person.role}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {person.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Team Description */}
                    <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Our Dedicated Team
                      </h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                            <TruckIcon className="h-6 w-6" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Delivery Experts</h4>
                          <p className="text-sm text-gray-600 mt-2">Ensuring prompt and safe delivery</p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                            <ShieldCheckIcon className="h-6 w-6" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Quality Team</h4>
                          <p className="text-sm text-gray-600 mt-2">Maintaining product excellence</p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                            <DevicePhoneMobileIcon className="h-6 w-6" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Support Staff</h4>
                          <p className="text-sm text-gray-600 mt-2">Providing 24/7 customer assistance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact' && (
                <div id="contact" className="space-y-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                      Contact & Information
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                      Get in touch with us. We're here to help with any questions or concerns.
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="md:flex">
                        {/* Contact Details */}
                        <div className="md:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-8 text-white">
                          <h3 className="text-2xl font-bold mb-8">Contact Details</h3>
                          
                          <div className="space-y-6">
                            <div className="flex items-start">
                              <MapPinIcon className="h-6 w-6 text-green-200 mt-1 flex-shrink-0" />
                              <div className="ml-4">
                                <h4 className="font-semibold text-green-100">Address</h4>
                                <p className="mt-1 text-green-50">
                                  Indra Nagar near Sain Devin school,<br />
                                  Thatipur, Gwalior, Madhya Pradesh 474011
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <EnvelopeIcon className="h-6 w-6 text-green-200 mt-1 flex-shrink-0" />
                              <div className="ml-4">
                                <h4 className="font-semibold text-green-100">Email</h4>
                                <a href="mailto:support@fast2.in" className="mt-1 text-green-50 hover:text-yellow-300 transition-colors">
                                  support@fast2.in
                                </a>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <GlobeAltIcon className="h-6 w-6 text-green-200 mt-1 flex-shrink-0" />
                              <div className="ml-4">
                                <h4 className="font-semibold text-green-100">Website</h4>
                                <a href="https://www.fast2.in" target="_blank" rel="noopener noreferrer" className="mt-1 text-green-50 hover:text-yellow-300 transition-colors">
                                  www.fast2.in
                                </a>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <ShieldCheckIcon className="h-6 w-6 text-green-200 mt-1 flex-shrink-0" />
                              <div className="ml-4">
                                <h4 className="font-semibold text-green-100">GST Number</h4>
                                <p className="mt-1 text-green-50 font-mono tracking-wide">CX029528377IN</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-12 pt-8 border-t border-green-500/30">
                            <h4 className="text-lg font-semibold text-green-100 mb-4">Business Hours</h4>
                            <div className="space-y-2 text-green-50">
                              <p>Monday - Sunday: 7:00 AM - 11:00 PM</p>
                              <p>Customer Support: 24/7 Available</p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Contact Form */}
                        <div className="md:w-1/2 p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                          <form className="space-y-6">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                id="name"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="Your name"
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="your@email.com"
                              />
                            </div>
                            <div>
                              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Message
                              </label>
                              <textarea
                                id="message"
                                rows={4}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="How can we help you?"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
                            >
                              Send Message
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                          <ClockIcon className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Fast Response</h4>
                        <p className="text-sm text-gray-600 mt-2">We respond to queries within 2 hours</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                          <ShieldCheckIcon className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Secure Communication</h4>
                        <p className="text-sm text-gray-600 mt-2">Your information is safe with us</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                          <ArrowPathIcon className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Quick Resolution</h4>
                        <p className="text-sm text-gray-600 mt-2">Issues resolved within 24 hours</p>
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
                <span className="block">Experience the Fast2.in Difference</span>
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