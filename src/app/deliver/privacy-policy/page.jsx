"use client";

import Link from 'next/link';
import DeliverHeader from '../components/DeliverHeader';
import DeliverFooter from '../components/DeliverFooter';

const lastUpdated = 'July 28, 2026';

export default function DriverPrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DeliverHeader />
      <section className="py-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
            <Link href="/deliver" className="text-green-700 hover:underline font-medium">
              Become a Delivery Partner
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Privacy Policy</span>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🔒 GMKart Captain Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              This policy explains how the GMKart Captain (delivery partner) app collects,
              uses, and protects your information.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="p-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🔒</span>
                  <h2 className="text-2xl font-bold">Privacy Policy for Delivery Partners</h2>
                </div>
                <p className="text-white/80 text-sm">Last Updated: {lastUpdated}</p>
              </div>

              <div className="policy-content">
                <p>
                  This Privacy Policy applies to the <strong>GMKart Captain</strong> mobile
                  application (&quot;the App&quot;), used by delivery partners (&quot;Driver,&quot;
                  &quot;you&quot;) to accept, track and complete deliveries for GMKart. By
                  registering as a delivery partner and using the App, you agree to the
                  collection and use of information as described below.
                </p>

                <h2>1. Information We Collect</h2>
                <h3>a) Personal Information</h3>
                <ul>
                  <li>Full name, email address, phone number, date of birth and gender</li>
                  <li>Profile photograph</li>
                </ul>

                <h3>b) Verification Documents</h3>
                <p>
                  To verify your identity and eligibility to deliver orders, we collect:
                </p>
                <ul>
                  <li>Aadhar card (front and back)</li>
                  <li>PAN card</li>
                  <li>Driving licence</li>
                  <li>Vehicle registration certificate (RC) and insurance</li>
                  <li>Bank passbook or cancelled cheque, for payout processing</li>
                </ul>

                <h3>c) Location Information</h3>
                <p>
                  The App requests <strong>precise location access, including background
                  location</strong>, while you are online and delivering an order. This is
                  used to:
                </p>
                <ul>
                  <li>Match you with nearby orders</li>
                  <li>Share your live location with the customer and GMKart support for the duration of an active delivery</li>
                  <li>Calculate routes, distances and delivery times</li>
                  <li>Maintain a record of completed deliveries for support and safety purposes</li>
                </ul>
                <p>
                  Background location is only collected while you are marked &quot;online&quot;
                  or have an active order in progress. You can disable location access at any
                  time from your device settings, but this will prevent you from receiving or
                  delivering orders.
                </p>

                <h3>d) Camera and Photos</h3>
                <p>
                  Used to capture or upload your profile photo and, where applicable, delivery
                  confirmation or document photos.
                </p>

                <h3>e) Device and Notification Data</h3>
                <p>
                  We collect a device push-notification token (Firebase Cloud Messaging) to
                  send you order alerts, in-app notifications, and important account updates.
                </p>

                <h3>f) Earnings and Payout Data</h3>
                <p>
                  Delivery statistics, earnings, and payout history are recorded to calculate
                  and process your payments.
                </p>

                <h2>2. How We Use Your Information</h2>
                <ul>
                  <li>To create and manage your delivery partner account</li>
                  <li>To verify your identity, documents and vehicle eligibility</li>
                  <li>To assign, route and track delivery orders in real time</li>
                  <li>To calculate earnings and process payouts to your bank account</li>
                  <li>To send order and account-related push notifications</li>
                  <li>To provide customer and driver support</li>
                  <li>To maintain safety, prevent fraud, and comply with legal obligations</li>
                </ul>

                <h2>3. Sharing of Information</h2>
                <p>We do not sell your personal information. We share data only with:</p>
                <ul>
                  <li>Customers, limited to your name, vehicle details and live location, for the duration of an active delivery</li>
                  <li>Service providers who help us operate the App, such as cloud storage for documents/photos and push-notification delivery (Firebase)</li>
                  <li>Government or regulatory authorities, where required by law</li>
                </ul>

                <h2>4. Data Storage and Security</h2>
                <p>
                  Your information is stored on secure servers and access is restricted to
                  authorized personnel. Documents and photos are stored with an encrypted
                  cloud storage provider. While we take reasonable measures to protect your
                  data, no method of transmission or storage is 100% secure.
                </p>

                <h2>5. Data Retention</h2>
                <p>
                  We retain your account, document and delivery data for as long as your
                  delivery partner account is active, and for a reasonable period afterward
                  to comply with legal, accounting and dispute-resolution requirements.
                </p>

                <h2>6. Your Rights</h2>
                <p>
                  You may request access to, correction of, or deletion of your personal data
                  at any time. To permanently delete your delivery partner account and
                  associated data, visit{' '}
                  <Link href="/delete-account">gmkart.com/delete-account</Link>.
                </p>

                <h2>7. Permissions Used by the App</h2>
                <ul>
                  <li><strong>Location (including background):</strong> order assignment and live delivery tracking</li>
                  <li><strong>Camera and Photos:</strong> profile photo and document uploads</li>
                  <li><strong>Notifications:</strong> incoming order alerts</li>
                  <li><strong>Phone/Storage:</strong> saving delivery-related media and documents</li>
                </ul>

                <h2>8. Children&apos;s Privacy</h2>
                <p>
                  The App is intended for use by delivery partners who are at least 18 years
                  old. We do not knowingly collect data from anyone under 18.
                </p>

                <h2>9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Continued use of the
                  App after changes are posted constitutes acceptance of the updated policy.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Questions About This Policy?
                </h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or how your data is
                  handled, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">support@gmkart.com</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Business Hours</p>
                    <p className="font-medium text-gray-900">Mon-Fri, 9 AM - 6 PM IST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-auto"><DeliverFooter /></div>

      <style jsx global>{`
        .policy-content {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #374151;
        }
        .policy-content h2,
        .policy-content h3 {
          color: #111827;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        .policy-content h2 { font-size: 1.5rem; color: #1d4ed8; }
        .policy-content h3 { font-size: 1.15rem; }
        .policy-content p { margin-bottom: 1rem; }
        .policy-content ul { margin-bottom: 1rem; padding-left: 1.5rem; list-style: disc; }
        .policy-content li { margin-bottom: 0.5rem; }
        .policy-content strong { color: #111827; font-weight: 600; }
        .policy-content a { color: #2563eb; text-decoration: underline; }
        .policy-content a:hover { color: #1d4ed8; }
      `}</style>
    </div>
  );
}
