'use client';

import { useState, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';
import LanguageSelector from '@/components/LanguageSelector';
import DashboardLayout from '@/components/DashboardLayout';
import MarketTrends from '@/components/MarketTrends';
import CropPlanner from '@/components/CropPlanner';
import GovernmentSchemes from '@/components/GovernmentSchemes';
import { getTranslations, getStoredLocale, setStoredLocale, Locale } from '@/i18n';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState('chat');

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(stored);
    }
    setMounted(true);
  }, [locale]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setStoredLocale(newLocale);
  };

  const t = getTranslations(locale);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-bold text-xl uppercase tracking-widest">Kisan Mitra</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ChatBox locale={locale} />
            </div>
            <div className="space-y-6">
              {/* Context sidebars moved here for Chat view */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 card-hover">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌤️</span>
                  <h3 className="font-bold text-slate-800">{t.sidebar.weather}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Location</p>
                    <p className="text-slate-700 font-semibold">Pune, Maharashtra</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-slate-800 tracking-tighter">28°C</p>
                    <p className="text-slate-500 font-medium mb-1">Partly Cloudy</p>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-medium">
                    <span>Humidity: 65%</span>
                    <span>Wind: 12 km/h</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white card-hover relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📞</span>
                    <h3 className="font-bold">{t.sidebar.tips}</h3>
                  </div>
                  <p className="text-green-50 text-sm leading-relaxed mb-4">
                    {locale === 'hi' 
                      ? 'बुवाई से पहले मिट्टी परीक्षण करवाएं।'
                      : locale === 'mr'
                      ? 'पेरणीपूर्वी माती परीक्षण करा।'
                      : 'Ensure soil testing before the next crop cycle.'}
                  </p>
                  <button className="w-full py-2 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-colors">
                    Call 1551
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:scale-110 transition-transform">🌾</div>
              </div>
            </div>
          </div>
        );
      case 'market':
        return <MarketTrends locale={locale} />;
      case 'planner':
        return <CropPlanner locale={locale} />;
      case 'schemes':
        return <GovernmentSchemes locale={locale} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      locale={locale}
    >
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t.app.language}</span>
          <LanguageSelector locale={locale} onChange={handleLocaleChange} />
        </div>
      </div>
      {renderContent()}
    </DashboardLayout>
  );
}
