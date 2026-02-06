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
import { getLocalizedText } from '../../types/common';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import type { Lang } from '../../i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import FullPageError from '../FullPageError';
import EmptyFilterState from '../EmptyFilterState';
import BadgeList from '../BadgeList';

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
    const regionMatch = holidayRegion === 'all' || (Array.isArray(product.region) ? product.region.includes(holidayRegion) : product.region === holidayRegion);
    const difficultyMatch = holidayDifficulty === 'all' || product.difficulty_level === holidayDifficulty;
    const durationMatch =
      holidayMaxDuration === 0 ||
      !product.duration?.days ||
      product.duration.days <= holidayMaxDuration;
    return categoryMatch && regionMatch && difficultyMatch && durationMatch;
  });

  // Get unique categories for each product type
  const railawayCategories = [...new Set(railawayProducts.map((p) => p.category).filter((c): c is string => Boolean(c)))];
  const travelCategories = [...new Set(travelProducts.map((p) => p.category).filter(Boolean))];
  const holidayCategories = [...new Set(holidayProducts.map((p) => p.category).filter(Boolean))];
  const holidayRegions = [...new Set(holidayProducts.flatMap((p) => Array.isArray(p.region) ? p.region : [p.region]).filter(Boolean))].sort();

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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProductTab)} className="flex flex-col h-full">
        <div className="px-4 bg-[var(--card)] border-b border-[var(--border)]">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-3 font-medium text-sm transition-colors relative rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--primary)]"
              >
                {tab.label}
                <Badge
                  variant={activeTab === tab.id ? 'default' : 'secondary'}
                  className="ml-2"
                >
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
                    <Label className="mb-2">
                      {t(language, 'common.category')}
                    </Label>
                    <Select value={railawayCategory} onValueChange={setRailawayCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allCategories')}</SelectItem>
                        {railawayCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                    <Label className="mb-2">
                      {t(language, 'common.category')}
                    </Label>
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
                    <Label className="mb-2">
                      {t(language, 'products.duration')}
                    </Label>
                    <Select value={travelDuration} onValueChange={setTravelDuration}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'products.allDays')}</SelectItem>
                        <SelectItem value="3">{t(language, 'products.threeDays')}</SelectItem>
                        <SelectItem value="4">{t(language, 'products.fourDays')}</SelectItem>
                        <SelectItem value="5plus">{t(language, 'products.fivePlusDays')}</SelectItem>
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
                    <Label className="mb-2">
                      {t(language, 'common.category')}
                    </Label>
                    <Select value={holidayCategory} onValueChange={setHolidayCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allCategories')}</SelectItem>
                        {holidayCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'common.region')}
                    </Label>
                    <Select value={holidayRegion} onValueChange={setHolidayRegion}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'common.allRegions')}</SelectItem>
                        {holidayRegions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'resorts.difficulty')}
                    </Label>
                    <Select value={holidayDifficulty} onValueChange={setHolidayDifficulty}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t(language, 'products.allLevels')}</SelectItem>
                        <SelectItem value="easy">{t(language, 'difficulty.easy')}</SelectItem>
                        <SelectItem value="moderate">{t(language, 'difficulty.moderate')}</SelectItem>
                        <SelectItem value="challenging">{t(language, 'difficulty.challenging')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2">
                      {t(language, 'products.maxDuration')}: {holidayMaxDuration === 0 ? t(language, 'products.unlimited') : `${holidayMaxDuration} ${t(language, 'common.days')}`}
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

// RailAway Product Card
function RailAwayCard({ product }: { product: RailAwayProduct }) {
  const { language } = useLanguageStore();
  const langKey = language as 'de' | 'en' | 'fr' | 'it';
  const categoryColors: Record<string, string> = {
    "Snow'n'Rail": '#94A3B8',
    "Hike'n'Rail": '#86AFBF',
    "Culture'n'Rail": '#A99BC4',
    "Animal'n'Rail": '#B8A080',
    "Nature'n'Rail": '#7BA89D',
    "Wellness'n'Rail": '#B89BAD',
  };

  const bgColor = categoryColors[product.category || ''] || 'var(--muted-foreground)';

  // Derive booking URL from bookingInfo or media (API has no top-level bookingUrl)
  const bookingUrl = product.bookingUrl
    || (product.bookingInfo?.howtoBuyUrl ? getLocalizedText(product.bookingInfo.howtoBuyUrl, langKey) : null)
    || (product.media?.homepageUrl ? getLocalizedText(product.media.homepageUrl, langKey) : null)
    || null;

  const handleClick = () => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    }
  };

  const title = getLocalizedText(product.title, langKey) || 'Unbenannt';
  const description = getLocalizedText(product.description, langKey);
  const discountDesc = product.discount?.description
    ? getLocalizedText(product.discount.description, langKey)
    : null;

  // Parse discount value — API returns strings like "10%" or "20%"
  const discountDisplay = product.discount?.value
    ? String(product.discount.value).replace(/%$/, '')
    : null;

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <CardHeader
        className="px-4 py-3 text-xs font-medium text-white flex flex-row items-center justify-between"
        style={{ backgroundColor: bgColor }}
      >
        <CardTitle className="text-xs font-medium">
          {product.category || 'RailAway'}
        </CardTitle>
        {discountDisplay && (
          <Badge variant="secondary" className="text-xs">
            {t(language, 'products.discountOff', { value: discountDisplay })}
          </Badge>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 line-clamp-2 text-[var(--foreground)]">
          {title}
        </h3>
        <p className="text-sm line-clamp-3 text-[var(--muted-foreground)]">
          {description}
        </p>

        {/* Discount description */}
        {discountDesc && (
          <p className="mt-2 text-xs text-[var(--primary)] font-medium">
            {discountDesc}
          </p>
        )}

        {/* Location */}
        {product.location && (product.location.city || product.location.region) && (
          <div className="mt-2 text-xs text-[var(--muted-foreground)]">
            {[product.location.city, product.location.region].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Visit Info */}
        {product.visitInfo && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
            {product.visitInfo.recommendedDuration && (
              <span>{t(language, 'products.recommendedDuration')}: {product.visitInfo.recommendedDuration}</span>
            )}
            {product.visitInfo.accessibility && (
              <span>
                {typeof product.visitInfo.accessibility === 'boolean'
                  ? t(language, 'products.accessibility')
                  : product.visitInfo.accessibility}
              </span>
            )}
          </div>
        )}

        {/* Best Months */}
        {product.visitInfo?.bestMonths && product.visitInfo.bestMonths.length > 0 && (
          <BadgeList items={product.visitInfo.bestMonths} variant="outline" className="mt-2" />
        )}

        {/* Target Audience */}
        {product.targetAudience && product.targetAudience.length > 0 && (
          <BadgeList items={product.targetAudience} variant="secondary" className="mt-2" />
        )}

        {/* Price */}
        {product.price && (
          <div className="mt-auto pt-3 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm text-[var(--muted-foreground)]">
              {t(language, 'common.from')}
            </span>
            <span className="font-bold text-lg text-[var(--primary)]">
              CHF {product.price.from}
            </span>
          </div>
        )}

        {/* Book button */}
        {bookingUrl && (
          <Button size="sm" className="mt-3 w-full">
            {t(language, 'products.bookNow')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Feature label mapping for display
const featureLabels: Record<string, string> = {
  unlimited_train: 'Trains',
  unlimited_bus: 'Buses',
  unlimited_boat: 'Boats',
  free_museums: '500+ Museums',
  mountain_discounts: 'Mountain 50%',
  panoramic_trains: 'Panoramic',
  '50_percent_discount': '50% off',
  unlimited_usage: 'Unlimited',
  flexible_booking: 'Flexible',
};

// Travel System Product Card
function TravelSystemCard({ product }: { product: TravelSystemProduct }) {
  const { language } = useLanguageStore();
  const categoryLabels: Record<string, string> = {
    'travel-pass': t(language, 'products.travelPass'),
    'travel-pass-flex': t(language, 'products.flexPass'),
    'discount-card': t(language, 'products.discountCard'),
    'regional-pass': t(language, 'products.regionalPass'),
    'family-card': t(language, 'products.familyCard'),
  };

  const handleClick = () => {
    const url = product.bookingUrl || product.media?.homepageUrl;
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Resolve the best price to show
  const adultPrice = product.pricing?.adult_2nd ?? product.pricing?.adult_chf;
  const firstClassPrice = product.pricing?.adult_1st;
  const youthPrice = product.pricing?.youth_chf;

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <CardHeader className="px-4 py-3 bg-rose-300 text-white flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-medium">
          {categoryLabels[product.category] || product.category}
        </CardTitle>
        {product.coverage && (
          <Badge variant="secondary" className="text-xs">
            {product.coverage}
          </Badge>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-1 text-[var(--foreground)]">
          {product.title || product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm line-clamp-2 mb-2 text-[var(--muted-foreground)]">
            {product.description}
          </p>
        )}

        {/* Duration */}
        {product.duration && (
          <p className="text-xs mb-2 text-[var(--muted-foreground)]">
            {product.duration.days} {t(language, 'common.days')}
            {product.duration.type === 'flex' && ` (${t(language, 'products.flexible')})`}
            {product.duration.consecutive && product.duration.type !== 'flex' && ` (${t(language, 'products.consecutive')})`}
            {product.duration.validity_period && !product.duration.consecutive && product.duration.validity_period !== 'consecutive' && ` — ${product.duration.validity_period}`}
          </p>
        )}

        {/* Benefits */}
        {product.benefits && Object.keys(product.benefits).length > 0 && (
          <div className="mb-2 space-y-1">
            {Object.entries(product.benefits).slice(0, 3).map(([key, value]) => (
              <p key={key} className="text-xs text-[var(--muted-foreground)] flex items-start gap-1.5">
                <span className="text-[var(--primary)] shrink-0">•</span>
                <span className="line-clamp-1">{value}</span>
              </p>
            ))}
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <BadgeList
            items={product.features.map(f => featureLabels[f] || f.replace(/_/g, ' '))}
            variant="secondary"
            className="mb-2"
          />
        )}

        {/* Restrictions */}
        {product.restrictions && product.restrictions.length > 0 && (
          <div className="mb-2 text-xs text-[var(--muted-foreground)]">
            {product.restrictions.slice(0, 2).map((r, i) => (
              <p key={i} className="flex items-start gap-1.5">
                <span className="text-[var(--destructive)] shrink-0">!</span>
                <span>{r}</span>
              </p>
            ))}
          </div>
        )}

        {/* Pricing */}
        {product.pricing && (
          <div className="mt-auto pt-2 border-t border-[var(--border)] space-y-1">
            {adultPrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">{t(language, 'products.secondClass')}</span>
                <span className="font-bold text-[var(--primary)]">
                  CHF {adultPrice}
                </span>
              </div>
            )}
            {firstClassPrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">{t(language, 'products.firstClass')}</span>
                <span className="font-bold text-[var(--foreground)]">
                  CHF {firstClassPrice}
                </span>
              </div>
            )}
            {youthPrice != null && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">{t(language, 'products.youthPrice')}</span>
                <span className="text-[var(--foreground)]">CHF {youthPrice}</span>
              </div>
            )}
            {product.pricing.child_chf === 0 && (
              <p className="text-xs text-[var(--primary)]">{t(language, 'products.childFree')}</p>
            )}
          </div>
        )}

        {/* Validity */}
        {product.valid_until && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {t(language, 'products.validity')} {t(language, 'products.validUntil', { date: product.valid_until })}
          </p>
        )}

        {/* Book button */}
        {(product.bookingUrl || product.media?.homepageUrl) && (
          <Button size="sm" className="mt-3 w-full">
            {t(language, 'products.bookNow')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Holiday Product Card
function HolidayCard({ product }: { product: HolidayProduct }) {
  const { language } = useLanguageStore();
  const langKey = language as 'de' | 'en' | 'fr' | 'it';
  const categoryColors: Record<string, string> = {
    'train-journey': '#B08888',
    'themed-experience': '#9B88B2',
    'regional-retreat': '#88A89F',
    'alpine-adventure': '#8897B2',
    'city-break': '#B5966F',
  };

  const bookingUrl = product.booking_link || product.media?.homepageUrl || null;

  const handleClick = () => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    }
  };

  const name = getLocalizedText(product.name, langKey) || product.id;
  const description = product.description ? getLocalizedText(product.description, langKey) : null;
  const regions = Array.isArray(product.region) ? product.region : [product.region].filter(Boolean);

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <CardHeader
        className="px-4 py-3 text-xs font-medium flex flex-row justify-between items-center text-white"
        style={{ backgroundColor: categoryColors[product.category] || '#8FA89B' }}
      >
        <CardTitle className="text-xs font-medium">
          {product.category.replace(/-/g, ' ')}
        </CardTitle>
        {product.difficulty_level && (
          <Badge
            variant={
              product.difficulty_level === 'easy'
                ? 'difficulty-easy'
                : product.difficulty_level === 'moderate'
                  ? 'difficulty-moderate'
                  : 'difficulty-hard'
            }
            className="text-xs"
          >
            {product.difficulty_level}
          </Badge>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-1 text-[var(--foreground)]">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm line-clamp-2 mb-2 text-[var(--muted-foreground)]">
            {description}
          </p>
        )}

        {/* Region & Duration */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2 text-[var(--muted-foreground)]">
          {regions.length > 0 && <span>{regions.join(', ')}</span>}
          {product.duration && (
            <span>
              {product.duration.days} {t(language, 'common.days')}
              {product.duration.nights != null && ` / ${product.duration.nights} ${t(language, 'common.nights')}`}
            </span>
          )}
        </div>

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="text-sm space-y-1 mb-2 text-[var(--muted-foreground)]">
            {product.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[var(--primary)] shrink-0">•</span>
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Included */}
        {product.included && product.included.length > 0 && (
          <BadgeList
            items={product.included.map(item => item.replace(/-/g, ' '))}
            variant="outline"
            className="mb-2"
          />
        )}

        {/* Best For */}
        {product.best_for && product.best_for.length > 0 && (
          <BadgeList
            items={product.best_for.map(a => a.replace(/-/g, ' '))}
            variant="secondary"
            className="mb-2"
          />
        )}

        {/* Pricing — class variants */}
        {product.price && (
          <div className="mt-auto pt-2 border-t border-[var(--border)] space-y-1">
            {product.price.class_variants && product.price.class_variants.length > 0 ? (
              product.price.class_variants.map((variant) => (
                <div key={variant.class} className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    {variant.accommodation || variant.class.replace(/_/g, ' ')}
                  </span>
                  <span className={cn(
                    "font-bold",
                    variant.price_chf === product.price.base_chf
                      ? "text-[var(--primary)]"
                      : "text-[var(--foreground)]"
                  )}>
                    CHF {variant.price_chf}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t(language, 'common.from')}
                </span>
                <span className="font-bold text-lg text-[var(--primary)]">
                  CHF {product.price.base_chf}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Valid until */}
        {product.valid_until && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {t(language, 'products.validity')} {t(language, 'products.validUntil', { date: product.valid_until })}
          </p>
        )}

        {/* Book button */}
        {bookingUrl && (
          <Button size="sm" className="mt-3 w-full">
            {t(language, 'products.bookNow')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
