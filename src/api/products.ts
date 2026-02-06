/**
 * API functions for tourism products - using MCP protocol
 */

import { callTool } from './mcp-client';

// Types for Travel System products
export interface TravelSystemProduct {
  id: string;
  name: string;
  title: string;
  description?: string;
  category: string;
  duration: {
    days: number;
    type: string;
    validity_period?: string;
    consecutive?: boolean;
  };
  pricing: {
    currency?: string;
    adult_2nd?: number;
    adult_1st?: number;
    adult_chf?: number;
    youth_chf?: number;
    child_2nd?: number;
    child_1st?: number;
    child_chf?: number;
  };
  features: string[];
  benefits?: Record<string, string>;
  coverage?: string;
  restrictions?: string[];
  bookingUrl?: string;
  media?: {
    homepageUrl?: string;
    imageUrl?: string;
  };
  valid_from?: string;
  valid_until?: string;
}

// Types for Holiday products
export interface HolidayProduct {
  id: string;
  name: string | { en?: string; de?: string; fr?: string; it?: string };
  description?: string | { en?: string; de?: string; fr?: string; it?: string };
  category: string;
  duration: {
    days: number;
    nights?: number;
  };
  price: {
    base_chf: number;
    currency: string;
    class_variants?: Array<{
      class: string;
      price_chf: number;
      accommodation: string;
    }>;
  };
  included?: string[];
  region: string | string[];
  difficulty_level: string;
  highlights: string[];
  best_for?: string[];
  group_size?: {
    min?: number;
    recommended?: number;
    max?: number;
  };
  media?: {
    homepageUrl?: string;
    imageUrl?: string;
  };
  booking_link?: string;
  valid_until?: string;
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
  count: number;
  results: HolidayProduct[];
  total_available: number;
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
  const result = await callTool<McpHolidayResponse>('tourism__search_all_products', {
    text: params.query || '',
    category: params.category || null,
    region: params.region || null,
    product_type: 'stc_package',
    limit: Math.min(params.limit || 50, 50),
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
