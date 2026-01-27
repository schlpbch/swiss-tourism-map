/**
 * Custom hook for managing prominence filter state
 * Server-side filtering approach - triggers API calls on filter changes
 */

import { useState, useCallback, useMemo } from 'react';
import type { ProminenceTier } from '../types/sight';
import { PROMINENCE_TIERS } from '../types/sight';
import {
  loadFilterPreferences,
  saveFilterPreferences,
} from '../utils/prominence';

interface UseProminenceFilterOptions {
  onFilterChange: (minProminence?: number, maxProminence?: number) => void;
}

interface UseProminenceFilterReturn {
  selectedTiers: Set<ProminenceTier>;
  isExpanded: boolean;
  toggleTier: (tier: ProminenceTier) => void;
  toggleAll: () => void;
  toggleExpanded: () => void;
  hasActiveFilters: boolean;
  prominenceRange: { min?: number; max?: number };
}

/**
 * Convert selected tiers to min/max prominence score range
 */
function tiersToScoreRange(selectedTiers: Set<ProminenceTier>): { min?: number; max?: number } {
  if (selectedTiers.size === 0 || selectedTiers.size === 4) {
    // All or none selected - no filtering needed
    return { min: undefined, max: undefined };
  }

  // Get min and max scores from selected tiers
  let minScore = 100;
  let maxScore = 0;

  selectedTiers.forEach(tier => {
    const tierDef = PROMINENCE_TIERS[tier];
    if (tierDef) {
      minScore = Math.min(minScore, tierDef.min);
      maxScore = Math.max(maxScore, tierDef.max);
    }
  });

  return { min: minScore, max: maxScore };
}

export function useProminenceFilter({
  onFilterChange,
}: UseProminenceFilterOptions): UseProminenceFilterReturn {
  // Initialize from localStorage
  const [selectedTiers, setSelectedTiers] = useState<Set<ProminenceTier>>(
    () => loadFilterPreferences()
  );

  // Panel expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState(() => {
    // Default expanded on desktop, collapsed on mobile
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768;
  });

  // Calculate prominence range from selected tiers
  const prominenceRange = useMemo(
    () => tiersToScoreRange(selectedTiers),
    [selectedTiers]
  );

  // Toggle a single tier on/off
  const toggleTier = useCallback((tier: ProminenceTier) => {
    setSelectedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }

      // Save to localStorage
      saveFilterPreferences(next);

      // Trigger filter change with new range
      const range = tiersToScoreRange(next);
      onFilterChange(range.min, range.max);

      return next;
    });
  }, [onFilterChange]);

  // Toggle all tiers (select all or deselect all)
  const toggleAll = useCallback(() => {
    setSelectedTiers(prev => {
      const next = prev.size === 4
        ? new Set<ProminenceTier>() // Deselect all
        : new Set<ProminenceTier>(['iconic', 'major', 'notable', 'hidden-gem']); // Select all

      // Save to localStorage
      saveFilterPreferences(next);

      // Trigger filter change with new range
      const range = tiersToScoreRange(next);
      onFilterChange(range.min, range.max);

      return next;
    });
  }, [onFilterChange]);

  // Toggle expanded/collapsed state
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Check if filters are active (not all tiers selected)
  const hasActiveFilters = selectedTiers.size > 0 && selectedTiers.size < 4;

  return {
    selectedTiers,
    isExpanded,
    toggleTier,
    toggleAll,
    toggleExpanded,
    hasActiveFilters,
    prominenceRange,
  };
}
