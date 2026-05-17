'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

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

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
};

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '', referenceId: '' });
  const [formErrors, setFormErrors] = useState({});

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errors.name = 'Enter your full name (min 2 characters)';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = 'Enter a valid email address';
    if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone))
      errors.phone = 'Enter a valid 10-digit phone number';
    if (!formData.subject)
      errors.subject = 'Please select a subject';
    if (!formData.message.trim() || formData.message.trim().length < 10)
      errors.message = 'Message must be at least 10 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setStatus({ type: '', message: '', referenceId: '' });

    try {
      const response = await fetch('https://www.fast2.in/proxy/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Your message has been received! We will get back to you soon.',
          referenceId: data.data?.referenceNumber || ''
        });
        setFormData(initialForm);
        setFormErrors({});
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.'
        });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialForm);
    setFormErrors({});
    setStatus({ type: '', message: '', referenceId: '' });
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = (field) =>
    `block w-full px-4 py-2.5 rounded-lg border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
      formErrors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-400'
        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-400'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send us a Message</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Status Banner */}
          {status.message && (
            <div className={`mb-5 p-4 rounded-xl flex items-start gap-3 ${
              status.type === 'success'
                ? 'bg-purple-50 border border-purple-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {status.type === 'success'
                ? <CheckCircleIcon className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                : <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-sm font-medium ${status.type === 'success' ? 'text-purple-800' : 'text-red-800'}`}>
                  {status.message}
                </p>
                {status.referenceId && (
                  <p className="text-xs text-purple-700 mt-1">
                    Reference ID: <span className="font-semibold">{status.referenceId}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {status.type !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={inputClass('name')}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass('email')}
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={inputClass('phone')}
                />
                {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={inputClass('subject')}
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {formErrors.subject && <p className="mt-1 text-xs text-red-600">{formErrors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="How can we help you?"
                  className={inputClass('message')}
                />
                <div className="flex justify-between mt-1">
                  {formErrors.message
                    ? <p className="text-xs text-red-600">{formErrors.message}</p>
                    : <span />
                  }
                  <span className="text-xs text-gray-400">{formData.message.length}/5000</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm shadow-purple-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : 'Send Message'}
              </button>
            </form>
          )}

          {/* After success — close button */}
          {status.type === 'success' && (
            <button
              onClick={handleClose}
              className="mt-2 w-full py-3 px-4 rounded-xl font-semibold text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
