// Simple i18n loader for Astro/React
export type Lang = 'de' | 'en' | 'fr' | 'it' | 'hi' | 'zh';

export const supportedLangs: Lang[] = ['de', 'en', 'fr', 'it', 'hi', 'zh'];

const translations: Record<Lang, Record<string, string>> = {
  de: require('./de.json'),
  en: require('./en.json'),
  fr: require('./fr.json'),
  it: require('./it.json'),
  hi: require('./hi.json'),
  zh: require('./zh.json'),
};

export function t(lang: Lang, key: string): string {
  return translations[lang]?.[key] || translations['en'][key] || key;
}

export function keys(lang: Lang): string[] {
  return Object.keys(translations[lang] || {});
}

export function hasKey(lang: Lang, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(translations[lang] || {}, key);
}
