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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FullPageError from '../FullPageError';
import EmptyFilterState from '../EmptyFilterState';
import CardActionFooter from '../CardActionFooter';
import BadgeList from '../BadgeList';
import CheckboxFilterGroup from '../CheckboxFilterGroup';

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
      <div className="flex h-full bg-[var(--background)]">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r border-[var(--border)] p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        {/* Card grid skeleton */}
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] overflow-hidden">
                <Skeleton className="h-8 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <FullPageError error={error} className="h-screen" />;
  }

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Sidebar Filters */}
        <div className="w-64 border-r bg-[var(--background)] border-[var(--border)]">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4 text-[var(--foreground)]">
                {t(language, 'common.filter')}
              </h2>

              {/* Search */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="search">{t(language, 'common.search')}</Label>
                <Input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(language, 'sights.searchPlaceholder')}
                />
              </div>

              <Separator className="my-4" />

              {/* Prominence Tiers */}
              <div className="space-y-2 mb-6">
                <Label>{t(language, 'prominence.tiers')}</Label>
                <CheckboxFilterGroup
                  options={(['iconic', 'major', 'notable', 'hidden-gem'] as ProminenceTier[]).map(tier => ({
                    value: tier,
                    label: PROMINENCE_TIERS[tier].label,
                  }))}
                  selected={selectedTiers}
                  onToggle={(tier) => {
                    setSelectedTiers(prev => {
                      const next = new Set(prev);
                      if (next.has(tier as ProminenceTier)) {
                        next.delete(tier as ProminenceTier);
                      } else {
                        next.add(tier as ProminenceTier);
                      }
                      return next;
                    });
                  }}
                />
              </div>

              <Separator className="my-4" />

              {/* Category Filter */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="category">{t(language, 'common.category')}</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t(language, 'common.allCategories')}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              {/* Reset button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedTiers(new Set(['iconic', 'major', 'notable', 'hidden-gem']));
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                {t(language, 'common.resetFilter')}
              </Button>

              {/* Results count */}
              <p className="mt-4 text-xs text-center text-[var(--muted-foreground)]">
                {t(language, 'map.sightsCount', { displayed: filteredSights.length, total: sights.length })}
              </p>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-[var(--foreground)]">
              {t(language, 'sights.title')}
            </h1>

            {filteredSights.length === 0 ? (
              <EmptyFilterState
                title={t(language, 'sights.noSightsFound')}
                description={t(language, 'common.tryDifferentFilters')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSights.map(sight => (
                  <SightCard key={sight.id} sight={sight} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

// Sight Card Component
function SightCard({ sight }: { sight: Sight }) {
  const { language } = useLanguageStore();
  const tierInfo = sight.prominence ? PROMINENCE_TIERS[sight.prominence.tier] : null;

  return (
    <Card className="overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-md">
      {/* Header with prominence */}
      {tierInfo && (
        <div
          className="px-4 py-2 text-xs font-medium flex justify-between items-center text-white"
          style={{ backgroundColor: tierInfo.color }}
        >
          <span>{tierInfo.label}</span>
          <span>{sight.prominence?.score}/100</span>
        </div>
      )}

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 text-[var(--primary)]">
          {sight.title}
        </h3>

        {sight.region && (
          <p className="text-xs mb-2 text-[var(--muted-foreground)]">
            {sight.region}
          </p>
        )}

        <p className="text-sm mb-3 line-clamp-3 flex-1 text-[var(--muted-foreground)]">
          {sight.description}
        </p>

        {/* Categories */}
        {sight.category.length > 0 && (
          <BadgeList items={sight.category} variant="outline" maxVisible={3} className="mb-3" />
        )}

        {/* Tags */}
        {sight.tags && sight.tags.length > 0 && (
          <BadgeList items={sight.tags} variant="secondary" maxVisible={3} className="mb-3" />
        )}

        {/* Action Links */}
        <CardActionFooter
          externalUrl={sight.website || sight.url}
          internalHref="/"
          internalLabel={t(language, 'common.onMap')}
        />
      </CardContent>
    </Card>
  );
}
