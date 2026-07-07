'use client';

import React, { useState } from 'react';
import PopupAdmin from '../components/popup/PopupAdmin';

const PopupDemo = () => {
  const [adminToken, setAdminToken] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              GMKart Popup System Demo
            </h1>
            <div className="flex items-center space-x-4">
              <input
                type="password"
                placeholder="Admin Token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                disabled={!adminToken}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  adminToken
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {showAdmin ? 'Hide Admin' : 'Show Admin'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdmin && adminToken && <PopupAdmin adminToken={adminToken} />}

      {/* Demo Content */}
      {!showAdmin && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to GMKart Popup Demo
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              This page demonstrates the popup notification system. Any active popups 
              scheduled for the current time will appear automatically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-3">
                  🎯 Features
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>✅ Time-based scheduling</li>
                  <li>✅ Image support</li>
                  <li>✅ Multiple positions</li>
                  <li>✅ Auto-close functionality</li>
                  <li>✅ Page targeting</li>
                  <li>✅ User segmentation</li>
                  <li>✅ Priority system</li>
                  <li>✅ Responsive design</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-3">
                  🚀 How to Test
                </h3>
                <ol className="space-y-2 text-green-800 list-decimal list-inside">
                  <li>Enter admin token above</li>
                  <li>Click "Show Admin" button</li>
                  <li>Create a new popup</li>
                  <li>Set current time in schedule</li>
                  <li>Save and see it appear!</li>
                </ol>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-yellow-900 mb-3">
                💡 Pro Tips
              </h3>
              <div className="space-y-3 text-yellow-800">
                <p>
                  <strong>Testing Time-based Popups:</strong> Set start time a few minutes 
                  before current time and end time a few minutes after to test the scheduling.
                </p>
                <p>
                  <strong>Position Testing:</strong> Try different positions (top-left, 
                  bottom-center, etc.) to see how they appear on screen.
                </p>
                <p>
                  <strong>Auto-close Testing:</strong> Set auto-close to 5-10 seconds 
                  to see the automatic dismissal feature.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Current Time:</h4>
              <p className="text-2xl font-mono text-gray-700">
                {new Date().toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Use this time when scheduling test popups.
              </p>
            </div>
          </div>

          {/* Sample Content Sections for Page Targeting */}
          <div className="mt-8 space-y-8">
            <section className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Products Section</h3>
              <p className="text-gray-600">
                This is the products section. You can target popups to show only on specific pages 
                like "/products" by setting target pages in the admin panel.
              </p>
            </section>

            <section className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About Section</h3>
              <p className="text-gray-600">
                This is the about section. Popups can be targeted to specific pages to provide 
                contextual information to users.
              </p>
            </section>

            <section className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Section</h3>
              <p className="text-gray-600">
                This is the contact section. Use page targeting to show different popups 
                based on user context and page content.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupDemo;
