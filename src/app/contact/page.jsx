"use client";
import { useState, useEffect } from 'react';
import ContactModal from '../components/contactModal/ContactModal';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon, 
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Footer from '../components/footer/page';

const ContactPage = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formErrors, setFormErrors] = useState({});

  const contactInfo = [
    {
      title: 'Email Address',
      description: 'support@fast2.in',
      href: 'mailto:support@fast2.in',
      icon: EnvelopeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Phone Number',
      description: '+91 9981306588',
      href: 'tel:+919981306588',
      icon: PhoneIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Business Address',
      description: 'Indra Nagar near Sain Devin school, Thatipur, Gwalior, Madhya Pradesh 474011',
      href: 'https://maps.google.com/?q=Indra+Nagar+near+Sain+Devin+school+Thatipur+Gwalior+Madhya+Pradesh+474011',
      icon: MapPinIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Website',
      description: 'www.fast2.in',
      href: 'https://www.fast2.in',
      icon: GlobeAltIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Business Hours',
      description: 'Mon-Sun: 7:00 AM - 11:00 PM',
      href: '',
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const subjectOptions = [
    'General Inquiry',
    'Product Support',
    'Order Issue',
    'Delivery Problem',
    'Return/Refund',
    'Partnership Inquiry',
    'Feedback',
    'Other'
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    setStatus({
      type: 'error',
      message: 'Please fix the errors in the form'
    });
    return;
  }

  setLoading(true);
  setStatus({ type: '', message: '' });

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/proxy'}/api/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      setStatus({
        type: 'success',
        message: data.message || 'Your message has been received! We will get back to you soon.',
        referenceId: data.data?.referenceNumber
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setFormErrors({});
    } else {
      setStatus({
        type: 'error',
        message: data.message || 'Failed to send message. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    setStatus({
      type: 'error',
      message: 'Network error. Please check your connection and try again.'
    });
  } finally {
    setLoading(false);
  }
};

{status.type === 'success' && status.referenceId && (
  <div className="mt-4 p-4 bg-green-50 rounded-lg">
    <p className="text-sm text-green-800">
      <strong>Reference ID:</strong> {status.referenceId}<br />
      Please keep this reference for future correspondence.
    </p>
  </div>
)}

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Contact Us
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-green-100">
              Get in touch with our team. We're here to help with any questions or concerns.
            </p>
            <button
              onClick={() => setContactModalOpen(true)}
              className="mt-8 inline-flex items-center px-8 py-3 rounded-xl bg-white text-green-700 font-semibold shadow-lg hover:bg-green-50 transition-colors"
            >
              Send us a Message
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Messages */}
        {status.message && (
          <div className={`mb-8 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {status.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
              )}
              <p className={`text-sm ${status.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {status.message}
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about our services, need help with an order, or want to provide feedback? 
              We're always here to assist you. Reach out through any of the channels below.
            </p>

            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.title} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${info.bgColor} flex items-center justify-center`}>
                    <info.icon className={`h-6 w-6 ${info.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
                    {info.href ? (
                      <a 
                        href={info.href} 
                        target={info.title === 'Website' ? '_blank' : '_self'}
                        rel={info.title === 'Website' ? 'noopener noreferrer' : ''}
                        className="text-gray-600 hover:text-green-600 transition-colors"
                      >
                        {info.description}
                      </a>
                    ) : (
                      <p className="text-gray-600">{info.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Section */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Location</h3>
              <div className="bg-gray-100 rounded-lg overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.925971122492!2d78.1790744753448!3d26.199491677072216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c7e8a3f3b5e5%3A0xb9309912950531ef!2sThatipur%2C%20Gwalior%2C%20Madhya%20Pradesh%20474011!5e0!3m2!1sen!2sin!4v1695732287893!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Fast2.in Location"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  } shadow-sm focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  } shadow-sm focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  } shadow-sm focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  placeholder="10-digit mobile number"
                />
                {formErrors.phone && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    formErrors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  } shadow-sm focus:ring-2 focus:ring-opacity-50 transition-colors`}
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {formErrors.subject && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.subject}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    formErrors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  } shadow-sm focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  placeholder="How can we help you?"
                />
                {formErrors.message && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                    loading
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                  } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>

            {/* Form Note */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> We typically respond within 2-4 hours during business hours. 
                For urgent matters, please call our support number.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: 'What are your business hours?',
                answer: 'We are available 7 days a week from 7:00 AM to 11:00 PM. Customer support is available 24/7 for urgent issues.'
              },
              {
                question: 'How quickly do you respond to messages?',
                answer: 'We aim to respond to all inquiries within 2-4 hours during business hours. Emails are typically answered within 24 hours.'
              },
              {
                question: 'Can I track my support ticket?',
                answer: 'Yes, once you submit a query, you will receive a ticket number via email that you can use to track the status of your inquiry.'
              },
              {
                question: 'Do you offer phone support?',
                answer: 'Yes, we offer phone support for urgent matters. You can reach us at +91 9981306588 during business hours.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ContactPage;