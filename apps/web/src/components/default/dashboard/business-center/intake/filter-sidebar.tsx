'use client';

import { useState } from 'react';

import { IconX, IconChevronDown, IconChevronUp, IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { REQUEST_TYPE_OPTIONS, PRIORITY_OPTIONS } from '@/lib/schemas/request';
import { useIntakeStore, selectFilters, selectHasActiveFilters } from '@/lib/stores/intake-store';
import { cn } from '@/lib/utils';

import type { RequestType, Priority } from '@/lib/schemas/request';

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
        <button className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground text-muted-foreground">
          {title}
          {isOpen ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4 pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

interface FilterCheckboxGroupProps {
  options: readonly { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function FilterCheckboxGroup({ options, selectedValues, onChange }: FilterCheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`filter-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label htmlFor={`filter-${option.value}`} className="text-sm font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

export function FilterSidebar() {
  const filters = useIntakeStore(selectFilters);
  const hasActiveFilters = useIntakeStore(selectHasActiveFilters);
  const { setFilters, clearFilters } = useIntakeStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto py-1 px-2 text-xs"
          >
            <IconX className="mr-1 h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <FilterSection title="Priority">
          <FilterCheckboxGroup
            options={PRIORITY_OPTIONS}
            selectedValues={filters.priority}
            onChange={(values) => setFilters({ priority: values as Priority[] })}
          />
        </FilterSection>

        <FilterSection title="Type">
          <FilterCheckboxGroup
            options={REQUEST_TYPE_OPTIONS}
            selectedValues={filters.type}
            onChange={(values) => setFilters({ type: values as RequestType[] })}
          />
        </FilterSection>

        <FilterSection title="Date Range">
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange.from && 'text-muted-foreground'
                    )}
                    size="sm"
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from ?? undefined}
                    onSelect={(date) =>
                      setFilters({
                        dateRange: { ...filters.dateRange, from: date ?? null },
                      })
                    }
                    // eslint-disable-next-line jsx-a11y/no-autofocus -- Intentional UX for date picker focus
                    autoFocus
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
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange.to && 'text-muted-foreground'
                    )}
                    size="sm"
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to ?? undefined}
                    onSelect={(date) =>
                      setFilters({
                        dateRange: { ...filters.dateRange, to: date ?? null },
                      })
                    }
                    disabled={(date) =>
                      filters.dateRange.from ? date < filters.dateRange.from : false
                    }
                    // eslint-disable-next-line jsx-a11y/no-autofocus -- Intentional UX for date picker focus
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
