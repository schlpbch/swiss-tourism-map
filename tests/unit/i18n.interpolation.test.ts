import { describe, it, expect } from 'vitest';
import { t, type Lang } from '../../src/i18n/index';

describe('i18n parameter interpolation', () => {
  it('interpolates single parameter', () => {
    const result = t('en' as Lang, 'map.elevation', { elevation: '1500' });
    expect(result).toBe('Elevation: 1500m');
  });

  it('interpolates multiple parameters', () => {
    const result = t('en' as Lang, 'map.sightsCount', { displayed: '10', total: '50' });
    expect(result).toBe('10 of 50 sights');
  });

  it('interpolates numeric values', () => {
    const result = t('en' as Lang, 'map.resortsCount', { count: 25 });
    expect(result).toBe('25 resorts');
  });

  it('returns untouched string when no params needed', () => {
    const result = t('en' as Lang, 'products.bookNow');
    expect(result).toBe('Book now');
  });

  it('works across multiple languages with same params', () => {
    const params = { value: '20' };
    expect(t('en' as Lang, 'products.discountOff', params)).toBe('20% off');
    expect(t('de' as Lang, 'products.discountOff', params)).toBe('20% Rabatt');
    expect(t('fr' as Lang, 'products.discountOff', params)).toBe('20% de réduction');
    expect(t('it' as Lang, 'products.discountOff', params)).toBe('20% di sconto');
  });

  it('replaces all occurrences of the same parameter', () => {
    // If a key uses the same param twice, both should be replaced
    const result = t('en' as Lang, 'resorts.elevationRange', { min: '800', max: '3000' });
    expect(result).toBe('Elevation: 800m - 3000m');
  });

  it('leaves unmatched placeholders untouched', () => {
    const result = t('en' as Lang, 'map.sightsCount', { displayed: '5' });
    // {total} not provided, so it stays as-is
    expect(result).toBe('5 of {total} sights');
  });
});
