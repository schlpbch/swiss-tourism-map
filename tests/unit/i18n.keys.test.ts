import { describe, it, expect } from 'vitest';
import { supportedLangs, hasKey } from '../../src/i18n/index';

describe('i18n translation files', () => {
  it('each supported language contains title and subtitle', () => {
    for (const lang of supportedLangs) {
      expect(hasKey(lang as any, 'title')).toBe(true);
      expect(hasKey(lang as any, 'subtitle')).toBe(true);
    }
  });
});
