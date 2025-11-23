'use client';

import { forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  projectPriorityOptions,
  ticketPriorityOptions,
  type ProjectPriority,
  type TicketPriority,
} from '@/lib/schemas';

type PriorityType = 'project' | 'ticket';

interface PrioritySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  type?: PriorityType;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
  critical: 'bg-red-100 text-red-700',
};

export const PrioritySelect = forwardRef<HTMLButtonElement, PrioritySelectProps>(
  (
    {
      value,
      onValueChange,
      type = 'project',
      placeholder = 'Select priority',
      disabled = false,
      className,
    },
    ref
  ) => {
    const options = type === 'ticket' ? ticketPriorityOptions : projectPriorityOptions;

    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-2 w-2 rounded-full',
                    priorityColors[option.value]?.split(' ')[0] ?? 'bg-slate-200'
                  )}
                />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

PrioritySelect.displayName = 'PrioritySelect';

export type { ProjectPriority, TicketPriority };
