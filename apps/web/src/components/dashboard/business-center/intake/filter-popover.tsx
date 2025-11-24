'use client';

import { useState } from 'react';
import { IconFilter, IconChevronDown, IconChevronUp, IconCalendar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useIntakeStore, selectFilters, selectHasActiveFilters } from '@/lib/stores/intake-store';
import {
  REQUEST_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_STAGE_LABELS,
} from '@/lib/schemas/request';
import type { RequestType, Priority, RequestStage } from '@/lib/schemas/request';

const STAGE_OPTIONS: readonly { value: RequestStage; label: string }[] = [
  { value: 'in_treatment', label: REQUEST_STAGE_LABELS.in_treatment },
  { value: 'on_hold', label: REQUEST_STAGE_LABELS.on_hold },
  { value: 'estimation', label: REQUEST_STAGE_LABELS.estimation },
  { value: 'ready', label: REQUEST_STAGE_LABELS.ready },
] as const;

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between py-1.5 text-sm font-medium hover:text-foreground">
          {title}
          {isOpen ? (
            <IconChevronUp className="h-3.5 w-3.5" />
          ) : (
            <IconChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-2 pt-0.5">{children}</CollapsibleContent>
    </Collapsible>
  );
}

interface BadgeSelectProps {
  options: readonly { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function BadgeSelect({ options, selectedValues, onChange }: BadgeSelectProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <Badge
          key={option.value}
          variant={selectedValues.includes(option.value) ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-colors text-xs py-0.5 px-2',
            selectedValues.includes(option.value)
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent'
          )}
          onClick={() => handleToggle(option.value)}
        >
          {option.label}
        </Badge>
      ))}
    </div>
  );
}

export function FilterPopover() {
  const filters = useIntakeStore(selectFilters);
  const hasActiveFilters = useIntakeStore(selectHasActiveFilters);
  const { setFilters, clearFilters } = useIntakeStore();

  const activeFilterCount =
    filters.stage.length +
    filters.priority.length +
    filters.type.length +
    (filters.assignedPmId ? 1 : 0) +
    (filters.clientId ? 1 : 0) +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-8">
          <IconFilter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] rounded-full px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b">
            <h4 className="text-sm font-semibold">Filters</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto py-0.5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Stage Section */}
          <FilterSection title="Stage">
            <BadgeSelect
              options={STAGE_OPTIONS}
              selectedValues={filters.stage}
              onChange={(values) => setFilters({ stage: values as RequestStage[] })}
            />
          </FilterSection>

          {/* Priority Section */}
          <FilterSection title="Priority">
            <BadgeSelect
              options={PRIORITY_OPTIONS}
              selectedValues={filters.priority}
              onChange={(values) => setFilters({ priority: values as Priority[] })}
            />
          </FilterSection>

          {/* Type Section */}
          <FilterSection title="Type">
            <BadgeSelect
              options={REQUEST_TYPE_OPTIONS}
              selectedValues={filters.type}
              onChange={(values) => setFilters({ type: values as RequestType[] })}
            />
          </FilterSection>

          {/* Date Range Section */}
          <FilterSection title="Date Range" defaultOpen={false}>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9',
                        !filters.dateRange.from && 'text-muted-foreground'
                      )}
                      size="sm"
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {filters.dateRange.from
                        ? format(filters.dateRange.from, 'MMM d, yyyy')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) =>
                        setFilters({
                          dateRange: { ...filters.dateRange, from: date || null },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9',
                        !filters.dateRange.to && 'text-muted-foreground'
                      )}
                      size="sm"
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {filters.dateRange.to
                        ? format(filters.dateRange.to, 'MMM d, yyyy')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) =>
                        setFilters({
                          dateRange: { ...filters.dateRange, to: date || null },
                        })
                      }
                      disabled={(date) =>
                        filters.dateRange.from ? date < filters.dateRange.from : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </FilterSection>
        </div>
      </PopoverContent>
    </Popover>
  );
}
