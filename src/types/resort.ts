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
