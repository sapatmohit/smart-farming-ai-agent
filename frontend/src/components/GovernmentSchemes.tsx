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
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="Search schemes, subsidies, or categories..." 
            className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <div className="flex gap-2">
          {['All', 'Subsidies', 'Loans', 'Insurance'].map(filter => (
            <button key={filter} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-100">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((scheme, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm card-hover flex flex-col">
            <div className="mb-6">
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest mb-2 inline-block">
                {scheme.category}
              </span>
              <h3 className="text-xl font-black text-slate-800 leading-tight">{scheme.title}</h3>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Key Benefit</p>
                <p className="text-slate-700 font-semibold">{scheme.benefit}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Eligibility</p>
                <p className="text-slate-500 text-sm">{scheme.eligibility}</p>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              Learn How to Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
