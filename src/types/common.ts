/**
 * Common type definitions for Swiss Tourism Map application
 */

export interface MultilingualText {
  en?: string;
  de?: string;
  fr?: string;
  it?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Prominence {
  score: number; // 0-100
  tier: 'iconic' | 'major' | 'notable' | 'hidden-gem';
  description?: string;
}

export interface MediaLinks {
  homepageUrl?: string | MultilingualText;
  imageUrl?: string;
  homepageUrl_multilingual?: MultilingualText;
}

export interface VisitInfo {
  recommendedDuration?: string;
  bestMonths?: string[];
}

export interface AgeSuitability {
  minAge?: number;
  bestFor?: string[] | string;
  flags?: string[];
  note?: string;
}

export interface VisitorSupport {
  mobilityAccess?: {
    status?: string;
    details?: string;
  };
  petPolicy?: {
    status?: string;
    details?: string;
  };
  ageSuitability?: AgeSuitability;
}

/**
 * Helper function to get text in a specific language with fallback
 */
export function getLocalizedText(
  text: MultilingualText | string | undefined,
  language: 'de' | 'en' | 'fr' | 'it' = 'de'
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[language] || text.de || text.en || text.fr || text.it || '';
}

/**
 * Language type
 */
export type Language = 'de' | 'en' | 'fr' | 'it';
