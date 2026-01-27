import { describe, it, expect } from 'vitest';
import { t } from '../../src/i18n/index';

describe('i18n loader', () => {
  it('returns German title by default', () => {
    expect(t('de' as any, 'title')).toBe('Schweizer Tourismus Karte');
  });

  it('falls back to english key when missing', () => {
    // using a non-existing key should return the key itself or english fallback
    expect(t('de' as any, 'nonexistent_key')).toBe('nonexistent_key');
  });
});
