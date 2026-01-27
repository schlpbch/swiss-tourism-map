// Simple i18n loader for Astro/React with ES modules
import deTranslations from './de.json';
import enTranslations from './en.json';
import frTranslations from './fr.json';
import itTranslations from './it.json';
import hiTranslations from './hi.json';
import zhTranslations from './zh.json';

export type Lang = 'de' | 'en' | 'fr' | 'it' | 'hi' | 'zh';

export const supportedLangs: Lang[] = ['de', 'en', 'fr', 'it', 'hi', 'zh'];

export const languageNames: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  hi: 'हिन्दी',
  zh: '中文',
};

const translations: Record<Lang, Record<string, any>> = {
  de: deTranslations,
  en: enTranslations,
  fr: frTranslations,
  it: itTranslations,
  hi: hiTranslations,
  zh: zhTranslations,
};

/**
 * Translate a key to the given language
 * Supports nested keys with dot notation (e.g., 'nav.map')
 * Falls back to English if key not found, then returns the key itself
 */
export function t(lang: Lang, key: string): string {
  // Handle nested keys with dot notation
  const keys = key.split('.');
  let value: any = translations[lang];

  // Try to get value from target language
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, try English fallback
      value = translations['en'];
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return the key itself if not found in both
        }
      }
      return typeof value === 'string' ? value : key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Get all translation keys for a language
 */
export function keys(lang: Lang): string[] {
  return Object.keys(translations[lang] || {});
}

/**
 * Check if a key exists in a language
 */
export function hasKey(lang: Lang, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(translations[lang] || {}, key);
}

/**
 * Get the default language from URL query param, localStorage, browser, or fallback
 * Priority: URL query param > localStorage > browser language > default (de)
 */
export function getDefaultLang(): Lang {
  if (typeof window === 'undefined') return 'de';

  // Check URL query parameter first (?lang=fr)
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang') as Lang | null;
  if (langParam && supportedLangs.includes(langParam)) {
    return langParam;
  }

  // Check localStorage
  const stored = localStorage.getItem('language') as Lang | null;
  if (stored && supportedLangs.includes(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase().split('-')[0];
  if (supportedLangs.includes(browserLang as Lang)) {
    return browserLang as Lang;
  }

  return 'de';
}

/**
 * Save language preference to localStorage
 */
export function setLang(lang: Lang): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}
