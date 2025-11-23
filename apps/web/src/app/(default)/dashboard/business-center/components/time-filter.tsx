'use client';

import { IconChevronDown } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type TimeFilterOption =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all_time';

interface TimeFilterProps {
  value: TimeFilterOption;
  onChange: (value: TimeFilterOption) => void;
  options?: TimeFilterOption[];
}

// Short labels for compact display
const shortLabels: Record<TimeFilterOption, string> = {
  today: 'Today',
  this_week: '7D',
  this_month: '30D',
  last_month: 'Last Mo',
  this_year: 'YTD',
  all_time: 'All',
};

// Full labels for dropdown menu
const fullLabels: Record<TimeFilterOption, string> = {
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_year: 'This Year',
  all_time: 'All Time',
};

const defaultOptions: TimeFilterOption[] = ['this_week', 'this_month', 'last_month', 'this_year'];

export function TimeFilter({ value, onChange, options = defaultOptions }: TimeFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 gap-1 text-xs font-medium bg-background/50 border-border/50 hover:bg-background hover:border-border shrink-0"
        >
          <span>{shortLabels[value]}</span>
          <IconChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={value === option ? 'bg-accent' : ''}
          >
            {fullLabels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
