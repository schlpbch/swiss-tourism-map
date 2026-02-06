import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { t } from '../i18n';
import { useLanguageStore } from '../store/languageStore';
import { cn } from '@/lib/utils';

interface FullPageErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export default function FullPageError({ error, onRetry, className }: FullPageErrorProps) {
  const { language } = useLanguageStore();

  return (
    <div className={cn('w-full h-full flex items-center justify-center bg-[var(--background)]', className)}>
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t(language, 'error')}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{error}</p>
          {onRetry && (
            <Button size="sm" onClick={onRetry}>
              {t(language, 'common.reload')}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
