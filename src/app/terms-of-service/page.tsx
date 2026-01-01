import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  return (
    <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">📜 Terms of Service</h1>
          <p className="text-lg sm:text-xl opacity-90">Simple rules for using our platform safely and fairly.</p>
          <p className="text-sm mt-3 opacity-75">Last Updated: January 2025</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10">
          
        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">🤝 1. Agreement</h2>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg mb-3">By using our salon booking platform, you agree to these terms. If you don&apos;t agree, please don&apos;t use our service.</p>
            <p className="text-gray-700 text-lg">These rules apply to both customers and salon owners.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">👤 2. Your Account</h2>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-purple-800 mb-3">✅ Creating an Account</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">•</span> <span>You must be 18+ years old</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">•</span> <span>Provide accurate information</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">•</span> <span>Keep your password secure</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">•</span> <span>Tell us if someone accesses your account</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-500 text-xl">•</span> <span>You&apos;re responsible for all account activity</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-800 mb-3">⚠️ Account Termination</h3>
            <p className="text-gray-700 mb-2">We may suspend accounts that:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Break these rules or laws</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Act fraudulently or abusively</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Provide false information</span></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">💅 3. For Customers</h2>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-pink-100 rounded-xl p-5">
              <h3 className="font-bold text-pink-800 mb-3 text-lg">📅 Booking</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span>✓</span> <span>Arrive on time</span></li>
                <li className="flex gap-2"><span>✓</span> <span>Provide correct contact info</span></li>
                <li className="flex gap-2"><span>✓</span> <span>Check salon policies</span></li>
              </ul>
            </div>
            
            <div className="bg-rose-100 rounded-xl p-5">
              <h3 className="font-bold text-rose-800 mb-3 text-lg">🔄 Cancellations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span>✓</span> <span>Cancel 24hrs before</span></li>
                <li className="flex gap-2"><span>✓</span> <span>No-shows may be charged</span></li>
                <li className="flex gap-2"><span>✓</span> <span>Refunds per salon policy</span></li>
              </ul>
            </div>
            
            <div className="bg-purple-100 rounded-xl p-5">
              <h3 className="font-bold text-purple-800 mb-3 text-lg">💳 Payment</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span>₹</span> <span>Prices in INR</span></li>
                <li className="flex gap-2"><span>🔒</span> <span>Secure processing</span></li>
                <li className="flex gap-2"><span>💰</span> <span>UPI, Cards, Wallets</span></li>
              </ul>
            </div>
            
            <div className="bg-orange-100 rounded-xl p-5">
              <h3 className="font-bold text-orange-800 mb-3 text-lg">😊 Good Behavior</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span>✗</span> <span>No harassment</span></li>
                <li className="flex gap-2"><span>✗</span> <span>No fake bookings</span></li>
                <li className="flex gap-2"><span>✗</span> <span>No false reviews</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">💼 4. For Salon Owners</h2>
          
          <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-indigo-800 mb-3">🏪 Listing Your Salon</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Provide accurate business info & licenses</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Upload genuine photos</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Set realistic pricing & duration</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Keep schedules updated</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 text-xl">✓</span> <span>Follow health & safety rules</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-green-800 mb-3">⭐ Service Quality</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xl">✓</span> <span>Honor all confirmed bookings</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xl">✓</span> <span>Deliver services as described</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xl">✓</span> <span>Maintain professional standards</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xl">✓</span> <span>Resolve complaints quickly</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xl">✓</span> <span>No discrimination</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">💰 Commission & Payments</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xl">₹</span> <span>Platform charges commission per booking</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xl">⏱️</span> <span>Payments within 7 business days</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xl">🏦</span> <span>Provide valid bank details</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xl">📊</span> <span>You handle your taxes</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-800 mb-3">🚫 Don&apos;t Do This</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Ask customers to book outside platform</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Fake reviews or ratings</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>List unlicensed services</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Share customer data</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Price gouging</span></li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">⚖️ 5. Our Role & Liability</h2>
          
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-orange-800 mb-3">🔗 We&apos;re a Platform</h3>
            <p className="text-gray-700 mb-3">We connect customers and salons. We are NOT:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Part of your service agreement</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Responsible for service quality</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Liable for disputes</span></li>
              <li className="flex items-start gap-2"><span className="text-red-500 text-xl">✗</span> <span>Employer of salon staff</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-500 rounded-2xl p-6">
            <p className="text-orange-800 font-bold text-lg">⚠️ Our liability is limited to the amount you paid in the past 12 months.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">🛡️ 6. Other Important Stuff</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-teal-100 rounded-xl p-5">
              <h3 className="font-bold text-teal-800 mb-3 text-lg">©️ Intellectual Property</h3>
              <p className="text-sm text-gray-700">Our platform design & code belong to us. Your content stays yours.</p>
            </div>
            
            <div className="bg-cyan-100 rounded-xl p-5">
              <h3 className="font-bold text-cyan-800 mb-3 text-lg">⚖️ Disputes</h3>
              <p className="text-sm text-gray-700">Contact support first. Governed by Indian law.</p>
            </div>
            
            <div className="bg-blue-100 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-3 text-lg">🔒 Privacy</h3>
              <p className="text-sm text-gray-700">See our <a href="/privacy-policy" className="text-blue-600 hover:underline font-bold">Privacy Policy</a></p>
            </div>
            
            <div className="bg-purple-100 rounded-xl p-5">
              <h3 className="font-bold text-purple-800 mb-3 text-lg">🔄 Updates</h3>
              <p className="text-sm text-gray-700">We may update terms. Big changes notified 30 days ahead.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">🚫 7. Prohibited Activities</h2>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700"><span className="text-red-500 text-xl">✗</span> <span>Illegal activities</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-red-500 text-xl">✗</span> <span>Hacking attempts</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-red-500 text-xl">✗</span> <span>Using bots/scrapers</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-red-500 text-xl">✗</span> <span>Fake accounts</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-red-500 text-xl">✗</span> <span>Spam or phishing</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-red-500 text-xl">✗</span> <span>Copyright violations</span></div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">📞 Questions?</h2>
            <p className="text-lg mb-4">We&apos;re here to help!</p>
            <div className="space-y-2">
              <p className="text-xl">📧 <a href="mailto:legal@salonplatform.com" className="hover:underline font-bold">legal@salonplatform.com</a></p>
              <p className="text-xl">📱 +91-XXXX-XXXXXX</p>
              <p>📍 [Your Company Address]</p>
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 rounded-2xl p-6 text-center">
          <p className="text-green-800 font-bold text-lg">✅ By using our platform, you agree to these terms. Thanks for being part of our community!</p>
        </div>

        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
