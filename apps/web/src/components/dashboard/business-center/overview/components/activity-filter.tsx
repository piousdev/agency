import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconFilter } from '@tabler/icons-react';
import { FILTER_OPTIONS } from '@/components/dashboard/business-center/overview/constants/activity-config';
import type { FilterCategory } from '@/components/dashboard/business-center/overview/types';

interface ActivityFilterProps {
  readonly value: FilterCategory;
  readonly onChange: (value: FilterCategory) => void;
  readonly filteredCount: number;
  readonly showCount: boolean;
}

export const ActivityFilter = ({
  value,
  onChange,
  filteredCount,
  showCount,
}: ActivityFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 w-[150px] text-sm rounded-full corner-squircle">
          <IconFilter className="h-3 w-3 mr-1" aria-hidden="true" />
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {FILTER_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-xl cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showCount && (
        <span className="ml-1 text-xs bg-accent text-accent-foreground rounded-full px-3 py-2 border border-dashed border-border">
          {filteredCount} item{filteredCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};
