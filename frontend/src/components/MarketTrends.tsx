'use client';

import React from 'react';
import { Locale } from '@/i18n';

interface PricePoint {
  date: string;
  price: number;
}

interface CropData {
  name: string;
  nameLocal: string;
  currentPrice: number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  history: PricePoint[];
}

const MARKET_DATA: Record<string, CropData[]> = {
  en: [
    { 
      name: 'Wheat', nameLocal: 'गेहूं', currentPrice: 2275, change: '+2.5%', trend: 'up',
      history: [{date: '10 Dec', price: 2150}, {date: '12 Dec', price: 2180}, {date: '14 Dec', price: 2200}, {date: '16 Dec', price: 2240}, {date: '18 Dec', price: 2275}]
    },
    { 
      name: 'Onion', nameLocal: 'प्याज', currentPrice: 1850, change: '-1.2%', trend: 'down',
      history: [{date: '10 Dec', price: 1950}, {date: '12 Dec', price: 1920}, {date: '14 Dec', price: 1900}, {date: '16 Dec', price: 1880}, {date: '18 Dec', price: 1850}]
    },
    { 
      name: 'Tomato', nameLocal: 'टमाटर', currentPrice: 1650, change: '+5.8%', trend: 'up',
      history: [{date: '10 Dec', price: 1400}, {date: '12 Dec', price: 1450}, {date: '14 Dec', price: 1520}, {date: '16 Dec', price: 1600}, {date: '18 Dec', price: 1650}]
    },
  ]
};

export default function MarketTrends({ locale }: { locale: Locale }) {
  const data = MARKET_DATA.en; // Simplification for MVP

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((crop, idx) => (
          <div key={crop.name} className="glass-card p-6 rounded-3xl card-hover relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-green-400/20"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none mb-2">
                  {locale === 'en' ? crop.name : crop.nameLocal}
                </p>
                <h3 className="text-3xl font-black text-slate-800">₹{crop.currentPrice.toLocaleString()}</h3>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                crop.trend === 'up' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                {crop.change}
              </span>
            </div>
            
            {/* Simple SVG Chart */}
            <div className="h-16 w-full mt-4 filter drop-shadow-sm">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <path 
                  d={`M 0 35 ${crop.history.map((p, i) => `L ${i * 25} ${35 - (p.price - 1400) / 25}`).join(' ')}`}
                  fill="none" 
                  stroke={crop.trend === 'up' ? '#16a34a' : '#e11d48'} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <defs>
                   <linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor={crop.trend === 'up' ? '#16a34a' : '#e11d48'} stopOpacity={0.2} />
                     <stop offset="100%" stopColor="transparent" />
                   </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analysis Table */}
      <div className="glass rounded-3xl overflow-hidden shadow-lg">
        <div className="px-8 py-6 border-b border-white/20 flex justify-between items-center bg-white/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/50 rounded-lg">📊</div>
             <h3 className="font-bold text-slate-800 text-lg">Region: Maharashtra Mandis</h3>
          </div>
          <button className="text-green-700 text-sm font-bold hover:bg-white/50 px-4 py-2 rounded-xl transition-all">View All Mandis →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/20 border-b border-white/10">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Commodity</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mandi Name</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Min Price</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Max Price</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival (Qt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {[
                { name: 'Wheat', mandi: 'Pune', min: 2150, max: 2350, arrival: 450 },
                { name: 'Onion', mandi: 'Lasalgaon', min: 1400, max: 1950, arrival: 12500 },
                { name: 'Tomato', mandi: 'Nashik', min: 1450, max: 1800, arrival: 1800 },
                { name: 'Soybean', mandi: 'Latur', min: 4200, max: 4800, arrival: 3200 },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/40 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-700">{row.name}</td>
                  <td className="px-8 py-5 text-slate-600 font-medium">{row.mandi}</td>
                  <td className="px-8 py-5 font-mono text-slate-600">₹{row.min}</td>
                  <td className="px-8 py-5 font-mono text-green-700 font-bold">₹{row.max}</td>
                  <td className="px-8 py-5">
                    <span className="bg-white/50 border border-white/40 text-slate-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {row.arrival}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
