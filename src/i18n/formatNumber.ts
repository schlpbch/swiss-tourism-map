import type { Lang } from './index';

const localeMap: Record<Lang, string> = {
  de: 'de-CH',
  en: 'en-CH',
  fr: 'fr-CH',
  it: 'it-CH',
  hi: 'hi-IN',
  zh: 'zh-CN',
};

export function formatPrice(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(localeMap[lang], {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(localeMap[lang]).format(value);
}
