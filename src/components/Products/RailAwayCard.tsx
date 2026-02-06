import type { RailAwayProduct } from '../../types/railaway';
import { getLocalizedText } from '../../types/common';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BadgeList from '../BadgeList';

export default function RailAwayCard({ product }: { product: RailAwayProduct }) {
  const { language } = useLanguageStore();
  const langKey = language as 'de' | 'en' | 'fr' | 'it';
  const categoryColors: Record<string, string> = {
    "Snow'n'Rail": '#94A3B8',
    "Hike'n'Rail": '#86AFBF',
    "Culture'n'Rail": '#A99BC4',
    "Animal'n'Rail": '#B8A080',
    "Nature'n'Rail": '#7BA89D',
    "Wellness'n'Rail": '#B89BAD',
  };

  const bgColor = categoryColors[product.category || ''] || 'var(--muted-foreground)';

  // Derive booking URL from bookingInfo or media (API has no top-level bookingUrl)
  const bookingUrl =
    product.bookingUrl ||
    (product.bookingInfo?.howtoBuyUrl
      ? getLocalizedText(product.bookingInfo.howtoBuyUrl, langKey)
      : null) ||
    (product.media?.homepageUrl ? getLocalizedText(product.media.homepageUrl, langKey) : null) ||
    null;

  const handleClick = () => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    }
  };

  const title = getLocalizedText(product.title, langKey) || 'Unbenannt';
  const description = getLocalizedText(product.description, langKey);
  const discountDesc = product.discount?.description
    ? getLocalizedText(product.discount.description, langKey)
    : null;

  // Parse discount value — API returns strings like "10%" or "20%"
  const discountDisplay = product.discount?.value
    ? String(product.discount.value).replace(/%$/, '')
    : null;

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <CardHeader
        className="px-4 py-3 text-xs font-medium text-white flex flex-row items-center justify-between"
        style={{ backgroundColor: bgColor }}
      >
        <CardTitle className="text-xs font-medium">{product.category || 'RailAway'}</CardTitle>
        {discountDisplay && (
          <Badge variant="secondary" className="text-xs">
            {t(language, 'products.discountOff', { value: discountDisplay })}
          </Badge>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-2 line-clamp-2 text-[var(--foreground)]">{title}</h3>
        <p className="text-sm line-clamp-3 text-[var(--muted-foreground)]">{description}</p>

        {/* Discount description */}
        {discountDesc && (
          <p className="mt-2 text-xs text-[var(--primary)] font-medium">{discountDesc}</p>
        )}

        {/* Location */}
        {product.location && (product.location.city || product.location.region) && (
          <div className="mt-2 text-xs text-[var(--muted-foreground)]">
            {[product.location.city, product.location.region].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Visit Info */}
        {product.visitInfo && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
            {product.visitInfo.recommendedDuration && (
              <span>
                {t(language, 'products.recommendedDuration')}:{' '}
                {product.visitInfo.recommendedDuration}
              </span>
            )}
            {product.visitInfo.accessibility && (
              <span>
                {typeof product.visitInfo.accessibility === 'boolean'
                  ? t(language, 'products.accessibility')
                  : product.visitInfo.accessibility}
              </span>
            )}
          </div>
        )}

        {/* Best Months */}
        {product.visitInfo?.bestMonths && product.visitInfo.bestMonths.length > 0 && (
          <BadgeList items={product.visitInfo.bestMonths} variant="outline" className="mt-2" />
        )}

        {/* Target Audience */}
        {product.targetAudience && product.targetAudience.length > 0 && (
          <BadgeList items={product.targetAudience} variant="secondary" className="mt-2" />
        )}

        {/* Price */}
        {product.price && (
          <div className="mt-auto pt-3 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm text-[var(--muted-foreground)]">
              {t(language, 'common.from')}
            </span>
            <span className="font-bold text-lg text-[var(--primary)]">
              CHF {product.price.from}
            </span>
          </div>
        )}

        {/* Book button */}
        {bookingUrl && (
          <Button size="sm" className="mt-3 w-full">
            {t(language, 'products.bookNow')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
