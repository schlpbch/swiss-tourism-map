import { describe, it, expect } from 'vitest';
import { t, supportedLangs, type Lang } from '../../src/i18n/index';
import type { I18nKey } from '../../src/i18n/keys';

describe('i18n product keys consistency', () => {
  const productKeys = [
    'products.railaway',
    'products.travelSystem',
    'products.holidays',
    'products.noProductsFound',
    'products.duration',
    'products.maxPrice',
    'products.bookNow',
    'products.discount',
    'products.discountOff',
    'products.location',
    'products.recommendedDuration',
    'products.bestMonths',
    'products.accessibility',
    'products.targetAudience',
    'products.benefits',
    'products.coverage',
    'products.restrictions',
    'products.validity',
    'products.validUntil',
    'products.youthPrice',
    'products.childFree',
    'products.consecutive',
    'products.perMonth',
    'products.included',
    'products.bestFor',
    'products.perPerson',
    'products.accommodation',
    'products.secondClass',
    'products.firstClass',
  ];

  for (const lang of supportedLangs) {
    it(`all product keys exist in ${lang}`, () => {
      for (const key of productKeys) {
        const value = t(lang as Lang, key as I18nKey);
        expect(value, `Missing key "${key}" in ${lang}`).not.toBe(key);
        expect(value.length, `Empty value for "${key}" in ${lang}`).toBeGreaterThan(0);
      }
    });
  }

  it('discountOff interpolates value correctly', () => {
    const result = t('en' as Lang, 'products.discountOff', { value: '30' });
    expect(result).toBe('30% off');
  });

  it('validUntil interpolates date correctly', () => {
    const result = t('en' as Lang, 'products.validUntil', { date: '2026-12-31' });
    expect(result).toBe('until 2026-12-31');
  });

  const commonKeys = [
    'common.search',
    'common.filter',
    'common.resetFilter',
    'common.all',
    'common.from',
    'common.days',
    'common.nights',
    'common.category',
    'common.allCategories',
    'common.region',
    'common.allRegions',
    'common.noResults',
    'common.familyFriendly',
  ];

  for (const lang of supportedLangs) {
    it(`all common keys exist in ${lang}`, () => {
      for (const key of commonKeys) {
        const value = t(lang as Lang, key as I18nKey);
        expect(value, `Missing key "${key}" in ${lang}`).not.toBe(key);
      }
    });
  }
});
