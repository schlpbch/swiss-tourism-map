/**
 * ProminenceFilter Component
 * Displays filter panel for filtering sights by prominence tier
 */

import React from 'react';
import type { ProminenceTier } from '../../types/sight';
import {
  getProminenceTierColor,
  getProminenceTierLabel,
  getProminenceTierEmoji,
} from '../../utils/prominence';

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
  const allSelected = selectedTiers.size === 4;
  const noneSelected = selectedTiers.size === 0;

  return (
    <div
      className="absolute top-4 left-4 z-[1000] shadow-lg transition-all"
      style={{
        backgroundColor: 'var(--sbb-color-white)',
        borderRadius: 'var(--sbb-border-radius-4x)',
        border: '1px solid var(--sbb-color-cloud)',
      }}
    >
      {/* Header with collapse toggle */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer hover:bg-opacity-50"
        style={{ borderColor: 'var(--sbb-color-cloud)' }}
        onClick={onToggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label="Prominenz-Filter umschalten"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpanded();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3
            className="font-bold text-sm"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            Prominenz-Filter
          </h3>
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--sbb-color-red)' }}
              title="Filter aktiv"
              aria-label="Filter ist aktiv"
            />
          )}
        </div>
        <button
          className="text-sm transition-transform"
          style={{
            color: 'var(--sbb-color-granite)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          tabIndex={-1}
          aria-hidden="true"
        >
          ▼
        </button>
      </div>

      {/* Filter content */}
      {isExpanded && (
        <div className="p-4">
          {/* Select All / Deselect All */}
          <div className="mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAll();
              }}
              className="w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left"
              style={{
                backgroundColor: allSelected || noneSelected
                  ? 'var(--sbb-color-milk)'
                  : 'var(--sbb-color-red)',
                color: allSelected || noneSelected
                  ? 'var(--sbb-color-charcoal)'
                  : 'var(--sbb-color-white)',
                border: '1px solid var(--sbb-color-cloud)',
              }}
              onMouseEnter={(e) => {
                if (!(allSelected || noneSelected)) {
                  e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(allSelected || noneSelected)) {
                  e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)';
                }
              }}
              aria-label={allSelected || noneSelected ? 'Alle Tiers auswählen' : 'Alle Tiers abwählen'}
            >
              {allSelected || noneSelected ? '✓ Alle auswählen' : '✕ Alle abwählen'}
            </button>
          </div>

          {/* Tier checkboxes */}
          <div className="space-y-2" role="group" aria-label="Prominenz-Tiers">
            {tiers.map((tier) => {
              const isSelected = selectedTiers.has(tier);
              const count = tierCounts[tier] || 0;
              const color = getProminenceTierColor(tier);
              const label = getProminenceTierLabel(tier);
              const emoji = getProminenceTierEmoji(tier);

              return (
                <label
                  key={tier}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--sbb-color-milk)'
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--sbb-color-cloud)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Custom checkbox */}
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: isSelected ? color : 'var(--sbb-color-cloud)',
                      backgroundColor: isSelected ? color : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>

                  {/* Tier info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--sbb-color-charcoal)' }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>

                  {/* Count badge */}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: isSelected
                        ? color
                        : 'var(--sbb-color-cloud)',
                      color: isSelected ? 'white' : 'var(--sbb-color-granite)',
                    }}
                  >
                    {count}
                  </span>

                  {/* Hidden input for accessibility */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleTier(tier)}
                    className="sr-only"
                    aria-label={`${label} filtern (${count} Sehenswürdigkeiten)`}
                  />
                </label>
              );
            })}
          </div>

          {/* Summary */}
          <div
            className="mt-4 pt-4 border-t text-xs text-center"
            style={{
              borderColor: 'var(--sbb-color-cloud)',
              color: 'var(--sbb-color-granite)',
            }}
          >
            {noneSelected ? (
              <span>Keine Sehenswürdigkeiten ausgewählt</span>
            ) : (
              <span>
                {selectedTiers.size === 4
                  ? 'Alle Kategorien'
                  : `${selectedTiers.size} von 4 Kategorien`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ProminenceFilter);
