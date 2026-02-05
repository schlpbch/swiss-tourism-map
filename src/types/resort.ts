/**
 * Resort type definitions
 * Types match the MCP server's format_resort_summary response
 */

export interface Resort {
  name: string;
  region: string;
  elevation: number; // meters above sea level
  seasons: Season[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  website?: string; // Official website URL
  url?: string; // Alternative URL field

  // Phase 2: Enhanced details
  description?: string; // Resort description text
  activities?: string[]; // Available activities (e.g., 'Skiing', 'Hiking')
  seasonDetails?: { // Enhanced season information
    winter?: WinterSeason;
    spring?: SpringSeason;
    summer?: SummerSeason;
    autumn?: AutumnSeason;
  };

  // Phase 3: Additional resort details
  difficulty?: 'easy' | 'intermediate' | 'difficult'; // Overall difficulty level
  verticalDrop?: number; // Vertical drop in meters (for ski resorts)
  runs?: {
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  lifts?: number; // Number of ski lifts
  bestFor?: string[]; // Categories like "beginners", "families", "experts"
  amenities?: string[]; // Available amenities (restaurants, lodging, etc.)
  familyFriendly?: boolean;
  maxElevation?: number; // Peak elevation in meters
}

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface WinterSeason {
  skiArea?: string;
  months?: string[];
}

export interface SpringSeason {
  months?: string[];
}

export interface SummerSeason {
  months?: string[];
  hikingTrails?: number;
}

export interface AutumnSeason {
  months?: string[];
}

/**
 * Resort season constants
 */
export const SEASONS: Season[] = ['winter', 'spring', 'summer', 'autumn'];

export const SEASON_LABELS = {
  winter: 'Winter',
  spring: 'Frühling',
  summer: 'Sommer',
  autumn: 'Herbst',
} as const;

/**
 * Phase 2: Resort activities
 */
export const RESORT_ACTIVITIES = [
  'Skiing',
  'Snowboarding',
  'Cross-Country Skiing',
  'Hiking',
  'Mountain Biking',
  'Climbing',
  'Wellness',
  'Family',
  'Alpine Touring',
  'Paragliding',
] as const;

export type ResortActivity = typeof RESORT_ACTIVITIES[number];
