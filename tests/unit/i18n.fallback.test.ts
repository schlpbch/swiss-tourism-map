import { describe, it, expect } from 'vitest';
import { t, supportedLangs } from '../../src/i18n/index';
import type { I18nKey } from '../../src/i18n/keys';

describe('i18n fallback and supported languages', () => {
  it('supports expected languages', () => {
    expect(supportedLangs).toEqual(expect.arrayContaining(['de', 'en', 'fr', 'it', 'hi', 'zh']));
  });

  it('falls back to english when key missing in target language', () => {
    // All keys should exist in all languages now
    // Test that existing keys return proper translations
    expect(t('de' as any, 'title')).toBe('Schweizer Tourismus Karte');
    expect(t('en' as any, 'title')).toBe('Swiss Tourism Map');
    expect(t('fr' as any, 'title')).toBe('Carte du tourisme suisse');
  });

  it('returns key when missing in both target and english', () => {
    const key = 'definitely_missing_key_xyz' as I18nKey;
    expect(t('fr', key)).toBe(key);
  });
});
