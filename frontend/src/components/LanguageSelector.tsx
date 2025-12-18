'use client';

import { Locale, localeNames } from '@/i18n';

interface LanguageSelectorProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageSelector({ locale, onChange }: LanguageSelectorProps) {
  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer hover:border-green-400 transition-colors"
      >
        {(Object.keys(localeNames) as Locale[]).map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
