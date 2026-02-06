import type { Resort } from '../../types/resort';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CardActionFooter from '../CardActionFooter';
import BadgeList from '../BadgeList';

export default function ResortCard({ resort }: { resort: Resort }) {
  const { language } = useLanguageStore();
  return (
    <Card className="overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-md">
      {/* Header */}
      <CardHeader className="px-4 py-2 bg-[var(--sbb-color-orange-light)] text-white">
        <CardTitle className="text-xs font-medium">{t(language, 'resorts.alpineResort')}</CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 text-[var(--primary)]">{resort.name}</h3>

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
          <BadgeList items={resort.activities} variant="outline" maxVisible={4} className="mb-3" />
        )}

        {/* Seasons */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-1 text-[var(--foreground)]">
            {t(language, 'map.seasons')}:
          </p>
          <BadgeList
            items={resort.seasons.map((season) => t(language, `seasons.${season}`))}
            variant="resort"
          />
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
                {t(language, 'resorts.hikingTrails', {
                  trails: resort.seasonDetails.summer.hikingTrails,
                })}
              </p>
            )}
            {resort.seasonDetails.winter?.months && (
              <p className="text-xs mb-2 text-[var(--muted-foreground)]">
                {t(language, 'resorts.winterMonths', {
                  months: resort.seasonDetails.winter.months.join(', '),
                })}
              </p>
            )}
            {resort.seasonDetails.summer?.months && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {t(language, 'resorts.summerMonths', {
                  months: resort.seasonDetails.summer.months.join(', '),
                })}
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
                    {resort.difficulty === 'easy'
                      ? t(language, 'difficulty.easy')
                      : resort.difficulty === 'intermediate'
                        ? t(language, 'difficulty.moderate')
                        : t(language, 'difficulty.challenging')}
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
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {resort.runs.beginner}
                  </span>
                </div>
              )}
              {resort.runs.intermediate > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="difficulty-moderate" className="text-xs">
                    {t(language, 'resorts.intermediate')}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {resort.runs.intermediate}
                  </span>
                </div>
              )}
              {resort.runs.advanced > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="difficulty-hard" className="text-xs">
                    {t(language, 'resorts.advanced')}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">
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
            <p className="text-xs font-semibold mb-2 text-[var(--foreground)]">
              {t(language, 'resorts.bestFor')}
            </p>
            <BadgeList items={resort.bestFor} variant="secondary" />
          </div>
        )}

        {/* Amenities */}
        {resort.amenities && resort.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2 text-[var(--foreground)]">
              {t(language, 'resorts.amenities')}
            </p>
            <BadgeList items={resort.amenities} variant="outline" maxVisible={5} />
          </div>
        )}

        {/* Family Friendly Badge */}
        {resort.familyFriendly && (
          <div className="mb-4">
            <Badge variant="secondary">{t(language, 'common.familyFriendly')}</Badge>
          </div>
        )}

        {/* Action Links */}
        <CardActionFooter
          externalUrl={resort.website || resort.url}
          internalHref="/"
          internalLabel={t(language, 'common.onMap')}
        />
      </CardContent>
    </Card>
  );
}
