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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

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
      <div className="w-full h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {t(language, 'loadingMessages.sights')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[var(--background)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t(language, 'error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
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
                <div className="space-y-2">
                  {(['iconic', 'major', 'notable', 'hidden-gem'] as ProminenceTier[]).map(tier => {
                    const isSelected = selectedTiers.has(tier);
                    const tierInfo = PROMINENCE_TIERS[tier];
                    return (
                      <label
                        key={tier}
                        className={cn(
                          'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded transition-colors',
                          isSelected ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
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
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          {tierInfo.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t(language, 'sights.noSightsFound')}</AlertTitle>
                <AlertDescription>{t(language, 'common.tryDifferentFilters')}</AlertDescription>
              </Alert>
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
          <p className="text-xs mb-2 flex items-center gap-1 text-[var(--muted-foreground)]">
            <span>📍</span>
            {sight.region}
          </p>
        )}

        <p className="text-sm mb-3 line-clamp-3 flex-1 text-[var(--muted-foreground)]">
          {sight.description}
        </p>

        {/* Categories */}
        {sight.category.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {sight.category.slice(0, 3).map((cat, i) => (
              <Badge key={i} variant="outline">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {/* Tags */}
        {sight.tags && sight.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {sight.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Links */}
        <div className="mt-auto pt-3 border-t border-[var(--border)] flex gap-2">
          {(sight.website || sight.url) && (
            <Button asChild size="sm" className="flex-1">
              <a href={sight.website || sight.url} target="_blank" rel="noopener noreferrer">
                {t(language, 'common.website')}
              </a>
            </Button>
          )}
          <Button asChild size="sm" className="flex-1">
            <a href="/">
              {t(language, 'common.onMap')}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
