import { Button } from '@/components/ui/button';
import { t } from '../i18n';
import { useLanguageStore } from '../store/languageStore';
import { cn } from '@/lib/utils';

interface CardActionFooterProps {
  externalUrl?: string | null;
  internalHref: string;
  internalLabel: string;
  className?: string;
}

export default function CardActionFooter({
  externalUrl,
  internalHref,
  internalLabel,
  className,
}: CardActionFooterProps) {
  const { language } = useLanguageStore();

  return (
    <div className={cn('mt-auto pt-3 border-t border-[var(--border)] flex gap-2', className)}>
      {externalUrl && (
        <Button asChild size="sm" className="flex-1">
          <a href={externalUrl} target="_blank" rel="noopener noreferrer">
            {t(language, 'common.website')}
          </a>
        </Button>
      )}
      <Button asChild size="sm" className="flex-1">
        <a href={internalHref}>{internalLabel}</a>
      </Button>
    </div>
  );
}
