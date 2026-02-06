import { describe, it, expect } from 'vitest';
import { supportedLangs, hasKey, t } from '../../src/i18n/index';
import type { I18nKey } from '../../src/i18n/keys';

describe('i18n translation files', () => {
  it('each supported language contains required keys', () => {
    const requiredKeys = ['title', 'subtitle', 'tagline', 'language', 'loading', 'error'];

    for (const lang of supportedLangs) {
      for (const key of requiredKeys) {
        expect(hasKey(lang as any, key)).toBe(true);
      }
    }
  });

  it('each supported language contains navigation keys', () => {
    const navKeys = ['nav.map', 'nav.sights', 'nav.resorts', 'nav.products'];

    for (const lang of supportedLangs) {
      for (const key of navKeys) {
        const value = t(lang as any, key as I18nKey);
        expect(value).not.toBe(key); // Should be translated, not just return the key
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it('all six languages are supported', () => {
    expect(supportedLangs).toEqual(['de', 'en', 'fr', 'it', 'hi', 'zh']);
    expect(supportedLangs).toHaveLength(6);
  });
});
