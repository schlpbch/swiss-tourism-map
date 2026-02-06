/**
 * MapContainer component - Main Leaflet map with markers
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Sight, ProminenceTier } from '../../types/sight';
import type { Resort } from '../../types/resort';
import { searchSights } from '../../api/sights';
import { getResorts } from '../../api/resorts';
import { initializeMcp } from '../../api/mcp-client';
import ProminenceFilter from './ProminenceFilter';
import { useProminenceFilter } from '../../hooks/useProminenceFilter';
import { getMarkerColorName, countSightsByTier } from '../../utils/prominence';
import { t } from '../../i18n';
import { useLanguageStore } from '../../store/languageStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FullPageError from '../FullPageError';
import CardActionFooter from '../CardActionFooter';
import BadgeList from '../BadgeList';

// Switzerland center coordinates
const SWITZERLAND_CENTER: [number, number] = [46.8, 8.2];
const DEFAULT_ZOOM = 8;

// Dynamic marker icon function for prominence tiers
function createProminenceIcon(tier?: ProminenceTier): Icon {
  const colorName = getMarkerColorName(tier);

  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colorName}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Resort marker icon (orange)
const resortIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapContainer() {
  const { language } = useLanguageStore();
  const [allSights, setAllSights] = useState<Sight[]>([]); // All sights for tier counts
  const [displayedSights, setDisplayedSights] = useState<Sight[]>([]); // Filtered sights for map display
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate tier counts from all sights
  const tierCounts = useMemo(() => countSightsByTier(allSights), [allSights]);

  // Callback for when filter changes (triggers server-side filtering)
  const handleFilterChange = useCallback(async (minProminence?: number, maxProminence?: number) => {
    try {
      setFilterLoading(true);

      const filtered = await searchSights({
        limit: 1000,
        language: 'de',
        min_prominence: minProminence,
        max_prominence: maxProminence,
      });

      setDisplayedSights(filtered);
    } catch (err) {
      // Filter error - keep existing sights displayed
    } finally {
      setFilterLoading(false);
    }
  }, []);

  // Prominence filter state
  const {
    selectedTiers,
    isExpanded,
    toggleTier,
    toggleAll,
    toggleExpanded,
    hasActiveFilters,
    prominenceRange,
  } = useProminenceFilter({ onFilterChange: handleFilterChange });

  // Initial data load - load all sights to get tier counts and initial display
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        await initializeMcp();

        const [sightsData, resortsData] = await Promise.all([
          searchSights({ limit: 1000, language: 'de' }),
          getResorts(),
        ]);

        setAllSights(sightsData); // Store all for tier counts
        setDisplayedSights(sightsData); // Initially display all
        setResorts(resortsData);
      } catch (err) {
        setError(t(language, 'errors.loadingData'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Apply saved filter on initial load
  useEffect(() => {
    if (allSights.length > 0 && prominenceRange.min !== undefined) {
      handleFilterChange(prominenceRange.min, prominenceRange.max);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSights.length]); // Only run once when sights first load

  if (loading) {
    return (
      <div className="w-full h-full flex bg-[var(--background)]">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r border-[var(--border)] p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        {/* Map area skeleton */}
        <div className="flex-1 p-4">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <FullPageError error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="w-full h-full">
      <LeafletMapContainer
        center={SWITZERLAND_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sight markers */}
        {displayedSights.map((sight) => (
          <Marker
            key={sight.id}
            position={[sight.location.latitude, sight.location.longitude]}
            icon={createProminenceIcon(sight.prominence?.tier)}
          >
            <Popup>
              <div className="p-3 min-w-70">
                <h3 className="font-bold text-base mb-1 text-[var(--primary)]">
                  {sight.title}
                </h3>

                {sight.region && (
                  <p className="text-xs mb-2 text-[var(--muted-foreground)]">
                    {sight.region}
                  </p>
                )}

                <p className="text-xs mb-3 text-[var(--muted-foreground)]">
                  {sight.category.join(', ')}
                </p>

                <p className="text-sm leading-relaxed mb-3 text-[var(--foreground)]">
                  {sight.description}
                </p>

                {sight.prominence && (
                  <div className="mb-3">
                    <Badge variant="secondary">
                      {sight.prominence.tier} - {sight.prominence.score}/100
                    </Badge>
                  </div>
                )}

                {sight.tags && sight.tags.length > 0 && (
                  <BadgeList items={sight.tags} variant="outline" maxVisible={4} className="mt-2" />
                )}

                {/* Action Links */}
                <CardActionFooter
                  externalUrl={sight.website || sight.url}
                  internalHref="/products"
                  internalLabel={t(language, 'nav.products')}
                  className="mt-4 pt-3"
                />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resort markers */}
        {resorts.map((resort) => (
          <Marker
            key={resort.name}
            position={[resort.coordinates.latitude, resort.coordinates.longitude]}
            icon={resortIcon}
          >
            <Popup>
              <div className="p-3 min-w-70">
                <h3 className="font-bold text-base mb-1 text-[var(--primary)]">
                  {resort.name}
                </h3>

                <div className="mb-2 text-xs space-y-1 text-[var(--muted-foreground)]">
                  <p>{resort.region}</p>
                  <p>{t(language, 'map.elevation', { elevation: resort.elevation })}</p>
                </div>

                <div className="mb-3 border-t pt-2 border-[var(--border)]">
                  <p className="text-xs font-semibold mb-1 text-[var(--foreground)]">
                    {t(language, 'map.seasons')}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {resort.seasons.map((season) => (
                      <Badge key={season} variant="resort">
                        {t(language, `seasons.${season}`)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[var(--muted-foreground)]">
                  {t(language, 'resorts.alpineResort')}
                </p>

                {/* Action Links */}
                <CardActionFooter
                  externalUrl={resort.website || resort.url}
                  internalHref="/products"
                  internalLabel={t(language, 'nav.products')}
                  className="mt-4 pt-2"
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>

      {/* Prominence filter overlay */}
      <ProminenceFilter
        selectedTiers={selectedTiers}
        tierCounts={tierCounts}
        isExpanded={isExpanded}
        onToggleTier={toggleTier}
        onToggleAll={toggleAll}
        onToggleExpanded={toggleExpanded}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Filter loading indicator */}
      {filterLoading && (
        <Card className="absolute top-20 left-4 px-3 py-2 shadow-lg z-[1000] flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-xs text-[var(--muted-foreground)]">
            {t(language, 'loadingMessages.filteredData')}
          </span>
        </Card>
      )}

      {/* Stats overlay */}
      <Card className="absolute top-4 right-4 px-4 py-3 shadow-lg z-[1000]">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400" />
            <span className="text-[var(--foreground)]">
              {t(language, 'map.sightsCount', { displayed: displayedSights.length, total: allSights.length })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-[var(--foreground)]">
              {t(language, 'map.resortsCount', { count: resorts.length })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
