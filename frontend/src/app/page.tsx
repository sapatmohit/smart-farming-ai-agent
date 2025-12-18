'use client';

import { useState, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';
import LanguageSelector from '@/components/LanguageSelector';
import { getTranslations, getStoredLocale, setStoredLocale, Locale } from '@/i18n';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(getStoredLocale());
    setMounted(true);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setStoredLocale(newLocale);
  };

  const t = getTranslations(locale);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-stone-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-pulse text-green-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-stone-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🌾
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-green-800 tracking-tight">
                {t.app.title}
              </h1>
              <p className="text-gray-600 text-sm">{t.app.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm font-medium hidden sm:inline">{t.app.language}:</span>
            <LanguageSelector locale={locale} onChange={handleLocaleChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <ChatBox locale={locale} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Card */}
            <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-yellow-400 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌤️</span>
                <h3 className="font-bold text-lg text-gray-800">{t.sidebar.weather}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Pune, Maharashtra</p>
                <p className="text-3xl font-bold text-gray-800">28°C</p>
                <p className="text-gray-600 text-sm">Partly Cloudy</p>
                <p className="text-gray-500 text-xs">Humidity: 65% | Wind: 12 km/h</p>
              </div>
            </div>
            
            {/* Market Prices Card */}
            <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="font-bold text-lg text-gray-800">{t.sidebar.prices}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Wheat (गेहूं)</span>
                  <span className="font-semibold text-gray-800">₹2,275/Qt</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Onion (प्याज)</span>
                  <span className="font-semibold text-gray-800">₹1,850/Qt</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Tomato (टमाटर)</span>
                  <span className="font-semibold text-gray-800">₹1,650/Qt</span>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-lg text-gray-800">{t.sidebar.tips}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {locale === 'hi' 
                  ? 'बुवाई से पहले मिट्टी परीक्षण करवाएं। अपने नजदीकी कृषि विज्ञान केंद्र से संपर्क करें।'
                  : locale === 'mr'
                  ? 'पेरणीपूर्वी माती परीक्षण करा. जवळच्या कृषी विज्ञान केंद्राशी संपर्क साधा.'
                  : 'Consider soil testing before the next sowing cycle. Contact your nearest Krishi Vigyan Kendra.'}
              </p>
            </div>

            {/* Helpline Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 rounded-2xl shadow-md text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📞</span>
                <h3 className="font-bold text-lg">Kisan Call Center</h3>
              </div>
              <p className="text-green-100 text-sm mb-2">24x7 Free Agriculture Helpline</p>
              <p className="text-2xl font-bold">1551</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built with ❤️ for Indian Farmers | Powered by IBM Granite LLM</p>
        </div>
      </footer>
    </main>
  );
}
