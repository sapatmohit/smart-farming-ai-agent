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
              <div className="glass p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center text-lg shadow-sm">🌤️</div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{t.sidebar.weather}</h3>
                </div>
                <div className="space-y-3 relative z-10">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Current Location</p>
                    <p className="text-slate-800 font-bold text-sm flex items-center gap-1">
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                      Pune, Maharashtra
                    </p>
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-black text-slate-800 tracking-tighter">28°</p>
                    <div className="mb-1.5">
                      <p className="text-slate-600 font-bold text-sm">Partly Cloudy</p>
                      <p className="text-[10px] text-slate-400 font-bold">Feels like 30°</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                     <div className="bg-white/40 p-2 rounded-lg text-[10px] font-bold text-slate-600 text-center border border-white/50">
                       💧 65% Humidity
                     </div>
                     <div className="bg-white/40 p-2 rounded-lg text-[10px] font-bold text-slate-600 text-center border border-white/50">
                       💨 12 km/h Wind
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-5 rounded-3xl shadow-xl shadow-green-900/20 text-white card-hover relative overflow-hidden group border border-green-500/30">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-lg">💡</div>
                    <h3 className="font-bold text-sm">{t.sidebar.tips}</h3>
                  </div>
                  <p className="text-green-50 text-xs leading-relaxed mb-4 font-medium opacity-90">
                    {locale === 'hi' 
                      ? 'बुवाई से पहले मिट्टी परीक्षण करवाएं।'
                      : locale === 'mr'
                      ? 'पेरणीपूर्वी माती परीक्षण करा।'
                      : 'Ensure soil testing before the next crop cycle.'}
                  </p>
                  <button className="w-full py-2.5 bg-white text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-colors shadow-lg shadow-black/10">
                    Call Expert Now
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">🌾</div>
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
      headerActions={
        <div className="flex items-center gap-2">
          <LanguageSelector locale={locale} onChange={handleLocaleChange} />
        </div>
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}
