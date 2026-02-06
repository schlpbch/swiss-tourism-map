/**
 * ProductsContainer component - Displays tourism products in a grid
 * Styled with SBB Lyne Design System
 */

import { useEffect, useState } from 'react';
import { initializeMcp } from '../../api/mcp-client';
import { searchRailAway } from '../../api/railaway';
import {
  searchTravelSystem,
  searchHolidayProducts,
  type TravelSystemProduct,
  type HolidayProduct,
} from '../../api/products';
import type { RailAwayProduct } from '../../types/railaway';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import FullPageError from '../FullPageError';
import EmptyFilterState from '../EmptyFilterState';
import RailAwayCard from './RailAwayCard';
import TravelSystemCard from './TravelSystemCard';
import HolidayCard from './HolidayCard';

type ProductTab = 'railaway' | 'travelpass' | 'holiday';

export default function ProductsContainer() {
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<ProductTab>('railaway');
  const [railawayProducts, setRailawayProducts] = useState<RailAwayProduct[]>([]);
  const [travelProducts, setTravelProducts] = useState<TravelSystemProduct[]>([]);
  const [holidayProducts, setHolidayProducts] = useState<HolidayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RailAway filters
  const [railawayCategory, setRailawayCategory] = useState<string>('all');
  const [railawayMaxPrice, setRailawayMaxPrice] = useState<number>(10000);

  // Travel System filters
  const [travelCategory, setTravelCategory] = useState<string>('all');
  const [travelDuration, setTravelDuration] = useState<string>('all');
  const [travelMaxPrice, setTravelMaxPrice] = useState<number>(5000);

  // Holiday filters
  const [holidayCategory, setHolidayCategory] = useState<string>('all');
  const [holidayRegion, setHolidayRegion] = useState<string>('all');
  const [holidayDifficulty, setHolidayDifficulty] = useState<string>('all');
  const [holidayMaxDuration, setHolidayMaxDuration] = useState<number>(30);
  const [holidayMaxPrice, setHolidayMaxPrice] = useState<number>(10000);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Add timeout wrapper to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MCP initialization timeout')), 15000)
        );

        await Promise.race([initializeMcp(), timeoutPromise]);

        const [railaway, travel, holiday] = await Promise.all([
          searchRailAway({ limit: 50, language }).catch(() => []),
          searchTravelSystem({ limit: 50, language }).catch(() => []),
          searchHolidayProducts({ limit: 50, language }).catch(() => []),
        ]);

        setRailawayProducts(railaway);
        setTravelProducts(travel);
        setHolidayProducts(holiday);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : t(language, 'errors.loadingProducts');
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [language]);

  // Filter logic for RailAway
  const filteredRailaway = railawayProducts.filter((product) => {
    const categoryMatch = railawayCategory === 'all' || product.category === railawayCategory;
    return categoryMatch;
  });

  // Filter logic for Travel System
  const filteredTravel = travelProducts.filter((product) => {
    const categoryMatch = travelCategory === 'all' || product.category === travelCategory;
    const durationMatch =
      travelDuration === 'all' ||
      (travelDuration === '3' && product.duration?.days === 3) ||
      (travelDuration === '4' && product.duration?.days === 4) ||
      (travelDuration === '5plus' && product.duration?.days && product.duration.days >= 5);
    return categoryMatch && durationMatch;
  });

  // Filter logic for Holiday
  const filteredHoliday = holidayProducts.filter((product) => {
    const categoryMatch = holidayCategory === 'all' || product.category === holidayCategory;
    const regionMatch =
      holidayRegion === 'all' ||
      (Array.isArray(product.region)
        ? product.region.includes(holidayRegion)
        : product.region === holidayRegion);
    const difficultyMatch =
      holidayDifficulty === 'all' || product.difficulty_level === holidayDifficulty;
    const durationMatch =
      holidayMaxDuration === 0 ||
      !product.duration?.days ||
      product.duration.days <= holidayMaxDuration;
    return categoryMatch && regionMatch && difficultyMatch && durationMatch;
  });

  // Get unique categories for each product type
  const railawayCategories = [
    ...new Set(railawayProducts.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ];
  const travelCategories = [...new Set(travelProducts.map((p) => p.category).filter(Boolean))];
  const holidayCategories = [...new Set(holidayProducts.map((p) => p.category).filter(Boolean))];
  const holidayRegions = [
    ...new Set(
      holidayProducts
        .flatMap((p) => (Array.isArray(p.region) ? p.region : [p.region]))
        .filter(Boolean)
    ),
  ].sort();

  const tabs: { id: ProductTab; label: string; count: number }[] = [
    { id: 'railaway', label: t(language, 'products.railaway'), count: filteredRailaway.length },
    { id: 'travelpass', label: t(language, 'products.travelSystem'), count: filteredTravel.length },
    { id: 'holiday', label: t(language, 'products.holidays'), count: filteredHoliday.length },
  ];

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[var(--background)]">
        {/* Tab bar skeleton */}
        <div className="px-4 py-3 bg-[var(--card)] border-b border-[var(--border)] flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar skeleton */}
          <div className="w-64 border-r border-[var(--border)] p-4 space-y-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          {/* Card grid skeleton */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[var(--border)] overflow-hidden">
                  <Skeleton className="h-10 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <FullPageError error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ProductTab)}
        className="flex flex-col h-full"
      >
        <div className="px-4 bg-[var(--card)] border-b border-[var(--border)]">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-3 font-medium text-sm transition-colors relative rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--primary)]"
              >
                {tab.label}
                <Badge variant={activeTab === tab.id ? 'default' : 'secondary'} className="ml-2">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Filters Sidebar & Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Filters */}
          <ScrollArea className="w-64 border-r bg-[var(--card)] border-[var(--border)]">
            <div className="p-4">
              <h3 className="font-bold text-sm mb-4 text-[var(--foreground)]">
                {t(language, 'common.filter')}
              </h3>

              {/* RailAway Filters */}
              {activeTab === 'railaway' && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2">{t(language, 'common.category')}</Label>
                    <Select value={railawayCategory} onValueChange={setRailawayCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allCategories')}</SelectItem>
                        {railawayCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'products.maxPrice')}: CHF {railawayMaxPrice}
                    </Label>
                    <Slider
                      value={[railawayMaxPrice]}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={([val]) => setRailawayMaxPrice(val)}
                    />
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setRailawayCategory('all');
                      setRailawayMaxPrice(10000);
                    }}
                  >
                    {t(language, 'common.resetFilter')}
                  </Button>
                </div>
              )}

              {/* Travel System Filters */}
              {activeTab === 'travelpass' && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2">{t(language, 'common.category')}</Label>
                    <Select value={travelCategory} onValueChange={setTravelCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allCategories')}</SelectItem>
                        {travelCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat === 'travel-pass'
                              ? t(language, 'products.travelPass')
                              : cat === 'travel-pass-flex'
                                ? t(language, 'products.flexPass')
                                : cat === 'discount-card'
                                  ? t(language, 'products.discountCard')
                                  : cat === 'regional-pass'
                                    ? t(language, 'products.regionalPass')
                                    : t(language, 'products.familyCard')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">{t(language, 'products.duration')}</Label>
                    <Select value={travelDuration} onValueChange={setTravelDuration}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'products.allDays')}</SelectItem>
                        <SelectItem value="3">{t(language, 'products.threeDays')}</SelectItem>
                        <SelectItem value="4">{t(language, 'products.fourDays')}</SelectItem>
                        <SelectItem value="5plus">
                          {t(language, 'products.fivePlusDays')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'products.maxPrice')}: CHF {travelMaxPrice}
                    </Label>
                    <Slider
                      value={[travelMaxPrice]}
                      min={0}
                      max={5000}
                      step={50}
                      onValueChange={([val]) => setTravelMaxPrice(val)}
                    />
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setTravelCategory('all');
                      setTravelDuration('all');
                      setTravelMaxPrice(5000);
                    }}
                  >
                    {t(language, 'common.resetFilter')}
                  </Button>
                </div>
              )}

              {/* Holiday Filters */}
              {activeTab === 'holiday' && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2">{t(language, 'common.category')}</Label>
                    <Select value={holidayCategory} onValueChange={setHolidayCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allCategories')}</SelectItem>
                        {holidayCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/-/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">{t(language, 'common.region')}</Label>
                    <Select value={holidayRegion} onValueChange={setHolidayRegion}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allRegions')}</SelectItem>
                        {holidayRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">{t(language, 'resorts.difficulty')}</Label>
                    <Select value={holidayDifficulty} onValueChange={setHolidayDifficulty}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'products.allLevels')}</SelectItem>
                        <SelectItem value="easy">{t(language, 'difficulty.easy')}</SelectItem>
                        <SelectItem value="moderate">
                          {t(language, 'difficulty.moderate')}
                        </SelectItem>
                        <SelectItem value="challenging">
                          {t(language, 'difficulty.challenging')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'products.maxDuration')}:{' '}
                      {holidayMaxDuration === 0
                        ? t(language, 'products.unlimited')
                        : `${holidayMaxDuration} ${t(language, 'common.days')}`}
                    </Label>
                    <Slider
                      value={[holidayMaxDuration]}
                      min={0}
                      max={30}
                      step={1}
                      onValueChange={([val]) => setHolidayMaxDuration(val)}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'products.maxPrice')}: CHF {holidayMaxPrice}
                    </Label>
                    <Slider
                      value={[holidayMaxPrice]}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={([val]) => setHolidayMaxPrice(val)}
                    />
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setHolidayCategory('all');
                      setHolidayRegion('all');
                      setHolidayDifficulty('all');
                      setHolidayMaxDuration(30);
                      setHolidayMaxPrice(10000);
                    }}
                  >
                    {t(language, 'common.resetFilter')}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Products Grid */}
          <ScrollArea className="flex-1 p-4">
            <TabsContent value="railaway" className="mt-0">
              {filteredRailaway.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRailaway.map((product, index) => (
                    <RailAwayCard key={index} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyFilterState
                  title={t(language, 'products.noProductsFound')}
                  description={t(language, 'common.tryDifferentFilters')}
                />
              )}
            </TabsContent>

            <TabsContent value="travelpass" className="mt-0">
              {filteredTravel.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTravel.map((product) => (
                    <TravelSystemCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyFilterState
                  title={t(language, 'products.noProductsFound')}
                  description={t(language, 'common.tryDifferentFilters')}
                />
              )}
            </TabsContent>

            <TabsContent value="holiday" className="mt-0">
              {filteredHoliday.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHoliday.map((product) => (
                    <HolidayCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyFilterState
                  title={t(language, 'products.noProductsFound')}
                  description={t(language, 'common.tryDifferentFilters')}
                />
              )}
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
