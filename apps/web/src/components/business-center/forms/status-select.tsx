'use client';

import { forwardRef } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  projectStatusOptions,
  ticketStatusOptions,
  type ProjectStatus,
  type TicketStatus,
} from '@/lib/schemas';
import { cn } from '@/lib/utils';

type StatusType = 'project' | 'ticket';

interface StatusSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  type?: StatusType;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const projectStatusColors: Record<string, string> = {
  proposal: 'bg-purple-100 text-purple-700',
  in_development: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-slate-100 text-slate-700',
  maintenance: 'bg-cyan-100 text-cyan-700',
  archived: 'bg-slate-200 text-slate-500',
};

const ticketStatusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  pending_client: 'bg-purple-100 text-purple-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-500',
};

export const StatusSelect = forwardRef<HTMLButtonElement, StatusSelectProps>(
  (
    {
      value,
      onValueChange,
      type = 'project',
      placeholder = 'Select status',
      disabled = false,
      className,
    },
    ref
  ) => {
    const options = type === 'ticket' ? ticketStatusOptions : projectStatusOptions;
    const colors = type === 'ticket' ? ticketStatusColors : projectStatusColors;

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
                    colors[option.value]?.split(' ')[0] ?? 'bg-slate-200'
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

StatusSelect.displayName = 'StatusSelect';

export type { ProjectStatus, TicketStatus };
