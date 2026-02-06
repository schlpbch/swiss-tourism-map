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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="w-full h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {t(language, 'loadingMessages.resorts')}
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
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <ScrollArea className="w-64 border-r bg-[var(--background)] border-[var(--border)]">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4 text-[var(--foreground)]">
            {t(language, 'common.filter')}
          </h2>

          {/* Search */}
          <div className="mb-6">
            <Label className="mb-2">
              {t(language, 'common.search')}
            </Label>
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
            <Label className="mb-2">
              {t(language, 'map.seasons')}
            </Label>
          <div className="space-y-2">
            {(['winter', 'spring', 'summer', 'autumn'] as Season[]).map(season => {
              const isSelected = selectedSeasons.has(season);
              return (
                <label
                  key={season}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors',
                    isSelected ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {
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
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    {t(language, `seasons.${season}`)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

          <Separator className="mb-6" />

          {/* Region Filter */}
          <div className="mb-6">
            <Label className="mb-2">
              {t(language, 'common.region')}
            </Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(language, 'common.allRegions')}</SelectItem>
              {regions.map(region => (
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
              {t(language, 'resorts.elevationRange', { min: elevationFilterMin, max: elevationFilterMax })}
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
            <Label className="mb-2">
              {t(language, 'resorts.proximity')}
            </Label>
            <Button
              variant={userLocation ? 'secondary' : 'outline'}
              className="w-full mb-2"
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
                    () => {
                      setLocationError(t(language, 'errors.geolocationFailed'));
                      setUserLocation(null);
                    }
                  );
                } else {
                  setLocationError(t(language, 'errors.geolocationNotSupported'));
                }
              }}
            >
              {userLocation ? t(language, 'resorts.locationEnabled') : t(language, 'resorts.useMyLocation')}
            </Button>
            {locationError && (
              <p className="text-xs mb-2 text-[var(--destructive)]">{locationError}</p>
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
            <Label className="mb-2">
              {t(language, 'resorts.activities')}
            </Label>
            <div className="space-y-2">
              {RESORT_ACTIVITIES.map(activity => {
                const isSelected = selectedActivities.has(activity);
                return (
                  <label
                    key={activity}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors',
                      isSelected ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {
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
                    />
                    <span className="text-sm text-[var(--foreground)]">{activity}</span>
                  </label>
                );
              })}
            </div>
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
              <SelectItem value="elevation-high">{t(language, 'resorts.sortByElevationDesc')}</SelectItem>
              <SelectItem value="elevation-low">{t(language, 'resorts.sortByElevationAsc')}</SelectItem>
              <SelectItem value="region">{t(language, 'resorts.sortByRegion')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredResorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--muted-foreground)]">
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
      </ScrollArea>
    </div>
  );
}

// Resort Card Component
function ResortCard({ resort }: { resort: Resort }) {
  const { language } = useLanguageStore();
  return (
    <Card className="overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-md">
      {/* Header */}
      <CardHeader className="px-4 py-2 bg-[var(--sbb-color-orange-light)] text-white">
        <CardTitle className="text-xs font-medium">
          {t(language, 'resorts.alpineResort')}
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 text-[var(--primary)]">
          {resort.name}
        </h3>

        <p className="text-xs mb-2 text-[var(--muted-foreground)]">{resort.region}</p>
        <p className="text-xs mb-3 text-[var(--muted-foreground)]">
          {t(language, 'resorts.aboveSeaLevel', { elevation: resort.elevation })}
        </p>
        <p className="text-xs mb-3 text-[var(--muted-foreground)]">
          {resort.coordinates.latitude.toFixed(2)}°N, {resort.coordinates.longitude.toFixed(2)}°E
        </p>

        {resort.description && (
          <p className="text-sm mb-3 line-clamp-3 text-[var(--muted-foreground)]">
            {resort.description}
          </p>
        )}

        {/* Activity Tags */}
        {resort.activities && resort.activities.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {resort.activities.slice(0, 4).map((activity, i) => (
              <Badge key={i} variant="outline">{activity}</Badge>
            ))}
            {resort.activities.length > 4 && (
              <Badge variant="outline">+{resort.activities.length - 4}</Badge>
            )}
          </div>
        )}

        {/* Seasons */}
        <div className="mb-4">
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

        {/* Season Details */}
        {resort.seasonDetails && (
          <div className="mb-4 border-t pt-3 border-[var(--border)]">
            {resort.seasonDetails.winter?.skiArea && (
              <p className="text-xs mb-2 text-[var(--muted-foreground)]">
                {t(language, 'resorts.skiArea', { area: resort.seasonDetails.winter.skiArea })}
              </p>
            )}
            {resort.seasonDetails.summer?.hikingTrails && (
              <p className="text-xs mb-2 text-[var(--muted-foreground)]">
                {t(language, 'resorts.hikingTrails', { trails: resort.seasonDetails.summer.hikingTrails })}
              </p>
            )}
            {resort.seasonDetails.winter?.months && (
              <p className="text-xs mb-2 text-[var(--muted-foreground)]">
                {t(language, 'resorts.winterMonths', { months: resort.seasonDetails.winter.months.join(', ') })}
              </p>
            )}
            {resort.seasonDetails.summer?.months && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {t(language, 'resorts.summerMonths', { months: resort.seasonDetails.summer.months.join(', ') })}
              </p>
            )}
          </div>
        )}

        {/* Resort Details Grid */}
        {(resort.verticalDrop || resort.lifts || resort.maxElevation || resort.difficulty) && (
          <div className="mb-4 border-t pt-3 border-[var(--border)]">
            <div className="grid grid-cols-2 gap-3">
              {resort.maxElevation && (
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {t(language, 'resorts.peakElevation')}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{resort.maxElevation}m</p>
                </div>
              )}
              {resort.verticalDrop && (
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {t(language, 'resorts.verticalDrop')}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{resort.verticalDrop}m</p>
                </div>
              )}
              {resort.lifts && (
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {t(language, 'resorts.lifts')}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{resort.lifts}</p>
                </div>
              )}
              {resort.difficulty && (
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {t(language, 'resorts.difficulty')}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {resort.difficulty === 'easy' ? t(language, 'difficulty.easy') : resort.difficulty === 'intermediate' ? t(language, 'difficulty.moderate') : t(language, 'difficulty.challenging')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ski Runs Distribution */}
        {resort.runs && (
          <div className="mb-4 border-t pt-3 border-[var(--border)]">
            <p className="text-xs font-semibold mb-2 text-[var(--foreground)]">
              {t(language, 'resorts.runs', { total: resort.runs.total })}
            </p>
            <div className="space-y-1">
              {resort.runs.beginner > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="difficulty-easy" className="text-xs">
                    {t(language, 'resorts.beginner')}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">{resort.runs.beginner}</span>
                </div>
              )}
              {resort.runs.intermediate > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="difficulty-moderate" className="text-xs">
                    {t(language, 'resorts.intermediate')}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">{resort.runs.intermediate}</span>
                </div>
              )}
              {resort.runs.advanced > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="difficulty-hard" className="text-xs">
                    {t(language, 'resorts.advanced')}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">{resort.runs.advanced}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Best For Tags */}
        {resort.bestFor && resort.bestFor.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2 text-[var(--foreground)]">
              {t(language, 'resorts.bestFor')}
            </p>
            <div className="flex flex-wrap gap-1">
              {resort.bestFor.map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {resort.amenities && resort.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2 text-[var(--foreground)]">
              {t(language, 'resorts.amenities')}
            </p>
            <div className="flex flex-wrap gap-1">
              {resort.amenities.slice(0, 5).map((amenity, i) => (
                <Badge key={i} variant="outline">{amenity}</Badge>
              ))}
              {resort.amenities.length > 5 && (
                <Badge variant="outline">+{resort.amenities.length - 5}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Family Friendly Badge */}
        {resort.familyFriendly && (
          <div className="mb-4 p-2 rounded bg-[var(--secondary)]/10">
            <p className="text-xs font-semibold text-[var(--secondary)]">
              👨‍👩‍👧‍👦 {t(language, 'common.familyFriendly')}
            </p>
          </div>
        )}

        {/* Action Links */}
        <div className="mt-auto pt-3 border-t border-[var(--border)] flex gap-2">
          {(resort.website || resort.url) && (
            <Button asChild size="sm" className="flex-1">
              <a href={resort.website || resort.url} target="_blank" rel="noopener noreferrer">
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
