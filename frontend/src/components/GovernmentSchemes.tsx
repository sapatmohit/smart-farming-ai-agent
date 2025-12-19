'use client';

import React, { useState } from 'react';
import { Locale } from '@/i18n';

interface Scheme {
  title: string;
  category: string;
  benefit: string;
  eligibility: string;
}

const SCHEMES: Scheme[] = [
  { 
    title: 'PM-Kisan Samman Nidhi', 
    category: 'Direct Income Support', 
    benefit: '₹6,000 per year in 3 installments', 
    eligibility: 'All landholding farmer families' 
  },
  { 
    title: 'PM Fasal Bima Yojana', 
    category: 'Crop Insurance', 
    benefit: 'Full insurance coverage against failure', 
    eligibility: 'All farmers including sharecroppers' 
  },
  { 
    title: 'Kisan Credit Card (KCC)', 
    category: 'Credit & Loans', 
    benefit: 'Low-interest loans up to ₹3 Lakh', 
    eligibility: 'Individual/Joint land owners' 
  },
  { 
    title: 'Soil Health Card Scheme', 
    category: 'Soil Testing', 
    benefit: 'Free soil nutrient assessment', 
    eligibility: 'Periodic testing for all farmers' 
  },
];

export default function GovernmentSchemes({ locale }: { locale: Locale }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = SCHEMES.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Search Header */}
      <div className="glass p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <input 
            type="text" 
            placeholder="Search schemes, subsidies, or categories..." 
            className="w-full bg-slate-50/50 border border-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 font-medium transition-all focus:bg-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">🔍</span>
        </div>
        <div className="flex gap-2">
          {['All', 'Subsidies', 'Loans', 'Insurance'].map(filter => (
            <button key={filter} className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-green-50 hover:text-green-700 border border-slate-200 transition-all active:scale-95 bg-white/50">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((scheme, idx) => (
          <div key={idx} className="glass-card p-8 rounded-3xl card-hover flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-yellow-400/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            
            <div className="mb-6 relative z-10">
              <span className="bg-amber-100/80 backdrop-blur-sm text-amber-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest mb-3 inline-block border border-amber-200 shadow-sm">
                {scheme.category}
              </span>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">{scheme.title}</h3>
            </div>
            
            <div className="space-y-5 mb-8 flex-1 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-lg shadow-sm border border-green-100">💰</div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Key Benefit</p>
                  <p className="text-slate-800 font-bold">{scheme.benefit}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-lg shadow-sm border border-blue-100">📝</div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Eligibility</p>
                  <p className="text-slate-600 text-sm font-medium">{scheme.eligibility}</p>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 relative z-10 flex items-center justify-center gap-2">
              <span>Learn How to Apply</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
