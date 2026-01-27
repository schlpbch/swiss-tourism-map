/**
 * Filter type definitions
 */

import type { Season } from './resort';
import type { SightCategory } from './sight';
import type { RailAwayCategory } from './railaway';
import type { Language } from './common';

export interface FilterState {
  // Common filters
  searchQuery: string;
  language: Language;

  // Sight filters
  categories: SightCategory[];
  tags: string[];
  region: string;
  prominenceRange: [number, number];

  // Resort filters
  seasons: Season[];
  minElevation?: number;
  maxElevation?: number;

  // RailAway filters
  railawayCategory?: RailAwayCategory;

  // Travel System filters
  travelSystemCategory?: string;
  maxPrice?: number;
  minDays?: number;
  maxDays?: number;

  // Holiday package filters
  holidayCategory?: string;
  holidayRegion?: string;
  holidayMaxPrice?: number;
  difficulty?: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  language: 'de',
  categories: [],
  tags: [],
  region: '',
  prominenceRange: [0, 100],
  seasons: [],
};
