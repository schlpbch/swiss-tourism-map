/**
 * API functions for resorts - using MCP protocol
 */

import { callTool } from './mcp-client';
import type { Resort } from '../types/resort';

export interface ResortsSearchParams {
  season?: string;
  region?: string;
  activities?: string[];
  min_elevation?: number;
  max_elevation?: number;
  limit?: number;
}

interface McpResortsResponse {
  season_filter: string;
  region_filter: string;
  results_count: number;
  results: Resort[];
}

/**
 * Search resorts with filters via MCP
 */
export async function searchResorts(params: ResortsSearchParams = {}): Promise<Resort[]> {
  const result = await callTool<McpResortsResponse>('tourism__search_resorts', {
    season: params.season || '',
    activities: params.activities || [],
    region: params.region || '',
    min_elevation: params.min_elevation,
    max_elevation: params.max_elevation,
    limit: params.limit || 100,
  });

  return result.results || [];
}

/**
 * Get all resorts via MCP
 */
export async function getResorts(): Promise<Resort[]> {
  const result = await callTool<McpResortsResponse>('tourism__search_resorts', {
    limit: 500,
  });

  // Enhance resorts with Phase 3 details
  return (result.results || []).map((resort, index) => enrichResortData(resort, index));
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number = 0): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

/**
 * Enrich resort data with Phase 3 details (vertical drop, lifts, runs, etc.)
 * Uses deterministic seeded random based on resort name for consistent values.
 */
function enrichResortData(resort: Resort, index: number): Resort {
  const seed = hashString(resort.name);
  const isHighElevation = resort.elevation > 2000;

  return {
    ...resort,
    maxElevation:
      resort.elevation +
      (isHighElevation
        ? Math.floor(seededRandom(seed, 0) * 1500) + 500
        : Math.floor(seededRandom(seed, 0) * 800) + 200),
    verticalDrop: isHighElevation
      ? Math.floor(seededRandom(seed, 1) * 1200) + 800
      : Math.floor(seededRandom(seed, 1) * 600) + 300,
    lifts: isHighElevation
      ? Math.floor(seededRandom(seed, 2) * 30) + 15
      : Math.floor(seededRandom(seed, 2) * 15) + 5,
    difficulty: (['easy', 'intermediate', 'difficult'] as const)[seed % 3],
    runs: {
      total: isHighElevation
        ? Math.floor(seededRandom(seed, 3) * 100) + 80
        : Math.floor(seededRandom(seed, 3) * 40) + 20,
      beginner: Math.floor(seededRandom(seed, 4) * 30) + 10,
      intermediate: Math.floor(seededRandom(seed, 5) * 40) + 20,
      advanced: Math.floor(seededRandom(seed, 6) * 30) + 10,
    },
    bestFor: generateBestFor(seed),
    amenities: generateAmenities(seed),
    familyFriendly: !isHighElevation || seededRandom(seed, 7) > 0.3,
    description: generateDescription(resort.name, resort.region),
    seasonDetails: resort.seasonDetails || {
      winter: {
        skiArea: `${resort.name} Skigebiet`,
        months: ['Dezember', 'Januar', 'Februar', 'Maerz'],
      },
      summer: {
        hikingTrails: Math.floor(seededRandom(seed, 8) * 50) + 20,
        months: ['Juni', 'Juli', 'August', 'September'],
      },
    },
  };
}

function generateBestFor(seed: number): string[] {
  const options = ['Anfaenger', 'Familien', 'Profis', 'Snowboarder', 'Wanderer'];
  return options.filter((_, i) => seededRandom(seed, 10 + i) > 0.4).slice(0, 3);
}

function generateAmenities(seed: number): string[] {
  const all = [
    'Restaurant',
    'Cafe',
    'Unterkunft',
    'Parkplatz',
    'Shop',
    'Skischule',
    'Kinderhort',
    'Wellness',
    'Lounge',
  ];
  return all.filter((_, i) => seededRandom(seed, 20 + i) > 0.4);
}

function generateDescription(name: string, region: string): string {
  const descriptions: Record<string, string> = {
    'Adelboden-Lenk':
      'Eines der größten zusammenhängenden Skigebiete der Schweiz mit vielfältigen Pisten für alle Niveaus.',
    'Aletsch Arena':
      'Modernes Skigebiet mit herrlichem Blick auf den Aletsch-Gletscher und umfangreichen Infrastrukturen.',
    'Appenzell Alps':
      'Traditionelles Skigebiet mit gemütlicher Atmosphäre und familiärer Ausstrahlung.',
    Andermatt: 'Legendäres Schneeloch mit Tiefschneeabfahrten und modernem Liftsystem.',
  };
  return (
    descriptions[name] ||
    `Das ${name} Skigebiet ist ein beliebtes Ziel für Winter- und Sommersport in der ${region} Region.`
  );
}

/**
 * Get a single resort by name
 */
export async function getResort(name: string): Promise<Resort> {
  const results = await callTool<McpResortsResponse>('tourism__search_resorts', {
    query: name,
    limit: 1,
  });

  if (results.results && results.results.length > 0) {
    return results.results[0];
  }

  throw new Error(`Resort not found: ${name}`);
}

/**
 * Search resorts near a location
 * Note: Using find_resorts_near_sight as a workaround
 */
export async function searchResortsNear(
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  limit: number = 20
): Promise<Resort[]> {
  // For now, just get all resorts and filter client-side
  // The MCP server doesn't have a direct "near location" endpoint for resorts
  const allResorts = await getResorts();

  // Calculate distance and filter
  const nearbyResorts = allResorts.filter((resort) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      resort.coordinates.latitude,
      resort.coordinates.longitude
    );
    return distance <= radiusKm;
  });

  return nearbyResorts.slice(0, limit);
}

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
