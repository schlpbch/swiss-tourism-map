/**
 * ResortsContainer Component
 * Grid view of alpine resorts with filtering capabilities
 */

import { useState, useEffect, useMemo } from 'react';
import type { Resort, Season } from '../../types/resort';
import { SEASON_LABELS } from '../../types/resort';
import { getResorts } from '../../api/resorts';
import { initializeMcp } from '../../api/mcp-client';

export default function ResortsContainer() {
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
          setMinElevation(Math.min(...elevations));
          setMaxElevation(Math.max(...elevations));
        }
      } catch (err) {
        console.error('Error loading resorts:', err);
        setError('Fehler beim Laden der Resorts.');
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

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = resort.name.toLowerCase().includes(query);
        const matchesRegion = resort.region.toLowerCase().includes(query);
        return matchesName || matchesRegion;
      }

      return true;
    });
  }, [resorts, selectedSeasons, selectedRegion, searchQuery]);

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
            Lade Resorts...
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
            ⚠
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
          Filter
        </h2>

        {/* Search */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            Suche
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, Region..."
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
            Saison
          </label>
          <div className="space-y-2">
            {(['winter', 'spring', 'summer', 'autumn'] as Season[]).map(season => {
              const isSelected = selectedSeasons.has(season);
              const seasonEmojis: Record<Season, string> = {
                'winter': '❄️',
                'spring': '🌸',
                'summer': '☀️',
                'autumn': '🍂'
              };
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
                    {seasonEmojis[season]} {SEASON_LABELS[season]}
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
            Region
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
            <option value="all">Alle Regionen</option>
            {regions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Elevation Info */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            Höhenlage
          </label>
          <div
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--sbb-color-cloud)',
              color: 'var(--sbb-color-charcoal)',
            }}
          >
            {elevationRange.min}m - {elevationRange.max}m
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            setSelectedSeasons(new Set(['winter', 'spring', 'summer', 'autumn']));
            setSelectedRegion('all');
            setSearchQuery('');
          }}
          className="w-full px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--sbb-color-white)',
            color: 'var(--sbb-color-charcoal)',
            border: '1px solid var(--sbb-color-cloud)',
          }}
        >
          Filter zurücksetzen
        </button>

        {/* Results count */}
        <div className="mt-4 text-xs text-center" style={{ color: 'var(--sbb-color-granite)' }}>
          {filteredResorts.length} von {resorts.length} Resorts
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--sbb-color-charcoal)' }}
        >
          Schweizer Alpine Resorts
        </h1>

        {filteredResorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--sbb-color-granite)' }}>
              Keine Resorts gefunden. Versuchen Sie andere Filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResorts.map(resort => (
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
  const seasonEmojis: Record<Season, string> = {
    'winter': '❄️',
    'spring': '🌸',
    'summer': '☀️',
    'autumn': '🍂'
  };

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
        🏔️ Alpine Resort
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
          className="text-xs mb-2 flex items-center gap-1"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          <span>📍</span>
          {resort.region}
        </p>

        <p
          className="text-xs mb-3 flex items-center gap-1"
          style={{ color: 'var(--sbb-color-granite)' }}
        >
          <span>⛰️</span>
          {resort.elevation}m ü. M.
        </p>

        {/* Seasons */}
        <div className="mb-4">
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: 'var(--sbb-color-charcoal)' }}
          >
            Saisons:
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
                {seasonEmojis[season]} {SEASON_LABELS[season]}
              </span>
            ))}
          </div>
        </div>

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
              🌐 Website
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
            🗺️ Auf Karte
          </a>
        </div>
      </div>
    </div>
  );
}
