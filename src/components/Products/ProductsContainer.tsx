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

        console.log('[Products] Initializing MCP connection...');
        await initializeMcp();
        console.log('[Products] MCP connection initialized');

        console.log('[Products] Fetching products from backend...');

        const [railaway, travel, holiday] = await Promise.all([
          (async () => {
            console.log('[Products] → Calling searchRailAway (limit=50, language=' + language + ')');
            const result = await searchRailAway({ limit: 50, language });
            console.log('[Products] ← searchRailAway returned:', result.length, 'products');
            return result;
          })(),
          (async () => {
            console.log('[Products] → Calling searchTravelSystem (limit=50, language=' + language + ')');
            const result = await searchTravelSystem({ limit: 50, language });
            console.log('[Products] ← searchTravelSystem returned:', result.length, 'products');
            return result;
          })(),
          (async () => {
            console.log('[Products] → Calling searchHolidayProducts (limit=50, language=' + language + ')');
            const result = await searchHolidayProducts({ limit: 50, language });
            console.log('[Products] ← searchHolidayProducts returned:', result.length, 'products');
            return result;
          })(),
        ]);

        console.log('[Products] ✓ All products loaded successfully:', {
          railaway: railaway.length,
          travelSystem: travel.length,
          holiday: holiday.length,
          total: railaway.length + travel.length + holiday.length,
        });

        setRailawayProducts(railaway);
        setTravelProducts(travel);
        setHolidayProducts(holiday);
      } catch (err) {
        console.error('[Products] ✗ Error loading products:', err);
        setError('Fehler beim Laden der Produkte vom MCP-Server.');
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
    { id: 'railaway', label: 'RailAway', count: filteredRailaway.length },
    { id: 'travelpass', label: 'Swiss Travel System', count: filteredTravel.length },
    { id: 'holiday', label: 'Ferienangebote', count: filteredHoliday.length },
  ];

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--sbb-color-milk)' }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: 'var(--sbb-color-red)', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
            Lade Produkte...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--sbb-color-milk)' }}
      >
        <div
          className="text-center max-w-md p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--sbb-color-white)',
            borderRadius: 'var(--sbb-border-radius-4x)',
          }}
        >
          <div className="text-5xl mb-4" style={{ color: 'var(--sbb-color-red)' }}>
            ⚠
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded font-medium"
            style={{
              backgroundColor: 'var(--sbb-color-red)',
              color: 'var(--sbb-color-white)',
            }}
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--sbb-color-milk)' }}>
      {/* Tabs */}
      <div
        className="flex border-b px-4"
        style={{ backgroundColor: 'var(--sbb-color-white)', borderColor: 'var(--sbb-color-cloud)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 font-medium text-sm transition-colors relative"
            style={{
              color: activeTab === tab.id ? 'var(--sbb-color-red)' : 'var(--sbb-color-granite)',
            }}
          >
            {tab.label}
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--sbb-color-red)' : 'var(--sbb-color-cloud)',
                color: activeTab === tab.id ? 'var(--sbb-color-white)' : 'var(--sbb-color-granite)',
              }}
            >
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--sbb-color-red)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters Sidebar & Content */}
      <div className="flex-1 overflow-auto flex">
        {/* Filters */}
        <div
          className="w-64 border-r p-4 overflow-y-auto"
          style={{ backgroundColor: 'var(--sbb-color-white)', borderColor: 'var(--sbb-color-cloud)' }}
        >
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--sbb-color-charcoal)' }}>
            Filter
          </h3>

          {/* RailAway Filters */}
          {activeTab === 'railaway' && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Kategorie
                </label>
                <select
                  value={railawayCategory}
                  onChange={(e) => setRailawayCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--sbb-color-milk)',
                    borderColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)',
                  }}
                >
                  <option value="all">Alle Kategorien</option>
                  {railawayCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Max. Preis: CHF {railawayMaxPrice}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={railawayMaxPrice}
                  onChange={(e) => setRailawayMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => {
                  setRailawayCategory('all');
                  setRailawayMaxPrice(10000);
                }}
                className="w-full px-3 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--sbb-color-milk)',
                  color: 'var(--sbb-color-charcoal)',
                  border: '1px solid var(--sbb-color-cloud)',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sbb-color-cloud)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sbb-color-milk)')
                }
              >
                Filter zurücksetzen
              </button>
            </div>
          )}

          {/* Travel System Filters */}
          {activeTab === 'travelpass' && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Kategorie
                </label>
                <select
                  value={travelCategory}
                  onChange={(e) => setTravelCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--sbb-color-milk)',
                    borderColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)',
                  }}
                >
                  <option value="all">Alle Kategorien</option>
                  {travelCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'travel-pass'
                        ? 'Reise-Pass'
                        : cat === 'travel-pass-flex'
                          ? 'Flex-Pass'
                          : cat === 'discount-card'
                            ? 'Rabattkarte'
                            : cat === 'regional-pass'
                              ? 'Regional-Pass'
                              : 'Familienkarte'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Dauer
                </label>
                <select
                  value={travelDuration}
                  onChange={(e) => setTravelDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--sbb-color-milk)',
                    borderColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)',
                  }}
                >
                  <option value="all">Alle Tage</option>
                  <option value="3">3 Tage</option>
                  <option value="4">4 Tage</option>
                  <option value="5plus">5+ Tage</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Max. Preis: CHF {travelMaxPrice}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={travelMaxPrice}
                  onChange={(e) => setTravelMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => {
                  setTravelCategory('all');
                  setTravelDuration('all');
                  setTravelMaxPrice(5000);
                }}
                className="w-full px-3 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--sbb-color-milk)',
                  color: 'var(--sbb-color-charcoal)',
                  border: '1px solid var(--sbb-color-cloud)',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sbb-color-cloud)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sbb-color-milk)')
                }
              >
                Filter zurücksetzen
              </button>
            </div>
          )}

          {/* Holiday Filters */}
          {activeTab === 'holiday' && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Kategorie
                </label>
                <select
                  value={holidayCategory}
                  onChange={(e) => setHolidayCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--sbb-color-milk)',
                    borderColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)',
                  }}
                >
                  <option value="all">Alle Kategorien</option>
                  {holidayCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Region
                </label>
                <select
                  value={holidayRegion}
                  onChange={(e) => setHolidayRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--sbb-color-milk)',
                    borderColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)',
                  }}
                >
                  <option value="all">Alle Regionen</option>
                  {holidayRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Schwierigkeitsgrad
                </label>
                <select
                  value={holidayDifficulty}
                  onChange={(e) => setHolidayDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--sbb-color-milk)',
                    borderColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)',
                  }}
                >
                  <option value="all">Alle Level</option>
                  <option value="easy">Einfach</option>
                  <option value="moderate">Mittel</option>
                  <option value="challenging">Schwierig</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Max. Dauer: {holidayMaxDuration === 0 ? 'Unbegrenzt' : `${holidayMaxDuration} Tage`}
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={holidayMaxDuration}
                  onChange={(e) => setHolidayMaxDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
                  Max. Preis: CHF {holidayMaxPrice}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={holidayMaxPrice}
                  onChange={(e) => setHolidayMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => {
                  setHolidayCategory('all');
                  setHolidayRegion('all');
                  setHolidayDifficulty('all');
                  setHolidayMaxDuration(30);
                  setHolidayMaxPrice(10000);
                }}
                className="w-full px-3 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--sbb-color-milk)',
                  color: 'var(--sbb-color-charcoal)',
                  border: '1px solid var(--sbb-color-cloud)',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sbb-color-cloud)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sbb-color-milk)')
                }
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-auto">
          {activeTab === 'railaway' && (
            <div>
              {filteredRailaway.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRailaway.map((product, index) => (
                    <RailAwayCard key={index} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p style={{ color: 'var(--sbb-color-granite)' }}>
                    Keine Produkte mit den gewählten Filtern gefunden
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'travelpass' && (
            <div>
              {filteredTravel.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTravel.map((product) => (
                    <TravelSystemCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p style={{ color: 'var(--sbb-color-granite)' }}>
                    Keine Produkte mit den gewählten Filtern gefunden
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'holiday' && (
            <div>
              {filteredHoliday.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHoliday.map((product) => (
                    <HolidayCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p style={{ color: 'var(--sbb-color-granite)' }}>
                    Keine Produkte mit den gewählten Filtern gefunden
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// RailAway Product Card
function RailAwayCard({ product }: { product: RailAwayProduct }) {
  const categoryColors: Record<string, string> = {
    "Snow'n'Rail": '#94A3B8',
    "Hike'n'Rail": '#86AFBF',
    "Culture'n'Rail": '#A99BC4',
    "Animal'n'Rail": '#B8A080',
    "Nature'n'Rail": '#7BA89D',
    "Wellness'n'Rail": '#B89BAD',
  };

  const bgColor = categoryColors[product.category || ''] || 'var(--sbb-color-granite)';

  const handleClick = () => {
    if (product.bookingUrl) {
      window.open(product.bookingUrl, '_blank');
    } else {
      console.log('Product clicked:', product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg shadow-sm overflow-hidden flex flex-col text-left transition-all cursor-pointer"
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
      {/* Category Header */}
      <div
        className="px-4 py-3 text-xs font-medium"
        style={{ backgroundColor: bgColor, color: 'white' }}
      >
        {product.category || 'RailAway'}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-base mb-2 line-clamp-2"
          style={{ color: 'var(--sbb-color-charcoal)' }}
        >
          {typeof product.title === 'string' ? product.title : product.title?.de || 'Unbenannt'}
        </h3>
        <p
          className="text-sm line-clamp-3 flex-1"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          {typeof product.description === 'string'
            ? product.description
            : product.description?.de || ''}
        </p>

        {/* Price */}
        {product.price && (
          <div
            className="mt-3 pt-2 border-t flex justify-between items-center"
            style={{ borderColor: 'var(--sbb-color-cloud)' }}
          >
            <span className="text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
              Ab
            </span>
            <span className="font-bold text-lg" style={{ color: 'var(--sbb-color-red)' }}>
              CHF {product.price.from}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// Travel System Product Card
function TravelSystemCard({ product }: { product: TravelSystemProduct }) {
  const categoryLabels: Record<string, string> = {
    'travel-pass': 'Reise-Pass',
    'travel-pass-flex': 'Flex-Pass',
    'discount-card': 'Rabattkarte',
    'regional-pass': 'Regional-Pass',
    'family-card': 'Familienkarte',
  };

  const handleClick = () => {
    if (product.bookingUrl) {
      window.open(product.bookingUrl, '_blank');
    } else {
      console.log('Product clicked:', product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg shadow-sm overflow-hidden flex flex-col text-left transition-all cursor-pointer"
      style={{
        backgroundColor: 'var(--sbb-color-white)',
        border: '1px solid var(--sbb-color-cloud)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Category Header */}
      <div
        className="px-4 py-3 text-xs font-medium"
        style={{ backgroundColor: '#D4A5A5', color: 'white' }}
      >
        {categoryLabels[product.category] || product.category}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-base mb-2"
          style={{ color: 'var(--sbb-color-charcoal)' }}
        >
          {product.title || product.name}
        </h3>

        {/* Duration */}
        {product.duration && (
          <p className="text-sm mb-2" style={{ color: 'var(--sbb-color-granite)' }}>
            {product.duration.days} Tage
            {product.duration.type === 'flex' && ' (flexibel)'}
          </p>
        )}

        {/* Pricing */}
        {product.pricing && (
          <div className="mt-auto pt-2 border-t" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--sbb-color-granite)' }}>2. Klasse</span>
              <span className="font-bold" style={{ color: 'var(--sbb-color-charcoal)' }}>
                CHF {product.pricing.adult_2nd}
              </span>
            </div>
            {product.pricing.adult_1st && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--sbb-color-granite)' }}>1. Klasse</span>
                <span className="font-bold" style={{ color: 'var(--sbb-color-charcoal)' }}>
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
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--sbb-color-cloud)',
                  color: 'var(--sbb-color-granite)',
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// Holiday Product Card
function HolidayCard({ product }: { product: HolidayProduct }) {
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
    } else {
      console.log('Product clicked:', product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg shadow-sm overflow-hidden flex flex-col text-left transition-all cursor-pointer"
      style={{
        backgroundColor: 'var(--sbb-color-white)',
        border: '1px solid var(--sbb-color-cloud)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Category Header */}
      <div
        className="px-4 py-3 text-xs font-medium flex justify-between items-center"
        style={{
          backgroundColor: categoryColors[product.category] || '#8FA89B',
          color: 'white',
        }}
      >
        <span>{product.category.replace(/-/g, ' ')}</span>
        {product.difficulty_level && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: difficultyColors[product.difficulty_level] || '#8FA89B',
            }}
          >
            {product.difficulty_level}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-base mb-2"
          style={{ color: 'var(--sbb-color-charcoal)' }}
        >
          {product.name}
        </h3>

        {/* Region & Duration */}
        <div className="flex gap-4 text-sm mb-2" style={{ color: 'var(--sbb-color-granite)' }}>
          {product.region && <span>{product.region}</span>}
          {product.duration && (
            <span>
              {product.duration.days} Tage
              {product.duration.nights && ` / ${product.duration.nights} Nächte`}
            </span>
          )}
        </div>

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="text-sm space-y-1 flex-1" style={{ color: 'var(--sbb-color-iron)' }}>
            {product.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--sbb-color-red)' }}>•</span>
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        {product.price && (
          <div
            className="mt-3 pt-2 border-t flex justify-between items-center"
            style={{ borderColor: 'var(--sbb-color-cloud)' }}
          >
            <span className="text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
              Ab
            </span>
            <span className="font-bold text-lg" style={{ color: 'var(--sbb-color-red)' }}>
              CHF {product.price.from}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
