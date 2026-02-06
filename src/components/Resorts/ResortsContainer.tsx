/**
 * ResortsContainer Component
 * Grid view of alpine resorts with filtering capabilities
 */

import { useState, useEffect, useMemo } from 'react';
import type { Resort, Season } from '../../types/resort';
import { RESORT_ACTIVITIES } from '../../types/resort';
import { getResorts, calculateDistance } from '../../api/resorts';
import { initializeMcp } from '../../api/mcp-client';
import { t } from '../../i18n';
import { useLanguageStore } from '../../store/languageStore';

export default function ResortsContainer() {
  const { language } = useLanguageStore();
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSeasons, setSelectedSeasons] = useState<Set<Season>>(
    new Set(['winter', 'spring', 'summer', 'autumn'])
  );
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [minElevation, setMinElevation] = useState(0);
  const [maxElevation, setMaxElevation] = useState(5000);
  const [searchQuery, setSearchQuery] = useState('');

  // Phase 1A: Elevation filter bounds
  const [elevationFilterMin, setElevationFilterMin] = useState(0);
  const [elevationFilterMax, setElevationFilterMax] = useState(5000);

  // Phase 1B: Sort option
  const [sortBy, setSortBy] = useState<'name' | 'elevation-high' | 'elevation-low' | 'region'>('name');

  // Phase 1D: Distance filter
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(100); // km
  const [locationError, setLocationError] = useState<string | null>(null);

  // Phase 2B: Activities filter
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    async function loadResorts() {
      try {
        setLoading(true);
        setError(null);

        await initializeMcp();
        const data = await getResorts();

        setResorts(data);

        // Set elevation range based on actual data
        if (data.length > 0) {
          const elevations = data.map(r => r.elevation);
          const min = Math.min(...elevations);
          const max = Math.max(...elevations);
          setMinElevation(min);
          setMaxElevation(max);
          // Initialize filter bounds to full range
          setElevationFilterMin(min);
          setElevationFilterMax(max);
        }
      } catch (err) {
        console.error('Error loading resorts:', err);
        setError(t(language, 'errors.loadingResorts'));
      } finally {
        setLoading(false);
      }
    }

    loadResorts();
  }, []);

  // Filter resorts
  const filteredResorts = useMemo(() => {
    return resorts.filter(resort => {
      // Season filter
      if (selectedSeasons.size < 4) {
        const hasMatchingSeason = resort.seasons.some(season =>
          selectedSeasons.has(season)
        );
        if (!hasMatchingSeason) {
          return false;
        }
      }

      // Region filter
      if (selectedRegion !== 'all') {
        if (resort.region !== selectedRegion) {
          return false;
        }
      }

      // Phase 1A: Elevation filter
      if (resort.elevation < elevationFilterMin || resort.elevation > elevationFilterMax) {
        return false;
      }

      // Phase 1D: Distance filter
      if (userLocation && maxDistance < 500) { // 500km is the max range
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          resort.coordinates.latitude, resort.coordinates.longitude
        );
        if (distance > maxDistance) {
          return false;
        }
      }

      // Phase 2B: Activities filter
      if (selectedActivities.size > 0 && resort.activities) {
        const hasActivity = resort.activities.some(activity =>
          selectedActivities.has(activity)
        );
        if (!hasActivity) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = resort.name.toLowerCase().includes(query);
        const matchesRegion = resort.region.toLowerCase().includes(query);
        return matchesName || matchesRegion;
      }

      return true;
    });
  }, [resorts, selectedSeasons, selectedRegion, searchQuery, elevationFilterMin, elevationFilterMax, userLocation, maxDistance, selectedActivities]);

  // Get unique regions
  const regions = useMemo(() => {
    const regs = new Set<string>();
    resorts.forEach(resort => {
      regs.add(resort.region);
    });
    return Array.from(regs).sort();
  }, [resorts]);

  // Get elevation range
  const elevationRange = useMemo(() => {
    if (resorts.length === 0) return { min: 0, max: 5000 };
    const elevations = resorts.map(r => r.elevation);
    return {
      min: Math.min(...elevations),
      max: Math.max(...elevations),
    };
  }, [resorts]);

  // Phase 1B: Sort resorts
  const sortedResorts = useMemo(() => {
    const sorted = [...filteredResorts];
    switch(sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'elevation-high':
        return sorted.sort((a, b) => b.elevation - a.elevation);
      case 'elevation-low':
        return sorted.sort((a, b) => a.elevation - b.elevation);
      case 'region':
        return sorted.sort((a, b) => a.region.localeCompare(b.region));
      default:
        return sorted;
    }
  }, [filteredResorts, sortBy]);

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
            {t(language, 'loadingMessages.resorts')}
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
            !
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
            placeholder={t(language, 'resorts.searchPlaceholder')}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--sbb-color-white)',
              border: '1px solid var(--sbb-color-cloud)',
              color: 'var(--sbb-color-charcoal)',
            }}
          />
        </div>

        {/* Seasons */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'map.seasons')}
          </label>
          <div className="space-y-2">
            {(['winter', 'spring', 'summer', 'autumn'] as Season[]).map(season => {
              const isSelected = selectedSeasons.has(season);
              return (
                <label
                  key={season}
                  className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--sbb-color-cloud)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedSeasons(prev => {
                        const next = new Set(prev);
                        if (next.has(season)) {
                          next.delete(season);
                        } else {
                          next.add(season);
                        }
                        return next;
                      });
                    }}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {t(language, `seasons.${season}`)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'common.region')}
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--sbb-color-white)',
              border: '1px solid var(--sbb-color-cloud)',
              color: 'var(--sbb-color-charcoal)',
            }}
          >
            <option value="all">{t(language, 'common.allRegions')}</option>
            {regions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Phase 1A: Elevation Filter */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'resorts.elevationRange', { min: elevationFilterMin, max: elevationFilterMax })}
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.minElevation', { min: elevationFilterMin })}
              </label>
              <input
                type="range"
                min={minElevation}
                max={maxElevation}
                value={elevationFilterMin}
                onChange={(e) => {
                  const newMin = Number(e.target.value);
                  if (newMin <= elevationFilterMax) {
                    setElevationFilterMin(newMin);
                  }
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.maxElevation', { max: elevationFilterMax })}
              </label>
              <input
                type="range"
                min={minElevation}
                max={maxElevation}
                value={elevationFilterMax}
                onChange={(e) => {
                  const newMax = Number(e.target.value);
                  if (newMax >= elevationFilterMin) {
                    setElevationFilterMax(newMax);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Phase 1D: Distance Filter */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'resorts.proximity')}
          </label>
          <button
            onClick={() => {
              setLocationError(null);
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    });
                    setLocationError(null);
                  },
                  (error) => {
                    setLocationError(t(language, 'errors.geolocationFailed'));
                    setUserLocation(null);
                  }
                );
              } else {
                setLocationError(t(language, 'errors.geolocationNotSupported'));
              }
            }}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2"
            style={{
              backgroundColor: userLocation ? 'var(--sbb-color-sky-light)' : 'var(--sbb-color-white)',
              color: userLocation ? 'white' : 'var(--sbb-color-charcoal)',
              border: '1px solid var(--sbb-color-cloud)',
              cursor: 'pointer',
            }}
          >
            {userLocation ? t(language, 'resorts.locationEnabled') : t(language, 'resorts.useMyLocation')}
          </button>
          {locationError && (
            <p className="text-xs mb-2" style={{ color: 'var(--sbb-color-red)' }}>
              {locationError}
            </p>
          )}
          {userLocation && (
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.radius', { distance: maxDistance })}
              </label>
              <input
                type="range"
                min="1"
                max="500"
                step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs mt-2" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.filteringByDistance', { distance: maxDistance })}
              </p>
            </div>
          )}
        </div>

        {/* Phase 2B: Activities Filter */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'resorts.activities')}
          </label>
          <div className="space-y-2">
            {RESORT_ACTIVITIES.map(activity => {
              const isSelected = selectedActivities.has(activity);
              return (
                <label
                  key={activity}
                  className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--sbb-color-cloud)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedActivities(prev => {
                        const next = new Set(prev);
                        if (next.has(activity)) {
                          next.delete(activity);
                        } else {
                          next.add(activity);
                        }
                        return next;
                      });
                    }}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {activity}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            setSelectedSeasons(new Set(['winter', 'spring', 'summer', 'autumn']));
            setSelectedRegion('all');
            setSearchQuery('');
            // Phase 1A: Reset elevation filter
            setElevationFilterMin(minElevation);
            setElevationFilterMax(maxElevation);
            // Phase 1B: Reset sort
            setSortBy('name');
            // Phase 1D: Reset distance filter
            setUserLocation(null);
            setMaxDistance(100);
            setLocationError(null);
            // Phase 2B: Reset activities filter
            setSelectedActivities(new Set());
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
          {t(language, 'map.resortsCount', { count: filteredResorts.length })} / {resorts.length}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'resorts.title')}
          </h1>
          {/* Phase 1B: Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'var(--sbb-color-milk)',
              color: 'var(--sbb-color-charcoal)',
              border: '1px solid var(--sbb-color-cloud)',
              cursor: 'pointer',
            }}
          >
            <option value="name">{t(language, 'resorts.sortByName')}</option>
            <option value="elevation-high">{t(language, 'resorts.sortByElevationDesc')}</option>
            <option value="elevation-low">{t(language, 'resorts.sortByElevationAsc')}</option>
            <option value="region">{t(language, 'resorts.sortByRegion')}</option>
          </select>
        </div>

        {filteredResorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
              {t(language, 'resorts.noResortsFound')} {t(language, 'common.tryDifferentFilters')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedResorts.map(resort => (
              <ResortCard key={resort.name} resort={resort} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Resort Card Component
function ResortCard({ resort }: { resort: Resort }) {
  const { language } = useLanguageStore();
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
      {/* Header */}
      <div
        className="px-4 py-2 text-xs font-medium"
        style={{ backgroundColor: 'var(--sbb-color-orange-light)', color: 'white' }}
      >
        {t(language, 'resorts.alpineResort')}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-base mb-2"
          style={{ color: 'var(--sbb-color-red)' }}
        >
          {resort.name}
        </h3>

        <p
          className="text-xs mb-2"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          {resort.region}
        </p>

        <p
          className="text-xs mb-3"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          {t(language, 'resorts.aboveSeaLevel', { elevation: resort.elevation })}
        </p>

        {/* Phase 1C: Coordinates Display */}
        <p
          className="text-xs mb-3"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          {resort.coordinates.latitude.toFixed(2)}°N, {resort.coordinates.longitude.toFixed(2)}°E
        </p>

        {/* Phase 2C: Description Text */}
        {resort.description && (
          <p
            className="text-sm mb-3 line-clamp-3"
            style={{ color: 'var(--sbb-color-granite)' }}
          >
            {resort.description}
          </p>
        )}

        {/* Phase 2B: Activity Tags */}
        {resort.activities && resort.activities.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {resort.activities.slice(0, 4).map((activity, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--sbb-color-cloud)',
                  color: 'var(--sbb-color-charcoal)'
                }}
              >
                {activity}
              </span>
            ))}
            {resort.activities.length > 4 && (
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--sbb-color-cloud)',
                  color: 'var(--sbb-color-charcoal)'
                }}
              >
                +{resort.activities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Seasons */}
        <div className="mb-4">
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            {t(language, 'map.seasons')}:
          </p>
          <div className="flex flex-wrap gap-1">
            {resort.seasons.map((season) => (
              <span
                key={season}
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: 'var(--sbb-color-orange-light)',
                  color: 'white'
                }}
              >
                {t(language, `seasons.${season}`)}
              </span>
            ))}
          </div>
        </div>

        {/* Phase 2D: Enhanced Season Information */}
        {resort.seasonDetails && (
          <div className="mb-4 border-t pt-3" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
            {resort.seasonDetails.winter?.skiArea && (
              <p className="text-xs mb-2" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.skiArea', { area: resort.seasonDetails.winter.skiArea })}
              </p>
            )}
            {resort.seasonDetails.summer?.hikingTrails && (
              <p className="text-xs mb-2" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.hikingTrails', { trails: resort.seasonDetails.summer.hikingTrails })}
              </p>
            )}
            {resort.seasonDetails.winter?.months && (
              <p className="text-xs mb-2" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.winterMonths', { months: resort.seasonDetails.winter.months.join(', ') })}
              </p>
            )}
            {resort.seasonDetails.summer?.months && (
              <p className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                {t(language, 'resorts.summerMonths', { months: resort.seasonDetails.summer.months.join(', ') })}
              </p>
            )}
          </div>
        )}

        {/* Phase 3: Resort Details Grid */}
        {(resort.verticalDrop || resort.lifts || resort.maxElevation || resort.difficulty) && (
          <div className="mb-4 border-t pt-3" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
            <div className="grid grid-cols-2 gap-3">
              {resort.maxElevation && (
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {t(language, 'resorts.peakElevation')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.maxElevation}m
                  </p>
                </div>
              )}
              {resort.verticalDrop && (
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {t(language, 'resorts.verticalDrop')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.verticalDrop}m
                  </p>
                </div>
              )}
              {resort.lifts && (
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {t(language, 'resorts.lifts')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.lifts}
                  </p>
                </div>
              )}
              {resort.difficulty && (
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--sbb-color-charcoal)' }}>
                    {t(language, 'resorts.difficulty')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.difficulty === 'easy' ? t(language, 'difficulty.easy') : resort.difficulty === 'intermediate' ? t(language, 'difficulty.moderate') : t(language, 'difficulty.challenging')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ski Runs Distribution */}
        {resort.runs && (
          <div className="mb-4 border-t pt-3" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
              {t(language, 'resorts.runs', { total: resort.runs.total })}
            </p>
            <div className="space-y-1">
              {resort.runs.beginner > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 rounded" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    {t(language, 'resorts.beginner')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.runs.beginner}
                  </span>
                </div>
              )}
              {resort.runs.intermediate > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 rounded" style={{ backgroundColor: '#FF9800', color: 'white' }}>
                    {t(language, 'resorts.intermediate')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.runs.intermediate}
                  </span>
                </div>
              )}
              {resort.runs.advanced > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 rounded" style={{ backgroundColor: '#F44336', color: 'white' }}>
                    {t(language, 'resorts.advanced')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--sbb-color-granite)' }}>
                    {resort.runs.advanced}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Best For Tags */}
        {resort.bestFor && resort.bestFor.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
              {t(language, 'resorts.bestFor')}
            </p>
            <div className="flex flex-wrap gap-1">
              {resort.bestFor.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--sbb-color-sky-light)',
                    color: 'white'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {resort.amenities && resort.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--sbb-color-charcoal)' }}>
              {t(language, 'resorts.amenities')}
            </p>
            <div className="flex flex-wrap gap-1">
              {resort.amenities.slice(0, 5).map((amenity, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)'
                  }}
                >
                  {amenity}
                </span>
              ))}
              {resort.amenities.length > 5 && (
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--sbb-color-cloud)',
                    color: 'var(--sbb-color-charcoal)'
                  }}
                >
                  +{resort.amenities.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Family Friendly Badge */}
        {resort.familyFriendly && (
          <div className="mb-4 p-2 rounded" style={{ backgroundColor: 'rgba(0, 150, 200, 0.1)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--sbb-color-sky)' }}>
              👨‍👩‍👧‍👦 {t(language, 'common.familyFriendly')}
            </p>
          </div>
        )}

        {/* Action Links */}
        <div className="mt-auto pt-3 border-t flex gap-2" style={{ borderColor: 'var(--sbb-color-cloud)' }}>
          {(resort.website || resort.url) && (
            <a
              href={resort.website || resort.url}
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
