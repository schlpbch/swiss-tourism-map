import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BadgeListProps {
  items: string[];
  variant?: 'default' | 'secondary' | 'outline' | 'resort';
  maxVisible?: number;
  showOverflow?: boolean;
  className?: string;
}

export default function BadgeList({
  items,
  variant = 'outline',
  maxVisible,
  showOverflow = true,
  className,
}: BadgeListProps) {
  if (items.length === 0) return null;

  const visible = maxVisible ? items.slice(0, maxVisible) : items;
  const overflow = maxVisible ? items.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {visible.map((item, i) => (
        <Badge key={i} variant={variant}>{item}</Badge>
      ))}
      {showOverflow && overflow > 0 && (
        <Badge variant={variant}>+{overflow}</Badge>
      )}
    </div>
  );
}
