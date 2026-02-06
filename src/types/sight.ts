/**
 * Sight (tourist attraction) type definitions
 * Types match the MCP server's format_sight_summary response
 */

import type { Prominence } from './common';

export interface Sight {
  id: string;
  title: string; // Pre-extracted in requested language
  description: string; // Pre-extracted in requested language
  category: string[]; // 24 categories: nature, museum, alpine, etc.
  region?: string; // Pre-extracted in requested language
  location: {
    latitude: number;
    longitude: number;
  };
  tags?: string[]; // 70 atmospheric tags
  prominence?: Prominence;
  website?: string; // Official website URL
  url?: string; // Alternative URL field
}

/**
 * Sight categories (24 types)
 */
export const SIGHT_CATEGORIES = [
  'adventure',
  'alpine',
  'art',
  'cultural',
  'education',
  'family',
  'food',
  'historic',
  'leisure',
  'luxury',
  'museum',
  'music',
  'nature',
  'recreation',
  'religious',
  'scenic',
  'shopping',
  'sports',
  'transport',
  'urban',
  'water_park',
  'waterfront',
  'wellness',
  'zoo',
] as const;

export type SightCategory = (typeof SIGHT_CATEGORIES)[number];

/**
 * Prominence tiers
 */
export const PROMINENCE_TIERS = {
  iconic: { min: 90, max: 100, label: 'Ikonisch', color: '#EF4444' },
  major: { min: 70, max: 89, label: 'Bedeutend', color: '#F59E0B' },
  notable: { min: 40, max: 69, label: 'Bemerkenswert', color: '#3B82F6' },
  'hidden-gem': { min: 0, max: 39, label: 'Geheimtipp', color: '#6B7280' },
} as const;

export type ProminenceTier = keyof typeof PROMINENCE_TIERS;
