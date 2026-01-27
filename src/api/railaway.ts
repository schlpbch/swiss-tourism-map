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
  category_filter: string;
  results_count: number;
  results: RailAwayProduct[];
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
export async function searchRailAway(params: RailAwaySearchParams = {}): Promise<RailAwayProduct[]> {
  const result = await callTool<McpRailAwayResponse>('tourism__search_railaway_products', {
    query: params.query || '',
    language: params.language || 'de',
    category: params.category || '',
    limit: params.limit || 200,
  });

  return result.results || [];
}

/**
 * Get available RailAway categories via MCP
 */
export async function getRailAwayCategories(): Promise<string[]> {
  const result = await callTool<McpCategoriesResponse>('tourism__get_railaway_categories', {});
  return result.categories?.map(c => c.name) || [];
}
