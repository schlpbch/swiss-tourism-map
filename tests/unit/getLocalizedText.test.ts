import { describe, it, expect } from 'vitest';
import { getLocalizedText } from '../../src/types/common';

describe('getLocalizedText', () => {
  it('returns empty string for undefined input', () => {
    expect(getLocalizedText(undefined)).toBe('');
  });

  it('returns plain string as-is', () => {
    expect(getLocalizedText('hello')).toBe('hello');
  });

  it('returns the requested language from a multilingual object', () => {
    const text = { de: 'Hallo', en: 'Hello', fr: 'Bonjour', it: 'Ciao' };
    expect(getLocalizedText(text, 'en')).toBe('Hello');
    expect(getLocalizedText(text, 'fr')).toBe('Bonjour');
    expect(getLocalizedText(text, 'it')).toBe('Ciao');
    expect(getLocalizedText(text, 'de')).toBe('Hallo');
  });

  it('falls back to de when requested language is missing', () => {
    const text = { de: 'Hallo' };
    expect(getLocalizedText(text, 'fr')).toBe('Hallo');
  });

  it('falls back to en when de is also missing', () => {
    const text = { en: 'Hello' };
    expect(getLocalizedText(text, 'fr')).toBe('Hello');
  });

  it('falls back through chain: requested → de → en → fr → it', () => {
    expect(getLocalizedText({ it: 'Ciao' }, 'en')).toBe('Ciao');
    expect(getLocalizedText({ fr: 'Bonjour' }, 'en')).toBe('Bonjour');
  });

  it('returns empty string for empty multilingual object', () => {
    expect(getLocalizedText({})).toBe('');
  });

  it('defaults to de when no language parameter is provided', () => {
    const text = { de: 'Standard', en: 'Default' };
    expect(getLocalizedText(text)).toBe('Standard');
  });
});
