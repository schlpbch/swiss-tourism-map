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
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, MapPin } from 'lucide-react';
import FullPageError from '../FullPageError';
import EmptyFilterState from '../EmptyFilterState';
import CheckboxFilterGroup from '../CheckboxFilterGroup';
import ResortCard from './ResortCard';

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
  const debouncedSearch = useDebounce(searchQuery);

  // Phase 1A: Elevation filter bounds
  const [elevationFilterMin, setElevationFilterMin] = useState(0);
  const [elevationFilterMax, setElevationFilterMax] = useState(5000);

  // Phase 1B: Sort option
  const [sortBy, setSortBy] = useState<'name' | 'elevation-high' | 'elevation-low' | 'region'>(
    'name'
  );

  // Phase 1D: Distance filter
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
          const elevations = data.map((r) => r.elevation);
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
    return resorts.filter((resort) => {
      // Season filter
      if (selectedSeasons.size < 4) {
        const hasMatchingSeason = resort.seasons.some((season) => selectedSeasons.has(season));
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
      if (userLocation && maxDistance < 500) {
        // 500km is the max range
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          resort.coordinates.latitude,
          resort.coordinates.longitude
        );
        if (distance > maxDistance) {
          return false;
        }
      }

      // Phase 2B: Activities filter
      if (selectedActivities.size > 0 && resort.activities) {
        const hasActivity = resort.activities.some((activity) => selectedActivities.has(activity));
        if (!hasActivity) {
          return false;
        }
      }

      // Search query filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = resort.name.toLowerCase().includes(query);
        const matchesRegion = resort.region.toLowerCase().includes(query);
        return matchesName || matchesRegion;
      }

      return true;
    });
  }, [
    resorts,
    selectedSeasons,
    selectedRegion,
    debouncedSearch,
    elevationFilterMin,
    elevationFilterMax,
    userLocation,
    maxDistance,
    selectedActivities,
  ]);

  // Get unique regions
  const regions = useMemo(() => {
    const regs = new Set<string>();
    resorts.forEach((resort) => {
      regs.add(resort.region);
    });
    return Array.from(regs).sort();
  }, [resorts]);

  // Get elevation range
  const elevationRange = useMemo(() => {
    if (resorts.length === 0) return { min: 0, max: 5000 };
    const elevations = resorts.map((r) => r.elevation);
    return {
      min: Math.min(...elevations),
      max: Math.max(...elevations),
    };
  }, [resorts]);

  // Phase 1B: Sort resorts
  const sortedResorts = useMemo(() => {
    const sorted = [...filteredResorts];
    switch (sortBy) {
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
      <div className="flex h-full bg-[var(--background)]">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r border-[var(--border)] p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        {/* Card grid skeleton */}
        <div className="flex-1 p-6">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-[180px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] overflow-hidden">
                <Skeleton className="h-8 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-14" />
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
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <ScrollArea className="w-64 border-r bg-[var(--background)] border-[var(--border)]">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4 text-[var(--foreground)]">
            {t(language, 'common.filter')}
          </h2>

          {/* Search */}
          <div className="mb-6">
            <Label className="mb-2">{t(language, 'common.search')}</Label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'resorts.searchPlaceholder')}
            />
          </div>

          <Separator className="mb-6" />

          {/* Seasons */}
          <div className="mb-6">
            <Label className="mb-2">{t(language, 'map.seasons')}</Label>
            <CheckboxFilterGroup
              options={(['winter', 'spring', 'summer', 'autumn'] as Season[]).map((season) => ({
                value: season,
                label: t(language, `seasons.${season}`),
              }))}
              selected={selectedSeasons}
              onToggle={(season) => {
                setSelectedSeasons((prev) => {
                  const next = new Set(prev);
                  if (next.has(season as Season)) {
                    next.delete(season as Season);
                  } else {
                    next.add(season as Season);
                  }
                  return next;
                });
              }}
            />
          </div>

          <Separator className="mb-6" />

          {/* Region Filter */}
          <div className="mb-6">
            <Label className="mb-2">{t(language, 'common.region')}</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t(language, 'common.allRegions')}</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="mb-6" />

          {/* Elevation Filter */}
          <div className="mb-6">
            <Label className="mb-2">
              {t(language, 'resorts.elevationRange', {
                min: elevationFilterMin,
                max: elevationFilterMax,
              })}
            </Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-[var(--muted-foreground)] mb-1">
                  {t(language, 'resorts.minElevation', { min: elevationFilterMin })}
                </Label>
                <Slider
                  value={[elevationFilterMin]}
                  min={minElevation}
                  max={maxElevation}
                  step={50}
                  onValueChange={([val]) => {
                    if (val <= elevationFilterMax) {
                      setElevationFilterMin(val);
                    }
                  }}
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--muted-foreground)] mb-1">
                  {t(language, 'resorts.maxElevation', { max: elevationFilterMax })}
                </Label>
                <Slider
                  value={[elevationFilterMax]}
                  min={minElevation}
                  max={maxElevation}
                  step={50}
                  onValueChange={([val]) => {
                    if (val >= elevationFilterMin) {
                      setElevationFilterMax(val);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Distance Filter */}
          <div className="mb-6">
            <Label className="mb-2">{t(language, 'resorts.proximity')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    variant="outline"
                    className="w-full mb-2 gap-2"
                    pressed={!!userLocation}
                    onPressedChange={(pressed) => {
                      setLocationError(null);
                      if (pressed) {
                        if ('geolocation' in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setUserLocation({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                              });
                              setLocationError(null);
                            },
                            () => {
                              setLocationError(t(language, 'errors.geolocationFailed'));
                              setUserLocation(null);
                            }
                          );
                        } else {
                          setLocationError(t(language, 'errors.geolocationNotSupported'));
                        }
                      } else {
                        setUserLocation(null);
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                    {userLocation
                      ? t(language, 'resorts.locationEnabled')
                      : t(language, 'resorts.useMyLocation')}
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>{t(language, 'resorts.useMyLocation')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {locationError && (
              <Alert variant="destructive" className="mb-2 py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{locationError}</AlertDescription>
              </Alert>
            )}
            {userLocation && (
              <div>
                <Label className="text-xs text-[var(--muted-foreground)] mb-1">
                  {t(language, 'resorts.radius', { distance: maxDistance })}
                </Label>
                <Slider
                  value={[maxDistance]}
                  min={1}
                  max={500}
                  step={10}
                  onValueChange={([val]) => setMaxDistance(val)}
                />
                <p className="text-xs mt-2 text-[var(--muted-foreground)]">
                  {t(language, 'resorts.filteringByDistance', { distance: maxDistance })}
                </p>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Activities Filter */}
          <div className="mb-6">
            <Label className="mb-2">{t(language, 'resorts.activities')}</Label>
            <CheckboxFilterGroup
              options={RESORT_ACTIVITIES.map((activity) => ({
                value: activity,
                label: activity,
              }))}
              selected={selectedActivities}
              onToggle={(activity) => {
                setSelectedActivities((prev) => {
                  const next = new Set(prev);
                  if (next.has(activity)) {
                    next.delete(activity);
                  } else {
                    next.add(activity);
                  }
                  return next;
                });
              }}
            />
          </div>

          <Separator className="mb-6" />

          {/* Reset button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSelectedSeasons(new Set(['winter', 'spring', 'summer', 'autumn']));
              setSelectedRegion('all');
              setSearchQuery('');
              setElevationFilterMin(minElevation);
              setElevationFilterMax(maxElevation);
              setSortBy('name');
              setUserLocation(null);
              setMaxDistance(100);
              setLocationError(null);
              setSelectedActivities(new Set());
            }}
          >
            {t(language, 'common.resetFilter')}
          </Button>

          {/* Results count */}
          <div className="mt-4 text-xs text-center text-[var(--muted-foreground)]">
            {t(language, 'map.resortsCount', { count: filteredResorts.length })} / {resorts.length}
          </div>
        </div>
      </ScrollArea>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {t(language, 'resorts.title')}
            </h1>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t(language, 'resorts.sortByName')}</SelectItem>
                <SelectItem value="elevation-high">
                  {t(language, 'resorts.sortByElevationDesc')}
                </SelectItem>
                <SelectItem value="elevation-low">
                  {t(language, 'resorts.sortByElevationAsc')}
                </SelectItem>
                <SelectItem value="region">{t(language, 'resorts.sortByRegion')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredResorts.length === 0 ? (
            <EmptyFilterState
              title={t(language, 'resorts.noResortsFound')}
              description={t(language, 'common.tryDifferentFilters')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedResorts.map((resort) => (
                <ResortCard key={resort.name} resort={resort} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
