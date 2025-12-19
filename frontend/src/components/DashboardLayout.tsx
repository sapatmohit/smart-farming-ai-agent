'use client';

import { Locale, getTranslations } from '@/i18n';
import React from 'react';

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
  headerActions?: React.ReactNode;
}

export default function DashboardLayout({ 
  children, 
  activeView, 
  onViewChange, 
  locale,
  headerActions
}: DashboardLayoutProps) {
  const t = getTranslations(locale);

  const navItems: NavItem[] = [
    { id: 'chat', label: t.sidebar.chat || 'AI Assistant', icon: '🤖' },
    { id: 'market', label: t.sidebar.prices || 'Market Trends', icon: '💰' },
    { id: 'planner', label: t.sidebar.planner || 'Crop Planner', icon: '📅' },
    { id: 'schemes', label: t.sidebar.schemes || 'Govt Schemes', icon: '🏛️' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Minimal Sidebar */}
      <aside className="hidden lg:flex w-64 h-[calc(100vh-2rem)] m-4 flex-col overflow-hidden shrink-0 border-r border-slate-100/50 bg-white/30 backdrop-blur-sm rounded-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 px-2">
             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white text-lg">
               🤖
             </div>
             <span className="font-bold text-slate-800 tracking-tight text-lg">KisanAI</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium ${
                  activeView === item.id 
                    ? 'bg-white shadow-sm text-slate-900' 
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                }`}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 mx-4 mb-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
           <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-green-700 uppercase">Pro Tip</span>
           </div>
           <p className="text-[11px] text-slate-600 leading-relaxed">
             Ask KisanAI about "Market trends" to see today's prices.
           </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* Status Bar / Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 z-20 shadow-sm">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-bold text-lg text-slate-800">KisanAI</span>
          </div>
          
          {/* Desktop Title (Optional, hidden on mobile if needed) */}
          <div className="hidden lg:block">
             <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {navItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {headerActions}
             <div className="h-9 w-9 rounded-full bg-slate-200 ring-2 ring-white shadow-sm overflow-hidden cursor-pointer hover:ring-green-400 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="User" className="w-full h-full" />
             </div>
          </div>
        </header>

        {/* View Content */}
        <section className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth z-0">
           {children}
        </section>
      </main>
    </div>
  );
}

