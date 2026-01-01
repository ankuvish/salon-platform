import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">🔒 Privacy Policy</h1>
          <p className="text-lg sm:text-xl opacity-90">Your privacy matters to us. Here's how we protect your data.</p>
          <p className="text-sm mt-3 opacity-75">Last Updated: January 2025</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10">

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">📋 1. What Information Do We Collect?</h2>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-purple-800 mb-3">👤 For Customers</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> <span><strong>Personal details:</strong> Name, email, phone, profile photo</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> <span><strong>Booking history:</strong> Services you booked, dates, times</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> <span><strong>Payment info:</strong> Securely processed by trusted providers</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> <span><strong>Location:</strong> To find salons near you (with permission)</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> <span><strong>Device info:</strong> Browser type, IP address</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-3">💼 For Salon Owners</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span><strong>Business details:</strong> Salon name, address, license</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span><strong>Staff info:</strong> Employee names, skills, schedules</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span><strong>Services:</strong> Pricing, descriptions, duration</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span><strong>Financial info:</strong> Bank details for payments</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span> <span><strong>Analytics:</strong> Booking stats, revenue reports</span></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">🎯 2. How Do We Use Your Information?</h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Process and manage your salon bookings</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-500 text-xl">✓</span> <span>Send booking confirmations and reminders</span></li>
            <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">✓</span> <span>Process payments securely</span></li>
            <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Provide customer support</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-500 text-xl">✓</span> <span>Improve our platform based on feedback</span></li>
            <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">✓</span> <span>Send special offers (you can opt-out anytime)</span></li>
            <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Follow legal requirements</span></li>
          </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">🤝 3. Do We Share Your Information?</h2>
          <p className="text-gray-700 mb-4 text-lg">We only share your info when necessary:</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-pink-100 rounded-xl p-4">
              <p className="font-bold text-pink-800 mb-2">🏪 With Salons</p>
              <p className="text-sm text-gray-700">Your booking details go to the salon you choose</p>
            </div>
            <div className="bg-orange-100 rounded-xl p-4">
              <p className="font-bold text-orange-800 mb-2">💳 Payment Partners</p>
              <p className="text-sm text-gray-700">Razorpay, Stripe for secure payments</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-4">
              <p className="font-bold text-purple-800 mb-2">📧 Service Providers</p>
              <p className="text-sm text-gray-700">Email/SMS, cloud hosting, analytics</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-2">⚖️ Legal Requirements</p>
              <p className="text-sm text-gray-700">When required by law</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 rounded-xl p-4">
            <p className="text-green-800 font-bold text-lg">🛡️ We NEVER sell your personal information!</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">🔐 4. How Do We Protect Your Data?</h2>
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3"><span className="text-2xl">🔒</span> <span><strong>Bank-level encryption</strong> for all data</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">🛡️</span> <span><strong>Secure servers</strong> with regular security checks</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">👥</span> <span><strong>Limited access</strong> - only authorized staff</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">💾</span> <span><strong>Regular backups</strong> to prevent data loss</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">🔑</span> <span><strong>Two-factor authentication</strong> available</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">✅</span> <span><strong>PCI DSS compliant</strong> payment processing</span></li>
          </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">⚡ 5. What Are Your Rights?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-indigo-100 rounded-xl p-4">
              <p className="font-bold text-indigo-800 mb-2">📥 Access</p>
              <p className="text-sm text-gray-700">Get a copy of your data</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-4">
              <p className="font-bold text-purple-800 mb-2">✏️ Correction</p>
              <p className="text-sm text-gray-700">Update wrong information</p>
            </div>
            <div className="bg-pink-100 rounded-xl p-4">
              <p className="font-bold text-pink-800 mb-2">🗑️ Deletion</p>
              <p className="text-sm text-gray-700">Delete your account & data</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-2">📤 Portability</p>
              <p className="text-sm text-gray-700">Download your data</p>
            </div>
            <div className="bg-orange-100 rounded-xl p-4">
              <p className="font-bold text-orange-800 mb-2">🚫 Opt-Out</p>
              <p className="text-sm text-gray-700">Stop marketing emails</p>
            </div>
            <div className="bg-teal-100 rounded-xl p-4">
              <p className="font-bold text-teal-800 mb-2">⏸️ Restrict</p>
              <p className="text-sm text-gray-700">Limit data usage</p>
            </div>
          </div>
          <p className="text-gray-700 mt-3 text-center">📧 Contact us: <a href="mailto:privacy@salonplatform.com" className="text-blue-600 hover:underline font-bold">privacy@salonplatform.com</a></p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">⏰ 6. How Long Do We Keep Your Data?</h2>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3"><span className="text-2xl">👤</span> <span><strong>Active accounts:</strong> While you use our service + 90 days</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">📅</span> <span><strong>Booking records:</strong> 7 years (tax & legal requirements)</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">💳</span> <span><strong>Payment data:</strong> As per financial regulations</span></li>
            <li className="flex items-start gap-3"><span className="text-2xl">📧</span> <span><strong>Marketing data:</strong> Until you unsubscribe</span></li>
          </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">🍪 7. Cookies & Tracking</h2>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg">We use cookies to improve your experience. Learn more in our <a href="/cookie-policy" className="text-orange-600 hover:underline font-bold">Cookie Policy</a>.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">👶 8. Children&apos;s Privacy</h2>
          <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg">Our platform is for adults (18+). We don&apos;t collect data from children. If you think a child shared info with us, please contact us immediately.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">🌍 9. International Data</h2>
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg">Your data may be processed outside India, but we ensure it&apos;s protected with proper security measures.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">🔄 10. Policy Updates</h2>
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg">We may update this policy. Big changes will be notified via email. Continuing to use our service means you accept the updates.</p>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">📞 Need Help?</h2>
            <p className="text-lg mb-4">We&apos;re here for you!</p>
            <div className="space-y-2">
              <p className="text-xl">📧 <a href="mailto:privacy@salonplatform.com" className="hover:underline font-bold">privacy@salonplatform.com</a></p>
              <p className="text-xl">📱 +91-XXXX-XXXXXX</p>
              <p>📍 [Your Company Address]</p>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
