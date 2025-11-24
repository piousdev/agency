'use client';

import { type Table } from '@tanstack/react-table';
import {
  IconX,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconColumns3,
  IconRotate2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  enableGlobalFilter?: boolean;
  enableColumnVisibility?: boolean;
  enableReset?: boolean;
  onReset?: () => void;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  enableGlobalFilter = true,
  enableColumnVisibility = true,
  enableReset = true,
  onReset,
  children,
  rightContent,
  className,
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState(globalFilter);
  const isFiltered = globalFilter.length > 0 || table.getState().columnFilters.length > 0;

  // Debounce global filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, setGlobalFilter]);

  // Sync external changes
  useEffect(() => {
    setSearchValue(globalFilter);
  }, [globalFilter]);

  const handleReset = useCallback(() => {
    setSearchValue('');
    setGlobalFilter('');
    table.resetColumnFilters();
    onReset?.();
  }, [setGlobalFilter, table, onReset]);

  const activeFiltersCount = table.getState().columnFilters.length;

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {/* Left side: Search and filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Global Search */}
        {enableGlobalFilter && (
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 w-[200px] lg:w-[280px] pl-8"
              aria-label="Search all columns"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => {
                  setSearchValue('');
                  setGlobalFilter('');
                }}
                aria-label="Clear search"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Custom toolbar content (filters, etc.) */}
        {children}

        {/* Active filters indicator */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="h-7 gap-1">
            <IconAdjustmentsHorizontal className="h-3 w-3" />
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
        )}

        {/* Reset button */}
        {enableReset && isFiltered && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 lg:px-3">
            <IconRotate2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Right side: Column visibility and custom right content */}
      <div className="flex items-center gap-2">
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <IconColumns3 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                .map((column) => {
                  const meta = column.columnDef.meta;
                  const displayName = meta?.displayName || column.id;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {displayName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {rightContent}
      </div>
    </div>
  );
}

/**
 * Bulk actions bar - shown when rows are selected
 */
interface DataTableBulkActionsProps<TData> {
  table: Table<TData>;
  children: React.ReactNode;
  className?: string;
}

export function DataTableBulkActions<TData>({
  table,
  children,
  className,
}: DataTableBulkActionsProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border bg-muted/50 px-4 py-2',
        className
      )}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{selectedCount}</span> of {totalCount} row
        {totalCount > 1 ? 's' : ''} selected
      </div>
      <div className="flex items-center gap-2">
        {children}
        <Button variant="ghost" size="sm" onClick={() => table.toggleAllRowsSelected(false)}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}
