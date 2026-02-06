import type { Sight } from '../../types/sight';
import { PROMINENCE_TIERS } from '../../types/sight';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import { Card, CardContent } from '@/components/ui/card';
import CardActionFooter from '../CardActionFooter';
import BadgeList from '../BadgeList';

export default function SightCard({ sight }: { sight: Sight }) {
  const { language } = useLanguageStore();
  const tierInfo = sight.prominence ? PROMINENCE_TIERS[sight.prominence.tier] : null;

  return (
    <Card className="overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-md">
      {/* Header with prominence */}
      {tierInfo && (
        <div
          className="px-4 py-2 text-xs font-medium flex justify-between items-center text-white"
          style={{ backgroundColor: tierInfo.color }}
        >
          <span>{tierInfo.label}</span>
          <span>{sight.prominence?.score}/100</span>
        </div>
      )}

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 text-[var(--primary)]">{sight.title}</h3>

        {sight.region && (
          <p className="text-xs mb-2 text-[var(--muted-foreground)]">{sight.region}</p>
        )}

        <p className="text-sm mb-3 line-clamp-3 flex-1 text-[var(--muted-foreground)]">
          {sight.description}
        </p>

        {/* Categories */}
        {sight.category.length > 0 && (
          <BadgeList items={sight.category} variant="outline" maxVisible={3} className="mb-3" />
        )}

        {/* Tags */}
        {sight.tags && sight.tags.length > 0 && (
          <BadgeList items={sight.tags} variant="secondary" maxVisible={3} className="mb-3" />
        )}

        {/* Action Links */}
        <CardActionFooter
          externalUrl={sight.website || sight.url}
          internalHref="/"
          internalLabel={t(language, 'common.onMap')}
        />
      </CardContent>
    </Card>
  );
}
