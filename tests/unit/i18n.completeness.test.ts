import { describe, it, expect } from 'vitest';
import de from '../../src/i18n/de.json';
import en from '../../src/i18n/en.json';
import fr from '../../src/i18n/fr.json';
import itLang from '../../src/i18n/it.json';
import hi from '../../src/i18n/hi.json';
import zh from '../../src/i18n/zh.json';

function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return flattenKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const languages = { de, en, fr, it: itLang, hi, zh };
const referenceKeys = flattenKeys(en).sort();

describe('i18n completeness', () => {
  Object.entries(languages).forEach(([lang, translations]) => {
    it(`${lang} has all keys from English reference`, () => {
      const langKeys = flattenKeys(translations).sort();
      const missingKeys = referenceKeys.filter((key) => !langKeys.includes(key));
      expect(missingKeys, `Missing keys in ${lang}: ${missingKeys.join(', ')}`).toEqual([]);
    });

    it(`${lang} has no extra keys beyond English reference`, () => {
      const langKeys = flattenKeys(translations).sort();
      const extraKeys = langKeys.filter((key) => !referenceKeys.includes(key));
      expect(extraKeys, `Extra keys in ${lang}: ${extraKeys.join(', ')}`).toEqual([]);
    });
  });
});
