/**
 * API functions for sights - using MCP protocol
 */

import { callTool } from './mcp-client';
import type { Sight } from '../types/sight';
import type { Language } from '../types/common';

export interface SightsSearchParams {
  query?: string;
  categories?: string[];
  tags?: string[];
  region?: string;
  min_prominence?: number;
  max_prominence?: number;
  prominence_tier?: string; // 'iconic' | 'major' | 'notable' | 'hidden-gem'
  limit?: number;
  language?: Language;
}

interface McpSightsResponse {
  query: string;
  language: string;
  results_count: number;
  results: Sight[];
}

/**
 * Search sights with filters via MCP
 */
export async function searchSights(params: SightsSearchParams = {}): Promise<Sight[]> {
  const result = await callTool<McpSightsResponse>('tourism__search_sights', {
    query: params.query || '',
    language: params.language || 'de',
    categories: params.categories || [],
    tags: params.tags || [],
    region: params.region || '',
    min_prominence: params.min_prominence,
    max_prominence: params.max_prominence,
    limit: params.limit || 1000,
  });

  return result.results || [];
}

/**
 * Get a single sight by ID via MCP
 */
export async function getSight(id: string, language: Language = 'de'): Promise<Sight> {
  const result = await callTool<{ sight: Sight }>('tourism__get_sight_by_id', {
    sight_id: id,
    language,
  });

  return result.sight;
}

interface McpNearLocationResponse {
  location: { latitude: number; longitude: number };
  radius_km: number;
  results_count: number;
  results: Array<Sight & { distance_km: number }>;
}

/**
 * Search sights near a location via MCP
 */
export async function searchSightsNear(
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  limit: number = 50,
  language: Language = 'de'
): Promise<Sight[]> {
  const result = await callTool<McpNearLocationResponse>('tourism__find_sights_near_location', {
    latitude,
    longitude,
    radius_km: radiusKm,
    limit,
    language,
  });

  return result.results || [];
}

/**
 * Get available sight categories
 */
export async function getSightCategories(): Promise<string[]> {
  const result = await callTool<{ categories: string[] }>('tourism__list_product_categories', {
    product_type: 'sight',
  });
  return result.categories || [];
}

/**
 * Get available sight tags
 */
export async function getSightTags(): Promise<string[]> {
  // Tags are part of the sight search, get them from a sample search
  const sights = await searchSights({ limit: 100 });
  const tagsSet = new Set<string>();
  sights.forEach(sight => {
    sight.tags?.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}
