'use client';

import React from 'react';
import { Locale, getTranslations } from '@/i18n';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  locale: Locale;
}

export default function DashboardLayout({ 
  children, 
  activeView, 
  onViewChange, 
  locale 
}: DashboardLayoutProps) {
  const t = getTranslations(locale);

  const navItems: NavItem[] = [
    { id: 'chat', label: t.sidebar.chat || 'AI Assistant', icon: '🤖' },
    { id: 'market', label: t.sidebar.prices || 'Market Trends', icon: '💰' },
    { id: 'planner', label: t.sidebar.planner || 'Crop Planner', icon: '📅' },
    { id: 'schemes', label: t.sidebar.schemes || 'Govt Schemes', icon: '🏛️' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              🌾
            </div>
            <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">
              Kisan Mitra
            </h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeView === item.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Helpline</p>
            <p className="font-bold text-slate-800">1551</p>
            <p className="text-[10px] text-slate-400">24/7 Support</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-slate-800">Kisan Mitra</span>
          </div>
          <button className="p-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        {/* Dynamic View Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {navItems.find(i => i.id === activeView)?.label}
          </h2>
          <div className="flex items-center gap-4">
             {/* Dynamic slots if needed */}
          </div>
        </div>

        {/* View Content */}
        <section className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
