/**
 * API functions for tourism products - using MCP protocol
 */

import { callTool } from './mcp-client';

// Types for Travel System products
export interface TravelSystemProduct {
  id: string;
  name: string;
  title: string;
  category: string;
  duration: {
    days: number;
    type: string;
  };
  pricing: {
    currency: string;
    adult_2nd?: number;
    adult_1st?: number;
    child_2nd?: number;
    child_1st?: number;
  };
  features: string[];
}

// Types for Holiday products
export interface HolidayProduct {
  id: string;
  name: string;
  category: string;
  duration: {
    days: number;
    nights?: number;
  };
  price: {
    from: number;
    currency: string;
  };
  region: string;
  difficulty_level: string;
  highlights: string[];
}

// Types for RailAway products (simplified for display)
export interface RailAwayProductDisplay {
  title: string;
  category: string;
  description: string;
}

interface McpTravelSystemResponse {
  category_filter: string;
  price_filter: number | null;
  duration_filter: { min_days: number | null; max_days: number | null };
  results_count: number;
  results: TravelSystemProduct[];
}

interface McpHolidayResponse {
  query: string;
  filters: Record<string, unknown>;
  results_count: number;
  total_products: number;
  results: HolidayProduct[];
}

interface McpTravelSystemCategoriesResponse {
  total_categories: number;
  categories: Array<{
    category: string;
    product_count: number;
  }>;
  total_products: number;
}

interface McpHolidayCategoriesResponse {
  total_categories: number;
  categories: Array<{
    category: string;
    product_count: number;
  }>;
  total_products: number;
}

/**
 * Search Travel System products via MCP
 */
export async function searchTravelSystem(params: {
  query?: string;
  category?: string;
  max_price?: number;
  min_days?: number;
  max_days?: number;
  limit?: number;
  language?: string;
} = {}): Promise<TravelSystemProduct[]> {
  const result = await callTool<McpTravelSystemResponse>('tourism__search_travel_system', {
    query: params.query || '',
    language: params.language || 'de',
    category: params.category || '',
    max_price: params.max_price,
    min_days: params.min_days,
    max_days: params.max_days,
    limit: params.limit || 50,
  });

  return result.results || [];
}

/**
 * Get Travel System categories via MCP
 */
export async function getTravelSystemCategories(): Promise<string[]> {
  const result = await callTool<McpTravelSystemCategoriesResponse>('tourism__get_travel_system_categories', {});
  return result.categories?.map(c => c.category) || [];
}

/**
 * Search Holiday products via MCP
 */
export async function searchHolidayProducts(params: {
  query?: string;
  category?: string;
  region?: string;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  difficulty?: string;
  best_for?: string;
  limit?: number;
  language?: string;
} = {}): Promise<HolidayProduct[]> {
  const result = await callTool<McpHolidayResponse>('tourism__search_holiday_products', {
    query: params.query || '',
    language: params.language || 'de',
    category: params.category || '',
    region: params.region || '',
    max_price: params.max_price,
    min_duration: params.min_duration,
    max_duration: params.max_duration,
    difficulty: params.difficulty || '',
    best_for: params.best_for || '',
    limit: params.limit || 50,
  });

  return result.results || [];
}

/**
 * Get Holiday product categories via MCP
 */
export async function getHolidayCategories(): Promise<string[]> {
  const result = await callTool<McpHolidayCategoriesResponse>('tourism__get_holiday_product_categories', {});
  return result.categories?.map(c => c.category) || [];
}
