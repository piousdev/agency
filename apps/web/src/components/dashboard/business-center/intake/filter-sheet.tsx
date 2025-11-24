'use client';

import { IconFilter } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { useIntakeStore, selectHasActiveFilters } from '@/lib/stores/intake-store';
import { FilterSidebar } from '@/components/dashboard/business-center/intake/filter-sidebar';

export function FilterSheet() {
  const hasActiveFilters = useIntakeStore(selectHasActiveFilters);
  const { clearFilters, filters } = useIntakeStore();

  const activeFilterCount =
    filters.priority.length +
    filters.type.length +
    (filters.assignedPmId ? 1 : 0) +
    (filters.clientId ? 1 : 0) +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <IconFilter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] rounded-full px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>Filter Requests</SheetTitle>
          <SheetDescription>Narrow down the list by applying filters</SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <FilterSidebar />
        </div>
        <SheetFooter className="flex-row gap-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Clear All
            </Button>
          )}
          <SheetClose asChild>
            <Button className="flex-1">Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
