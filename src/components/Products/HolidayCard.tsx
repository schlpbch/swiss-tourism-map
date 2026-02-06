import type { HolidayProduct } from '../../api/products';
import { getLocalizedText } from '../../types/common';
import { useLanguageStore } from '../../store/languageStore';
import { t } from '../../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BadgeList from '../BadgeList';
import { cn } from '@/lib/utils';

export default function HolidayCard({ product }: { product: HolidayProduct }) {
  const { language } = useLanguageStore();
  const langKey = language as 'de' | 'en' | 'fr' | 'it';
  const categoryColors: Record<string, string> = {
    'train-journey': '#B08888',
    'themed-experience': '#9B88B2',
    'regional-retreat': '#88A89F',
    'alpine-adventure': '#8897B2',
    'city-break': '#B5966F',
  };

  const bookingUrl = product.booking_link || product.media?.homepageUrl || null;

  const handleClick = () => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    }
  };

  const name = getLocalizedText(product.name, langKey) || product.id;
  const description = product.description ? getLocalizedText(product.description, langKey) : null;
  const regions = Array.isArray(product.region) ? product.region : [product.region].filter(Boolean);

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md transition-all"
    >
      {/* Category Header */}
      <CardHeader
        className="px-4 py-3 text-xs font-medium flex flex-row justify-between items-center text-white"
        style={{ backgroundColor: categoryColors[product.category] || '#8FA89B' }}
      >
        <CardTitle className="text-xs font-medium">{product.category.replace(/-/g, ' ')}</CardTitle>
        {product.difficulty_level && (
          <Badge
            variant={
              product.difficulty_level === 'easy'
                ? 'difficulty-easy'
                : product.difficulty_level === 'moderate'
                  ? 'difficulty-moderate'
                  : 'difficulty-hard'
            }
            className="text-xs"
          >
            {product.difficulty_level}
          </Badge>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-1 text-[var(--foreground)]">{name}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm line-clamp-2 mb-2 text-[var(--muted-foreground)]">{description}</p>
        )}

        {/* Region & Duration */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2 text-[var(--muted-foreground)]">
          {regions.length > 0 && <span>{regions.join(', ')}</span>}
          {product.duration && (
            <span>
              {product.duration.days} {t(language, 'common.days')}
              {product.duration.nights != null &&
                ` / ${product.duration.nights} ${t(language, 'common.nights')}`}
            </span>
          )}
        </div>

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="text-sm space-y-1 mb-2 text-[var(--muted-foreground)]">
            {product.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[var(--primary)] shrink-0">•</span>
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Included */}
        {product.included && product.included.length > 0 && (
          <BadgeList
            items={product.included.map((item) => item.replace(/-/g, ' '))}
            variant="outline"
            className="mb-2"
          />
        )}

        {/* Best For */}
        {product.best_for && product.best_for.length > 0 && (
          <BadgeList
            items={product.best_for.map((a) => a.replace(/-/g, ' '))}
            variant="secondary"
            className="mb-2"
          />
        )}

        {/* Pricing — class variants */}
        {product.price && (
          <div className="mt-auto pt-2 border-t border-[var(--border)] space-y-1">
            {product.price.class_variants && product.price.class_variants.length > 0 ? (
              product.price.class_variants.map((variant) => (
                <div key={variant.class} className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    {variant.accommodation || variant.class.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={cn(
                      'font-bold',
                      variant.price_chf === product.price.base_chf
                        ? 'text-[var(--primary)]'
                        : 'text-[var(--foreground)]'
                    )}
                  >
                    CHF {variant.price_chf}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t(language, 'common.from')}
                </span>
                <span className="font-bold text-lg text-[var(--primary)]">
                  CHF {product.price.base_chf}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Valid until */}
        {product.valid_until && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {t(language, 'products.validity')}{' '}
            {t(language, 'products.validUntil', { date: product.valid_until })}
          </p>
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
