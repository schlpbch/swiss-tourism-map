import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CheckboxFilterGroupProps {
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}

export default function CheckboxFilterGroup({
  options,
  selected,
  onToggle,
}: CheckboxFilterGroupProps) {
  return (
    <div className="space-y-2">
      {options.map(({ value, label }) => {
        const isSelected = selected.has(value);
        return (
          <label
            key={value}
            className={cn(
              'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded transition-colors',
              isSelected ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]'
            )}
          >
            <Checkbox checked={isSelected} onCheckedChange={() => onToggle(value)} />
            <span className="text-sm text-[var(--foreground)]">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
