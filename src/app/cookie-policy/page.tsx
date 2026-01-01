import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function CookiePolicy() {
  return (
    <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">🍪 Cookie Policy</h1>
          <p className="text-lg sm:text-xl opacity-90">Learn how we use cookies to make your experience better!</p>
          <p className="text-sm mt-3 opacity-75">Last Updated: January 2025</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10">

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">🤔 1. What Are Cookies?</h2>
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg mb-3">Cookies are tiny text files saved on your device when you visit our website. Think of them as helpful notes that remember your preferences!</p>
            <p className="text-gray-700 text-lg">We also use similar tech like pixels and local storage.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">🎯 2. Types of Cookies We Use</h2>
          
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-green-800 mb-3">✅ Essential Cookies (Required)</h3>
            <p className="text-gray-700 mb-3">These are necessary for the site to work. You can&apos;t turn these off.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-green-700 mb-1">🔐 Authentication</p>
                <p className="text-sm text-gray-600">Keeps you logged in</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-green-700 mb-1">🛡️ Security</p>
                <p className="text-sm text-gray-600">Protects from fraud</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-green-700 mb-1">⚖️ Load Balancing</p>
                <p className="text-sm text-gray-600">Distributes traffic</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-green-700 mb-1">🛒 Session</p>
                <p className="text-sm text-gray-600">Remembers your selections</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-blue-800 mb-3">🎨 Functional Cookies (Optional)</h3>
            <p className="text-gray-700 mb-3">These make your experience better by remembering your choices.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-blue-700 mb-1">🌐 Language</p>
                <p className="text-sm text-gray-600">Your preferred language</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-blue-700 mb-1">📍 Location</p>
                <p className="text-sm text-gray-600">Your city for searches</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-blue-700 mb-1">👁️ Display</p>
                <p className="text-sm text-gray-600">Grid or list view</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-blue-700 mb-1">🔍 Searches</p>
                <p className="text-sm text-gray-600">Recent salon searches</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-purple-800 mb-3">📊 Analytics Cookies (Optional)</h3>
            <p className="text-gray-700 mb-3">Help us understand how you use our site so we can improve it.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-purple-700 mb-1">📈 Google Analytics</p>
                <p className="text-sm text-gray-600">Page views & sessions</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-purple-700 mb-1">🔥 Heatmaps</p>
                <p className="text-sm text-gray-600">Where users click</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-purple-700 mb-1">⚡ Performance</p>
                <p className="text-sm text-gray-600">Find slow pages</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-purple-700 mb-1">🐛 Errors</p>
                <p className="text-sm text-gray-600">Detect & fix bugs</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-pink-800 mb-3">📢 Marketing Cookies (Optional)</h3>
            <p className="text-gray-700 mb-3">Show you relevant ads and track how well our campaigns work.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-pink-700 mb-1">🎯 Retargeting</p>
                <p className="text-sm text-gray-600">Ads for salons you viewed</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-pink-700 mb-1">📱 Social Media</p>
                <p className="text-sm text-gray-600">Facebook, Instagram pixels</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-pink-700 mb-1">📊 Ad Performance</p>
                <p className="text-sm text-gray-600">Measure ad effectiveness</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-bold text-pink-700 mb-1">✨ Personalization</p>
                <p className="text-sm text-gray-600">Relevant promotions</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">🤝 3. Third-Party Cookies</h2>
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6">
            <p className="text-gray-700 mb-4 text-lg">We work with trusted partners who may set their own cookies:</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">📊</p>
                <p className="font-bold text-indigo-700">Google Analytics</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">📘</p>
                <p className="font-bold text-blue-700">Facebook Pixel</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">💳</p>
                <p className="font-bold text-purple-700">Payment Processors</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">💬</p>
                <p className="font-bold text-pink-700">Live Chat</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">🚀</p>
                <p className="font-bold text-orange-700">CDN Providers</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">⏰ 4. How Long Do Cookies Last?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl p-5">
              <h3 className="font-bold text-teal-800 mb-2 text-lg">⚡ Session Cookies</h3>
              <p className="text-gray-700">Deleted when you close your browser</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-2 text-lg">📅 Persistent Cookies</h3>
              <p className="text-gray-700">Stay for 30 days to 2 years</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-5">
              <h3 className="font-bold text-purple-800 mb-2 text-lg">🔐 Auth Cookies</h3>
              <p className="text-gray-700">Expire after 30 days inactive</p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-5">
              <h3 className="font-bold text-pink-800 mb-2 text-lg">📊 Analytics Cookies</h3>
              <p className="text-gray-700">Typically last 2 years</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">⚙️ 5. Managing Your Cookies</h2>
          
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-green-800 mb-3">🍪 Cookie Banner</h3>
            <p className="text-gray-700 mb-3">When you first visit, you&apos;ll see a cookie banner. You can:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700"><span className="text-green-500 text-xl">✓</span> <span>Accept all cookies</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-green-500 text-xl">✓</span> <span>Reject optional cookies</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-green-500 text-xl">✓</span> <span>Customize by category</span></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-blue-800 mb-3">🌐 Browser Settings</h3>
            <p className="text-gray-700 mb-3">Control cookies in your browser:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3">
                <p className="font-bold text-blue-700">Chrome</p>
                <p className="text-sm text-gray-600">Settings → Privacy → Cookies</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="font-bold text-blue-700">Firefox</p>
                <p className="text-sm text-gray-600">Options → Privacy → Cookies</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="font-bold text-blue-700">Safari</p>
                <p className="text-sm text-gray-600">Preferences → Privacy</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="font-bold text-blue-700">Edge</p>
                <p className="text-sm text-gray-600">Settings → Privacy → Cookies</p>
              </div>
            </div>
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-xl p-4 mt-4">
              <p className="text-yellow-800 font-bold">⚠️ Blocking essential cookies may break the site!</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-3">🔗 Opt-Out Links</h3>
            <div className="space-y-2">
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-700 hover:underline">
                <span className="text-xl">📊</span> <span className="font-bold">Google Analytics Opt-out</span>
              </a>
              <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 hover:underline">
                <span className="text-xl">📘</span> <span className="font-bold">Facebook Ad Preferences</span>
              </a>
              <a href="http://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-700 hover:underline">
                <span className="text-xl">🌐</span> <span className="font-bold">Network Advertising Opt-out</span>
              </a>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">📱 6. Mobile Devices</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-5">
              <h3 className="font-bold text-orange-800 mb-2 text-lg">🍎 iOS</h3>
              <p className="text-gray-700 text-sm">Settings → Privacy → Tracking → Limit Ad Tracking</p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-5">
              <h3 className="font-bold text-red-800 mb-2 text-lg">🤖 Android</h3>
              <p className="text-gray-700 text-sm">Settings → Google → Ads → Opt out</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">💼 7. For Salon Owners</h2>
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-6">
            <p className="text-gray-700 mb-3 text-lg">If you use our dashboard, we use extra cookies for:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700"><span className="text-amber-500 text-xl">✓</span> <span>Dashboard login</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-amber-500 text-xl">✓</span> <span>Saving preferences</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-amber-500 text-xl">✓</span> <span>Booking analytics</span></div>
              <div className="flex items-center gap-2 text-gray-700"><span className="text-amber-500 text-xl">✓</span> <span>Performance tracking</span></div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">🔄 8. Policy Updates</h2>
          <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-6">
            <p className="text-gray-700 text-lg">We may update this policy. Check back occasionally. The &quot;Last Updated&quot; date shows when we made changes.</p>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">💬 Questions About Cookies?</h2>
            <p className="text-lg mb-4">We&apos;re happy to help!</p>
            <div className="space-y-2">
              <p className="text-xl">📧 <a href="mailto:privacy@salonplatform.com" className="hover:underline font-bold">privacy@salonplatform.com</a></p>
              <p className="text-xl">📱 +91-XXXX-XXXXXX</p>
              <p>📍 [Your Company Address]</p>
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 rounded-2xl p-6">
          <p className="text-green-900 font-bold text-center text-lg mb-2">🛡️ Your Privacy Matters!</p>
          <p className="text-green-800 text-center">We&apos;re transparent about cookies. You control optional cookies and can change settings anytime.</p>
        </div>

        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
