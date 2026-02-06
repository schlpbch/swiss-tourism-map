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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
    const regionMatch = holidayRegion === 'all' || product.region === holidayRegion;
    const difficultyMatch = holidayDifficulty === 'all' || product.difficulty_level === holidayDifficulty;
    const durationMatch =
      holidayMaxDuration === 0 ||
      !product.duration?.days ||
      product.duration.days <= holidayMaxDuration;
    return categoryMatch && regionMatch && difficultyMatch && durationMatch;
  });

  // Get unique categories for each product type
  const railawayCategories = [...new Set(railawayProducts.map((p) => p.category).filter(Boolean))];
  const travelCategories = [...new Set(travelProducts.map((p) => p.category).filter(Boolean))];
  const holidayCategories = [...new Set(holidayProducts.map((p) => p.category).filter(Boolean))];
  const holidayRegions = [...new Set(holidayProducts.map((p) => p.region).filter(Boolean))].sort();

  const tabs: { id: ProductTab; label: string; count: number }[] = [
    { id: 'railaway', label: t(language, 'products.railaway'), count: filteredRailaway.length },
    { id: 'travelpass', label: t(language, 'products.travelSystem'), count: filteredTravel.length },
    { id: 'holiday', label: t(language, 'products.holidays'), count: filteredHoliday.length },
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {t(language, 'loadingMessages.products')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
        <Card className="text-center max-w-md p-6">
          <div className="text-5xl mb-4 text-[var(--destructive)]">⚠</div>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t(language, 'common.reload')}
          </Button>
        </Card>
      </div>
    );
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
        <div className="flex-1 overflow-auto flex">
          {/* Filters */}
          <div className="w-64 border-r p-4 overflow-y-auto bg-[var(--card)] border-[var(--border)]">
            <h3 className="font-bold text-sm mb-4 text-[var(--foreground)]">
              {t(language, 'common.filter')}
            </h3>

            {/* RailAway Filters */}
            {activeTab === 'railaway' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'common.category')}
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'products.maxPrice')}: CHF {railawayMaxPrice}
                  </label>
                  <Slider
                    value={[railawayMaxPrice]}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={([val]) => setRailawayMaxPrice(val)}
                  />
                </div>

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
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'common.category')}
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'products.duration')}
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'products.maxPrice')}: CHF {travelMaxPrice}
                  </label>
                  <Slider
                    value={[travelMaxPrice]}
                    min={0}
                    max={5000}
                    step={50}
                    onValueChange={([val]) => setTravelMaxPrice(val)}
                  />
                </div>

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
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'common.category')}
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'common.region')}
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'resorts.difficulty')}
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'products.maxDuration')}: {holidayMaxDuration === 0 ? t(language, 'products.unlimited') : `${holidayMaxDuration} ${t(language, 'common.days')}`}
                  </label>
                  <Slider
                    value={[holidayMaxDuration]}
                    min={0}
                    max={30}
                    step={1}
                    onValueChange={([val]) => setHolidayMaxDuration(val)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                    {t(language, 'products.maxPrice')}: CHF {holidayMaxPrice}
                  </label>
                  <Slider
                    value={[holidayMaxPrice]}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={([val]) => setHolidayMaxPrice(val)}
                  />
                </div>

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

          {/* Products Grid */}
          <div className="flex-1 p-4 overflow-auto">
            <TabsContent value="railaway" className="mt-0">
              {filteredRailaway.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRailaway.map((product, index) => (
                    <RailAwayCard key={index} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-[var(--muted-foreground)]">
                    {t(language, 'products.noProductsFound')}
                  </p>
                </div>
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
                <div className="flex items-center justify-center h-64">
                  <p className="text-[var(--muted-foreground)]">
                    {t(language, 'products.noProductsFound')}
                  </p>
                </div>
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
                <div className="flex items-center justify-center h-64">
                  <p className="text-[var(--muted-foreground)]">
                    {t(language, 'products.noProductsFound')}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

// RailAway Product Card
function RailAwayCard({ product }: { product: RailAwayProduct }) {
  const { language } = useLanguageStore();
  const categoryColors: Record<string, string> = {
    "Snow'n'Rail": '#94A3B8',
    "Hike'n'Rail": '#86AFBF',
    "Culture'n'Rail": '#A99BC4',
    "Animal'n'Rail": '#B8A080',
    "Nature'n'Rail": '#7BA89D',
    "Wellness'n'Rail": '#B89BAD',
  };

  const bgColor = categoryColors[product.category || ''] || 'var(--muted-foreground)';

  const handleClick = () => {
    if (product.bookingUrl) {
      window.open(product.bookingUrl, '_blank');
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <div
        className="px-4 py-3 text-xs font-medium text-white"
        style={{ backgroundColor: bgColor }}
      >
        {product.category || 'RailAway'}
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 line-clamp-2 text-[var(--foreground)]">
          {typeof product.title === 'string' ? product.title : product.title?.de || 'Unbenannt'}
        </h3>
        <p className="text-sm line-clamp-3 flex-1 text-[var(--muted-foreground)]">
          {typeof product.description === 'string'
            ? product.description
            : product.description?.de || ''}
        </p>

        {/* Price */}
        {product.price && (
          <div className="mt-3 pt-2 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm text-[var(--muted-foreground)]">
              {t(language, 'common.from')}
            </span>
            <span className="font-bold text-lg text-[var(--primary)]">
              CHF {product.price.from}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
    if (product.bookingUrl) {
      window.open(product.bookingUrl, '_blank');
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <div className="px-4 py-3 text-xs font-medium bg-rose-300 text-white">
        {categoryLabels[product.category] || product.category}
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 text-[var(--foreground)]">
          {product.title || product.name}
        </h3>

        {/* Duration */}
        {product.duration && (
          <p className="text-sm mb-2 text-[var(--muted-foreground)]">
            {product.duration.days} {t(language, 'common.days')}
            {product.duration.type === 'flex' && ` (${t(language, 'products.flexible')})`}
          </p>
        )}

        {/* Pricing */}
        {product.pricing && (
          <div className="mt-auto pt-2 border-t border-[var(--border)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">{t(language, 'products.secondClass')}</span>
              <span className="font-bold text-[var(--foreground)]">
                CHF {product.pricing.adult_2nd}
              </span>
            </div>
            {product.pricing.adult_1st && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">{t(language, 'products.firstClass')}</span>
                <span className="font-bold text-[var(--foreground)]">
                  CHF {product.pricing.adult_1st}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((feature, i) => (
              <Badge key={i} variant="secondary">{feature}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Holiday Product Card
function HolidayCard({ product }: { product: HolidayProduct }) {
  const { language } = useLanguageStore();
  const categoryColors: Record<string, string> = {
    'train-journey': '#B08888',
    'themed-experience': '#9B88B2',
    'regional-retreat': '#88A89F',
    'alpine-adventure': '#8897B2',
    'city-break': '#B5966F',
  };

  const difficultyColors: Record<string, string> = {
    easy: '#8FA89B',
    moderate: '#ADA880',
    challenging: '#A88A88',
  };

  const handleClick = () => {
    if (product.bookingUrl) {
      window.open(product.bookingUrl, '_blank');
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <div
        className="px-4 py-3 text-xs font-medium flex justify-between items-center text-white"
        style={{ backgroundColor: categoryColors[product.category] || '#8FA89B' }}
      >
        <span>{product.category.replace(/-/g, ' ')}</span>
        {product.difficulty_level && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: difficultyColors[product.difficulty_level] || '#8FA89B' }}
          >
            {product.difficulty_level}
          </span>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 text-[var(--foreground)]">
          {product.name}
        </h3>

        {/* Region & Duration */}
        <div className="flex gap-4 text-sm mb-2 text-[var(--muted-foreground)]">
          {product.region && <span>{product.region}</span>}
          {product.duration && (
            <span>
              {product.duration.days} {t(language, 'common.days')}
              {product.duration.nights && ` / ${product.duration.nights} ${t(language, 'common.nights')}`}
            </span>
          )}
        </div>

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="text-sm space-y-1 flex-1 text-[var(--muted-foreground)]">
            {product.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        {product.price && (
          <div className="mt-3 pt-2 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm text-[var(--muted-foreground)]">
              {t(language, 'common.from')}
            </span>
            <span className="font-bold text-lg text-[var(--primary)]">
              CHF {product.price.from}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
