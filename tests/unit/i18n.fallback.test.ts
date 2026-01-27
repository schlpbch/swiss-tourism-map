import { describe, it, expect } from 'vitest';
import { t, supportedLangs } from '../../src/i18n/index';

describe('i18n fallback and supported languages', () => {
  it('supports expected languages', () => {
    expect(supportedLangs).toEqual(expect.arrayContaining(['de', 'en', 'fr', 'it', 'hi', 'zh']));
  });

  it('falls back to english when key missing in target language', () => {
    // Use a key that exists in English but not in German
    const englishOnlyKey = 'test_fallback_key';
    const deVal = t('de' as any, englishOnlyKey);
    const enVal = t('en' as any, englishOnlyKey);
    expect(deVal).toBe(enVal);
    expect(deVal).toBe('English fallback value');
  });

  it('returns key when missing in both target and english', () => {
    const key = 'definitely_missing_key_xyz';
    expect(t('fr' as any, key)).toBe(key);
  });
});
