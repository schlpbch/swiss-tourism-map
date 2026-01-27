/**
 * RailAway product type definitions
 */

import type { MultilingualText, MediaLinks } from './common';

export interface RailAwayProduct {
  id?: string;
  title?: string | MultilingualText;
  description?: string | MultilingualText;
  category?: RailAwayCategory;
  discount?: {
    type?: string;
    value?: number;
    description?: string | MultilingualText;
  };
  location?: {
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  visitInfo?: {
    recommendedDuration?: string;
    bestMonths?: string[];
    accessibility?: string;
  };
  targetAudience?: string[];
  bookingInfo?: {
    howtoBuyUrl?: string | MultilingualText;
    redeemInstructions?: string | MultilingualText;
  };
  media?: MediaLinks;
}

/**
 * RailAway product categories
 */
export const RAILAWAY_CATEGORIES = [
  'Animal\'n\'Rail',
  'Art\'n\'Rail',
  'Culture\'n\'Rail',
  'Family\'n\'Rail',
  'Mountain\'n\'Rail',
  'Museum\'n\'Rail',
  'Nature\'n\'Rail',
  'Sport\'n\'Rail',
  'Water\'n\'Rail',
  'Wellness\'n\'Rail',
] as const;

export type RailAwayCategory = typeof RAILAWAY_CATEGORIES[number];
