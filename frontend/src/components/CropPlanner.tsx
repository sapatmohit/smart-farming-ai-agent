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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Seasonal Planner</h3>
            <p className="text-slate-500 font-medium">Personalized calendar for Maharashtra (Central India)</p>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm">
            Current Month: December
          </div>
        </div>

        <div className="space-y-4">
          {schedule.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-6 p-5 rounded-2xl border transition-all duration-300 ${
                item.status === 'current' 
                  ? 'bg-green-50 border-green-100 ring-2 ring-green-500/10' 
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm ${
                item.status === 'current' ? 'bg-green-600' : 'bg-slate-100'
              }`}>
                {item.status === 'current' ? '🌱' : item.status === 'upcoming' ? '⏳' : '✅'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-extrabold text-slate-800">{item.crop}</h4>
                  {item.status === 'current' && (
                    <span className="bg-green-200 text-green-800 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">Active Now</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-medium">{item.activity}</p>
              </div>

              <div className="text-right">
                <p className="text-slate-800 font-black text-sm">{item.month}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Target Period</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Pro Farming Tip</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
            Temperatures are dropping. For wheat, ensure the second irrigation (CRI stage) happens exactly 21-25 days after sowing for maximum yield.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 text-9xl -mb-8 -mr-8 opacity-10 rotate-12">🌾</div>
      </div>
    </div>
  );
}
