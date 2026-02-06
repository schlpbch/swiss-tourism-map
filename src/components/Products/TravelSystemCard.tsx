import type { TravelSystemProduct } from '../../api/products';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BadgeList from '../BadgeList';
import { cn } from '@/lib/utils';

// Feature label mapping for display
const featureLabels: Record<string, string> = {
  unlimited_train: 'Trains',
  unlimited_bus: 'Buses',
  unlimited_boat: 'Boats',
  free_museums: '500+ Museums',
  mountain_discounts: 'Mountain 50%',
  panoramic_trains: 'Panoramic',
  '50_percent_discount': '50% off',
  unlimited_usage: 'Unlimited',
  flexible_booking: 'Flexible',
};

export default function TravelSystemCard({ product }: { product: TravelSystemProduct }) {
  const { language } = useLanguageStore();
  const categoryLabels: Record<string, string> = {
    'travel-pass': t(language, 'products.travelPass'),
    'travel-pass-flex': t(language, 'products.flexPass'),
    'discount-card': t(language, 'products.discountCard'),
    'regional-pass': t(language, 'products.regionalPass'),
    'family-card': t(language, 'products.familyCard'),
  };

  const handleClick = () => {
    const url = product.bookingUrl || product.media?.homepageUrl;
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Resolve the best price to show
  const adultPrice = product.pricing?.adult_2nd ?? product.pricing?.adult_chf;
  const firstClassPrice = product.pricing?.adult_1st;
  const youthPrice = product.pricing?.youth_chf;

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <CardHeader className="px-4 py-3 bg-rose-300 text-white flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-medium">
          {categoryLabels[product.category] || product.category}
        </CardTitle>
        {product.coverage && (
          <Badge variant="secondary" className="text-xs">
            {product.coverage}
          </Badge>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-1 text-[var(--foreground)]">
          {product.title || product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm line-clamp-2 mb-2 text-[var(--muted-foreground)]">
            {product.description}
          </p>
        )}

        {/* Duration */}
        {product.duration && (
          <p className="text-xs mb-2 text-[var(--muted-foreground)]">
            {product.duration.days} {t(language, 'common.days')}
            {product.duration.type === 'flex' && ` (${t(language, 'products.flexible')})`}
            {product.duration.consecutive &&
              product.duration.type !== 'flex' &&
              ` (${t(language, 'products.consecutive')})`}
            {product.duration.validity_period &&
              !product.duration.consecutive &&
              product.duration.validity_period !== 'consecutive' &&
              ` — ${product.duration.validity_period}`}
          </p>
        )}

        {/* Benefits */}
        {product.benefits && Object.keys(product.benefits).length > 0 && (
          <div className="mb-2 space-y-1">
            {Object.entries(product.benefits)
              .slice(0, 3)
              .map(([key, value]) => (
                <p
                  key={key}
                  className="text-xs text-[var(--muted-foreground)] flex items-start gap-1.5"
                >
                  <span className="text-[var(--primary)] shrink-0">•</span>
                  <span className="line-clamp-1">{value}</span>
                </p>
              ))}
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <BadgeList
            items={product.features.map((f) => featureLabels[f] || f.replace(/_/g, ' '))}
            variant="secondary"
            className="mb-2"
          />
        )}

        {/* Restrictions */}
        {product.restrictions && product.restrictions.length > 0 && (
          <div className="mb-2 text-xs text-[var(--muted-foreground)]">
            {product.restrictions.slice(0, 2).map((r, i) => (
              <p key={i} className="flex items-start gap-1.5">
                <span className="text-[var(--destructive)] shrink-0">!</span>
                <span>{r}</span>
              </p>
            ))}
          </div>
        )}

        {/* Pricing */}
        {product.pricing && (
          <div className="mt-auto pt-2 border-t border-[var(--border)] space-y-1">
            {adultPrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  {t(language, 'products.secondClass')}
                </span>
                <span className="font-bold text-[var(--primary)]">CHF {adultPrice}</span>
              </div>
            )}
            {firstClassPrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  {t(language, 'products.firstClass')}
                </span>
                <span className="font-bold text-[var(--foreground)]">CHF {firstClassPrice}</span>
              </div>
            )}
            {youthPrice != null && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">
                  {t(language, 'products.youthPrice')}
                </span>
                <span className="text-[var(--foreground)]">CHF {youthPrice}</span>
              </div>
            )}
            {product.pricing.child_chf === 0 && (
              <p className="text-xs text-[var(--primary)]">{t(language, 'products.childFree')}</p>
            )}
          </div>
        )}

        {/* Validity */}
        {product.valid_until && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {t(language, 'products.validity')}{' '}
            {t(language, 'products.validUntil', { date: product.valid_until })}
          </p>
        )}

        {/* Book button */}
        {(product.bookingUrl || product.media?.homepageUrl) && (
          <Button size="sm" className="mt-3 w-full">
            {t(language, 'products.bookNow')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
