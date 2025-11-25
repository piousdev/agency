import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconSortAscending, IconFilter } from '@tabler/icons-react';
import {
  SORT_OPTIONS_CONFIG,
  FILTER_OPTIONS_CONFIG,
} from '@/components/dashboard/business-center/overview/constants/task-config';
import type {
  SortOption,
  FilterOption,
} from '@/components/dashboard/business-center/overview/types';

interface TaskControlsProps {
  readonly sortBy: SortOption;
  readonly filterBy: FilterOption;
  readonly onSortChange: (value: string) => void;
  readonly onFilterChange: (value: string) => void;
}

export const TaskControls = memo(function TaskControls({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
}: TaskControlsProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-7 w-[110px] text-xs">
          <IconSortAscending className="h-3 w-3 mr-1" aria-hidden="true" />
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS_CONFIG.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterBy} onValueChange={onFilterChange}>
        <SelectTrigger className="h-7 w-[120px] text-xs">
          <IconFilter className="h-3 w-3 mr-1" aria-hidden="true" />
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS_CONFIG.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
