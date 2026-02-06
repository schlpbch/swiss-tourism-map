/**
 * SightsContainer Component
 * Grid view of sights with filtering capabilities
 */

import { useState, useEffect, useMemo } from 'react';
import type { Sight, ProminenceTier } from '../../types/sight';
import { PROMINENCE_TIERS } from '../../types/sight';
import { searchSights } from '../../api/sights';
import { initializeMcp } from '../../api/mcp-client';
import { t } from '../../i18n';
import { useLanguageStore } from '../../store/languageStore';

export default function SightsContainer() {
  const { language } = useLanguageStore();
  const [sights, setSights] = useState<Sight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTiers, setSelectedTiers] = useState<Set<ProminenceTier>>(
    new Set(['iconic', 'major', 'notable', 'hidden-gem'])
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data
  useEffect(() => {
    async function loadSights() {
      try {
        setLoading(true);
        setError(null);

        await initializeMcp();
        const data = await searchSights({ limit: 1000, language: 'de' });

        setSights(data);
      } catch (err) {
        console.error('Error loading sights:', err);
        setError(t(language, 'errors.loadingSights'));
      } finally {
        setLoading(false);
      }
    }

    loadSights();
  }, []);

  // Filter sights
  const filteredSights = useMemo(() => {
    return sights.filter(sight => {
      // Prominence filter
      if (selectedTiers.size < 4 && sight.prominence) {
        if (!selectedTiers.has(sight.prominence.tier)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (!sight.category.includes(selectedCategory)) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = sight.title.toLowerCase().includes(query);
        const matchesDescription = sight.description.toLowerCase().includes(query);
        const matchesRegion = sight.region?.toLowerCase().includes(query);
        return matchesTitle || matchesDescription || matchesRegion;
      }

      return true;
    });
  }, [sights, selectedTiers, selectedCategory, searchQuery]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    sights.forEach(sight => {
      sight.category.forEach(cat => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [sights]);

  // Loading state
  if (loading) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--sbb-color-milk)' }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: 'var(--sbb-color-red)', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
            {t(language, 'loadingMessages.sights')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--sbb-color-milk)' }}
      >
        <div
          className="text-center max-w-md p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--sbb-color-white)',
            borderRadius: 'var(--sbb-border-radius-4x)'
          }}
        >
          <div className="text-5xl mb-4" style={{ color: 'var(--sbb-color-red)' }}>
            ⚠
          </div>
          <p className="text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <div
        className="w-64 border-r p-6 overflow-y-auto"
        style={{
          backgroundColor: 'var(--sbb-color-milk)',
          borderColor: 'var(--sbb-color-cloud)',
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--sbb-color-charcoal)' }}
        >
          {t(language, 'common.filter')}
        </h2>

        {/* Search */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'common.search')}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(language, 'sights.searchPlaceholder')}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--sbb-color-white)',
              border: '1px solid var(--sbb-color-cloud)',
              color: 'var(--sbb-color-charcoal)',
            }}
          />
        </div>

        {/* Prominence Tiers */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'prominence.tiers')}
          </label>
          <div className="space-y-2">
            {(['iconic', 'major', 'notable', 'hidden-gem'] as ProminenceTier[]).map(tier => {
              const isSelected = selectedTiers.has(tier);
              const tierInfo = PROMINENCE_TIERS[tier];
              return (
                <label
                  key={tier}
                  className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--sbb-color-cloud)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedTiers(prev => {
                        const next = new Set(prev);
                        if (next.has(tier)) {
                          next.delete(tier);
                        } else {
                          next.add(tier);
                        }
                        return next;
                      });
                    }}
                    className="rounded"
                    style={{ accentColor: tierInfo.color }}
                  />
                  <span className="text-sm" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {tierInfo.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'common.category')}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--sbb-color-white)',
              border: '1px solid var(--sbb-color-cloud)',
              color: 'var(--sbb-color-charcoal)',
            }}
          >
            <option value="all">{t(language, 'common.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            setSelectedTiers(new Set(['iconic', 'major', 'notable', 'hidden-gem']));
            setSelectedCategory('all');
            setSearchQuery('');
          }}
          className="w-full px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--sbb-color-white)',
            color: 'var(--sbb-color-charcoal)',
            border: '1px solid var(--sbb-color-cloud)',
          }}
        >
          {t(language, 'common.resetFilter')}
        </button>

        {/* Results count */}
        <div className="mt-4 text-xs text-center" style={{ color: 'var(--sbb-color-granite)' }}>
          {t(language, 'map.sightsCount', { displayed: filteredSights.length, total: sights.length })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--sbb-color-charcoal)' }}
        >
          {t(language, 'sights.title')}
        </h1>

        {filteredSights.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
              {t(language, 'sights.noSightsFound')} {t(language, 'common.tryDifferentFilters')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSights.map(sight => (
              <SightCard key={sight.id} sight={sight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sight Card Component
function SightCard({ sight }: { sight: Sight }) {
  const { language } = useLanguageStore();
  const tierInfo = sight.prominence ? PROMINENCE_TIERS[sight.prominence.tier] : null;

  return (
    <div
      className="rounded-lg shadow-sm overflow-hidden flex flex-col transition-all cursor-pointer"
      style={{
        backgroundColor: 'var(--sbb-color-white)',
        border: '1px solid var(--sbb-color-cloud)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Header with prominence */}
      {tierInfo && (
        <div
          className="px-4 py-2 text-xs font-medium flex justify-between items-center"
          style={{ backgroundColor: tierInfo.color, color: 'white' }}
        >
          <span>{tierInfo.label}</span>
          <span>{sight.prominence?.score}/100</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-base mb-2"
          style={{ color: 'var(--sbb-color-red)' }}
        >
          {sight.title}
        </h3>

        {sight.region && (
          <p
            className="text-xs mb-2 flex items-center gap-1"
            style={{ color: 'var(--sbb-color-granite)' }}
          >
            <span>📍</span>
            {sight.region}
          </p>
        )}

        <p
          className="text-sm mb-3 line-clamp-3 flex-1"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          {sight.description}
        </p>

        {/* Categories */}
        {sight.category.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {sight.category.slice(0, 3).map((cat, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--sbb-color-cloud)',
                  color: 'var(--sbb-color-charcoal)',
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {sight.tags && sight.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {sight.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--sbb-color-milk)',
                  color: 'var(--sbb-color-granite)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Links */}
        <div className="mt-auto pt-3 border-t flex gap-2" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
          {(sight.website || sight.url) && (
            <a
              href={sight.website || sight.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded text-xs font-medium text-center transition-colors"
              style={{
                backgroundColor: 'var(--sbb-color-red)',
                color: 'white',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
            >
              {t(language, 'common.website')}
            </a>
          )}
          <a
            href="/"
            className="flex-1 px-3 py-2 rounded text-xs font-medium text-center transition-colors"
            style={{
              backgroundColor: 'var(--sbb-color-red)',
              color: 'white',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
          >
            {t(language, 'common.onMap')}
          </a>
        </div>
      </div>
    </div>
  );
}
