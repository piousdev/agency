'use client';

import { cn } from '@/lib/utils';

export type TimePeriod = '1D' | '1W' | '1M' | '6M' | '1Y';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
  options?: TimePeriod[];
}

const defaultOptions: TimePeriod[] = ['1D', '1W', '1M', '6M', '1Y'];

export function TimePeriodSelector({
  value,
  onChange,
  options = defaultOptions,
}: TimePeriodSelectorProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border/50 bg-background/50 p-0.5"
      role="tablist"
      aria-label="Time period selection"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
            value === option
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
