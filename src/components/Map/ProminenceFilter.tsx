/**
 * ProminenceFilter Component
 * Displays filter panel for filtering sights by prominence tier
 */

import React from 'react';
import type { ProminenceTier } from '../../types/sight';
import {
  getProminenceTierColor,
  getProminenceTierEmoji,
} from '../../utils/prominence';
import { t } from '../../i18n';
import { useLanguageStore } from '../../store/languageStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface ProminenceFilterProps {
  selectedTiers: Set<ProminenceTier>;
  tierCounts: Record<ProminenceTier, number>;
  isExpanded: boolean;
  onToggleTier: (tier: ProminenceTier) => void;
  onToggleAll: () => void;
  onToggleExpanded: () => void;
  hasActiveFilters: boolean;
}

const tiers: ProminenceTier[] = ['iconic', 'major', 'notable', 'hidden-gem'];

function ProminenceFilter({
  selectedTiers,
  tierCounts,
  isExpanded,
  onToggleTier,
  onToggleAll,
  onToggleExpanded,
  hasActiveFilters,
}: ProminenceFilterProps) {
  const { language } = useLanguageStore();
  const allSelected = selectedTiers.size === 4;
  const noneSelected = selectedTiers.size === 0;

  // Get tier label from i18n
  const getTierLabel = (tier: ProminenceTier): string => {
    const tierKeys: Record<ProminenceTier, string> = {
      'iconic': 'prominence.iconic',
      'major': 'prominence.major',
      'notable': 'prominence.notable',
      'hidden-gem': 'prominence.hiddenGem',
    };
    return t(language, tierKeys[tier]);
  };

  return (
    <Card className="absolute top-4 left-4 z-[1000] shadow-lg transition-all">
      {/* Header with collapse toggle */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]/50"
        onClick={onToggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={t(language, 'prominence.toggleFilter')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpanded();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="font-bold text-sm text-[var(--foreground)]">
            {t(language, 'prominence.filter')}
          </h3>
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full bg-[var(--primary)]"
              title={t(language, 'prominence.filterActive')}
              aria-label={t(language, 'prominence.filterActive')}
            />
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--muted-foreground)] transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {/* Filter content */}
      {isExpanded && (
        <CardContent className="p-4">
          {/* Select All / Deselect All */}
          <div className="mb-4">
            <Button
              variant={allSelected || noneSelected ? 'outline' : 'default'}
              className="w-full justify-start"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAll();
              }}
              aria-label={allSelected || noneSelected ? t(language, 'prominence.selectAllTiers') : t(language, 'prominence.deselectAllTiers')}
            >
              {allSelected || noneSelected ? `✓ ${t(language, 'common.selectAll')}` : `✕ ${t(language, 'common.deselectAll')}`}
            </Button>
          </div>

          {/* Tier checkboxes */}
          <div className="space-y-2" role="group" aria-label={t(language, 'prominence.tiers')}>
            {tiers.map((tier) => {
              const isSelected = selectedTiers.has(tier);
              const count = tierCounts[tier] || 0;
              const color = getProminenceTierColor(tier);
              const label = getTierLabel(tier);
              const emoji = getProminenceTierEmoji(tier);

              return (
                <label
                  key={tier}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors",
                    isSelected ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleTier(tier)}
                    aria-label={t(language, 'prominence.filterTier', { tier: label, count })}
                  />

                  {/* Tier info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {label}
                      </span>
                    </div>
                  </div>

                  {/* Count badge */}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? color : 'var(--muted)',
                      color: isSelected ? 'white' : 'var(--muted-foreground)',
                    }}
                  >
                    {count}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-center text-[var(--muted-foreground)]">
            {noneSelected ? (
              <span>{t(language, 'prominence.noSightsSelected')}</span>
            ) : (
              <span>
                {selectedTiers.size === 4
                  ? t(language, 'prominence.allCategories')
                  : t(language, 'prominence.categoriesSelected', { count: selectedTiers.size })}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default React.memo(ProminenceFilter);
