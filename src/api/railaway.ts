/**
 * API functions for RailAway products - using MCP protocol
 */

import { callTool } from './mcp-client';
import type { RailAwayProduct } from '../types/railaway';

export interface RailAwaySearchParams {
  query?: string;
  category?: string;
  language?: string;
  limit?: number;
}

interface McpRailAwayResponse {
  count: number;
  results: RailAwayProduct[];
  total_available: number;
}

interface McpCategoriesResponse {
  total_categories: number;
  categories: Array<{
    name: string;
    product_count: number;
  }>;
}

/**
 * Search RailAway products via MCP
 */
export async function searchRailAway(
  params: RailAwaySearchParams = {}
): Promise<RailAwayProduct[]> {
  const result = await callTool<McpRailAwayResponse>('tourism__search_all_products', {
    text: params.query || '',
    category: params.category || null,
    product_type: 'railaway',
    limit: Math.min(params.limit || 50, 50),
  });

  return result.results || [];
}

/**
 * Get available RailAway categories via MCP
 */
export async function getRailAwayCategories(): Promise<string[]> {
  const result = await callTool<McpCategoriesResponse>('tourism__get_railaway_categories', {});
  return result.categories?.map((c) => c.name) || [];
}
