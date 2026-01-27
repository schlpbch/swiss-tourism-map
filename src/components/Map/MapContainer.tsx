/**
 * MapContainer component - Main Leaflet map with markers
 * Styled with SBB Lyne Design System
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
      console.log(`Filtering sights: prominence ${minProminence}-${maxProminence}`);

      const filtered = await searchSights({
        limit: 1000,
        language: 'de',
        min_prominence: minProminence,
        max_prominence: maxProminence,
      });

      console.log(`Filtered to ${filtered.length} sights`);
      setDisplayedSights(filtered);
    } catch (err) {
      console.error('Error filtering sights:', err);
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

        console.log('Initializing MCP connection...');
        await initializeMcp();

        console.log('Loading tourism data via MCP...');

        const [sightsData, resortsData] = await Promise.all([
          searchSights({ limit: 1000, language: 'de' }),
          getResorts(),
        ]);

        console.log(`Loaded ${sightsData.length} sights, ${resortsData.length} resorts`);

        setAllSights(sightsData); // Store all for tier counts
        setDisplayedSights(sightsData); // Initially display all
        setResorts(resortsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Fehler beim Laden der Daten vom MCP-Server. Bitte versuchen Sie es später erneut.');
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
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--sbb-color-milk)' }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: 'var(--sbb-color-red)', borderTopColor: 'transparent' }}
          />
          <p
            className="mt-4 text-sm"
            style={{ color: 'var(--sbb-color-granite)' }}
          >
            Lade Tourismus-Daten...
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
            borderRadius: 'var(--sbb-border-radius-4x)'
          }}
        >
          <div className="text-5xl mb-4" style={{ color: 'var(--sbb-color-red)' }}>
            ⚠
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            Fehler
          </h3>
          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--sbb-color-granite)' }}
          >
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: 'var(--sbb-color-red)',
              color: 'var(--sbb-color-white)',
              borderRadius: 'var(--sbb-border-radius-4x)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
          >
            Neu laden
          </button>
        </div>
      </div>
    );
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
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: 'var(--sbb-color-red)' }}
                >
                  {sight.title}
                </h3>

                {sight.region && (
                  <p
                    className="text-xs mb-2"
                    style={{ color: 'var(--sbb-color-granite)' }}
                  >
                    📍 {sight.region}
                  </p>
                )}

                <p
                  className="text-xs mb-3"
                  style={{ color: 'var(--sbb-color-granite)' }}
                >
                  {sight.category.join(', ')}
                </p>

                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: 'var(--sbb-color-iron)' }}
                >
                  {sight.description}
                </p>

                {sight.prominence && (
                  <div className="mb-3">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'var(--sbb-color-sky-light)',
                        color: 'white'
                      }}
                    >
                      ⭐ {sight.prominence.tier} - {sight.prominence.score}/100
                    </span>
                  </div>
                )}

                {sight.tags && sight.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sight.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--sbb-color-cloud)',
                          color: 'var(--sbb-color-charcoal)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Links */}
                <div className="mt-4 pt-3 border-t flex gap-2" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
                  {(sight.website || sight.url) && (
                    <a
                      href={sight.website || sight.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-2 py-1 rounded text-xs font-medium text-center transition-colors"
                      style={{
                        backgroundColor: 'var(--sbb-color-red)',
                        color: 'white',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
                    >
                      🌐 Website
                    </a>
                  )}
                  <a
                    href="/products"
                    className="flex-1 px-2 py-1 rounded text-xs font-medium text-center transition-colors"
                    style={{
                      backgroundColor: 'var(--sbb-color-red)',
                      color: 'white',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
                  >
                    🎫 Produkte
                  </a>
                </div>
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
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: 'var(--sbb-color-red)' }}
                >
                  {resort.name}
                </h3>

                <div className="mb-2 text-xs space-y-1">
                  <p style={{ color: 'var(--sbb-color-granite)' }}>
                    📍 {resort.region}
                  </p>
                  <p style={{ color: 'var(--sbb-color-granite)' }}>
                    ⛰️ Elevation: {resort.elevation}m
                  </p>
                </div>

                <div className="mb-3 border-t pt-2" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: 'var(--sbb-color-charcoal)' }}
                  >
                    Saisons:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {resort.seasons.map((season) => {
                      const seasonEmojis: Record<string, string> = {
                        'winter': '❄️',
                        'spring': '🌸',
                        'summer': '☀️',
                        'autumn': '🍂'
                      };
                      return (
                        <span
                          key={season}
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: 'var(--sbb-color-orange-light)',
                            color: 'white'
                          }}
                        >
                          {seasonEmojis[season] || '📅'} {season.charAt(0).toUpperCase() + season.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <p
                  className="text-xs"
                  style={{ color: 'var(--sbb-color-granite)' }}
                >
                  🏔️ Alpine Resort
                </p>

                {/* Action Links */}
                <div className="mt-4 pt-2 border-t flex gap-2" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
                  {(resort.website || resort.url) && (
                    <a
                      href={resort.website || resort.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-2 py-1 rounded text-xs font-medium text-center transition-colors"
                      style={{
                        backgroundColor: 'var(--sbb-color-red)',
                        color: 'white',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
                    >
                      🌐 Website
                    </a>
                  )}
                  <a
                    href="/products"
                    className="flex-1 px-2 py-1 rounded text-xs font-medium text-center transition-colors"
                    style={{
                      backgroundColor: 'var(--sbb-color-red)',
                      color: 'white',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red125)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--sbb-color-red)'}
                  >
                    🎫 Produkte
                  </a>
                </div>
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
        <div
          className="absolute top-20 left-4 px-3 py-2 shadow-lg z-1000 flex items-center gap-2"
          style={{
            backgroundColor: 'var(--sbb-color-white)',
            borderRadius: 'var(--sbb-border-radius-4x)',
            border: '1px solid var(--sbb-color-cloud)'
          }}
        >
          <div
            className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
            style={{ borderColor: 'var(--sbb-color-red)', borderTopColor: 'transparent' }}
          />
          <span className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
            Lade gefilterte Daten...
          </span>
        </div>
      )}

      {/* Stats overlay with SBB styling */}
      <div
        className="absolute top-4 right-4 px-4 py-3 shadow-lg z-1000"
        style={{
          backgroundColor: 'var(--sbb-color-white)',
          borderRadius: 'var(--sbb-border-radius-4x)',
          border: '1px solid var(--sbb-color-cloud)'
        }}
      >
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--sbb-color-sky-light)' }}
            />
            <span style={{ color: 'var(--sbb-color-charcoal)' }}>
              {displayedSights.length} von {allSights.length} Sehenswürdigkeiten
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--sbb-color-orange-light)' }}
            />
            <span style={{ color: 'var(--sbb-color-charcoal)' }}>
              {resorts.length} Resorts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
