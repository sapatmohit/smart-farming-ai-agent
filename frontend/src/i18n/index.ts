import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

export type Locale = 'en' | 'hi' | 'mr';

export const locales: Record<Locale, typeof en> = {
  en,
  hi,
  mr,
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  mr: 'मराठी (Marathi)',
};

export function getTranslations(locale: Locale) {
  return locales[locale] || locales.en;
}

export function getStoredLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale');
    if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
      return stored as Locale;
    }
  }
  return 'en';
}

export function setStoredLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}
