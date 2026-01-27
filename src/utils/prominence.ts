/**
 * Prominence-related utility functions
 * Used for filtering sights by tier, counting, and UI rendering
 */

import type { Sight, ProminenceTier } from '../types/sight';
import { PROMINENCE_TIERS } from '../types/sight';

/**
 * Filter sights by selected prominence tiers
 */
export function filterSightsByProminence(
  sights: Sight[],
  selectedTiers: Set<ProminenceTier>
): Sight[] {
  // If all or no tiers selected, return all sights
  if (selectedTiers.size === 0 || selectedTiers.size === 4) {
    return sights;
  }

  return sights.filter(sight =>
    sight.prominence && selectedTiers.has(sight.prominence.tier)
  );
}

/**
 * Count sights by prominence tier
 */
export function countSightsByTier(sights: Sight[]): Record<ProminenceTier, number> {
  const counts: Record<ProminenceTier, number> = {
    'iconic': 0,
    'major': 0,
    'notable': 0,
    'hidden-gem': 0,
  };

  sights.forEach(sight => {
    if (sight.prominence?.tier) {
      counts[sight.prominence.tier]++;
    }
  });

  return counts;
}

/**
 * Get color for a prominence tier
 */
export function getProminenceTierColor(tier: ProminenceTier): string {
  return PROMINENCE_TIERS[tier]?.color || '#6B7280'; // grey as fallback
}

/**
 * Get German label for a prominence tier
 */
export function getProminenceTierLabel(tier: ProminenceTier): string {
  return PROMINENCE_TIERS[tier]?.label || 'Unbekannt';
}

/**
 * Get emoji for a prominence tier
 */
export function getProminenceTierEmoji(tier: ProminenceTier): string {
  const emojis: Record<ProminenceTier, string> = {
    'iconic': '⭐',
    'major': '🌟',
    'notable': '✨',
    'hidden-gem': '💎',
  };
  return emojis[tier] || '🎯';
}

/**
 * Get marker color name for a prominence tier (for Leaflet color markers)
 */
export function getMarkerColorName(tier?: ProminenceTier): string {
  if (!tier) return 'blue';

  const colorMap: Record<ProminenceTier, string> = {
    'iconic': 'red',
    'major': 'orange',
    'notable': 'blue',
    'hidden-gem': 'grey',
  };

  return colorMap[tier];
}

/**
 * LocalStorage key for prominence filter preferences
 */
const STORAGE_KEY = 'swiss-tourism-prominence-filter';

/**
 * Load filter preferences from localStorage
 * Returns set of selected tiers, or all tiers if not found
 */
export function loadFilterPreferences(): Set<ProminenceTier> {
  if (typeof window === 'undefined') {
    return new Set(['iconic', 'major', 'notable', 'hidden-gem']);
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProminenceTier[];
      return new Set(parsed);
    }
  } catch (e) {
    console.warn('Failed to load filter preferences:', e);
  }

  // Default: all tiers selected
  return new Set(['iconic', 'major', 'notable', 'hidden-gem']);
}

/**
 * Save filter preferences to localStorage
 */
export function saveFilterPreferences(selectedTiers: Set<ProminenceTier>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedTiers]));
  } catch (e) {
    console.warn('Failed to save filter preferences:', e);
  }
}
