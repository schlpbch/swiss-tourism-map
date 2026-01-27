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

  return result.results || [];
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
  const nearbyResorts = allResorts.filter(resort => {
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
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
