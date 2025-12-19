'use client';

import React from 'react';
import { Locale } from '@/i18n';

interface CropSchedule {
  crop: string;
  activity: string;
  month: string;
  status: 'current' | 'upcoming' | 'past';
}

const CROP_CALENDAR: Record<string, CropSchedule[]> = {
  en: [
    { crop: 'Wheat', activity: 'Irrigation & Fertilization', month: 'December', status: 'current' },
    { crop: 'Mustard', activity: 'Pest Monitoring', month: 'December', status: 'current' },
    { crop: 'Sugarcane', activity: 'Harvesting', month: 'Jan - Feb', status: 'upcoming' },
    { crop: 'Moong Dal', activity: 'Sowing Preparation', month: 'March', status: 'upcoming' },
    { crop: 'Rice (Kharif)', activity: 'Harvesting Complete', month: 'November', status: 'past' },
  ]
};

export default function CropPlanner({ locale }: { locale: Locale }) {
  const schedule = CROP_CALENDAR.en;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="glass p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Seasonal Planner</h3>
            <p className="text-slate-500 font-medium mt-1">Personalized calendar for Maharashtra (Central India)</p>
          </div>
          <div className="bg-green-100/80 backdrop-blur-sm text-green-800 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm border border-green-200">
            📅 Current Month: December
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {schedule.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 group ${
                item.status === 'current' 
                  ? 'bg-gradient-to-r from-green-50/80 to-white/60 border border-green-200 shadow-lg shadow-green-100' 
                  : 'bg-white/40 border border-white/40 hover:bg-white/60'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                item.status === 'current' ? 'bg-green-600 text-white' : 'bg-white text-slate-400'
              }`}>
                {item.status === 'current' ? '🌱' : item.status === 'upcoming' ? '⏳' : '✅'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`font-extrabold text-lg ${item.status === 'current' ? 'text-slate-800' : 'text-slate-600'}`}>
                    {item.crop}
                  </h4>
                  {item.status === 'current' && (
                    <span className="bg-green-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm shadow-green-200 animate-pulse">Active Now</span>
                  )}
                </div>
                <p className="text-slate-500 font-medium">{item.activity}</p>
              </div>

              <div className="text-right">
                <p className={`font-black text-lg ${item.status === 'current' ? 'text-green-700' : 'text-slate-700'}`}>
                  {item.month}
                </p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Target Period</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 flex gap-6 items-start">
           <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl backdrop-blur-md border border-white/10">💡</div>
           <div>
            <h3 className="text-xl font-bold mb-2 text-white">Pro Farming Tip</h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-light">
              Temperatures are dropping. For wheat, ensure the second irrigation (CRI stage) happens exactly <strong className="text-white font-bold">21-25 days after sowing</strong> for maximum yield.
            </p>
           </div>
        </div>
        <div className="absolute right-0 bottom-0 text-9xl -mb-8 -mr-8 opacity-5 rotate-12">🌾</div>
      </div>
    </div>
  );
}
