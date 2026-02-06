/**
 * ProminenceFilter Component
 * Displays filter panel for filtering sights by prominence tier
 */

import React from 'react';
import type { ProminenceTier } from '../../types/sight';
import { t } from '../../i18n';
import { useLanguageStore } from '../../store/languageStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
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

const tierBadgeVariant: Record<ProminenceTier, 'iconic' | 'major' | 'notable' | 'hidden'> = {
  'iconic': 'iconic',
  'major': 'major',
  'notable': 'notable',
  'hidden-gem': 'hidden',
};

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
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        {/* Header with collapse toggle */}
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]/50"
            role="button"
            tabIndex={0}
            aria-label={t(language, 'prominence.toggleFilter')}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--primary)]">#</span>
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
        </CollapsibleTrigger>

        {/* Filter content */}
        <CollapsibleContent>
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
                {allSelected || noneSelected ? t(language, 'common.selectAll') : t(language, 'common.deselectAll')}
              </Button>
            </div>

            {/* Tier checkboxes */}
            <div className="space-y-2" role="group" aria-label={t(language, 'prominence.tiers')}>
              {tiers.map((tier) => {
                const isSelected = selectedTiers.has(tier);
                const count = tierCounts[tier] || 0;
                const label = getTierLabel(tier);

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
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {label}
                        </span>
                      </div>
                    </div>

                    {/* Count badge */}
                    <Badge
                      variant={isSelected ? tierBadgeVariant[tier] : 'secondary'}
                      className="flex-shrink-0"
                    >
                      {count}
                    </Badge>
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default React.memo(ProminenceFilter);
