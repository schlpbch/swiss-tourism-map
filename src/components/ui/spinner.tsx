import * as React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      default: 'h-8 w-8 border-3',
      lg: 'h-12 w-12 border-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-[var(--primary)] border-t-transparent',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };
