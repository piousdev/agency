'use client';

import { type Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CursorPaginationState } from './types';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  className?: string;
}

/**
 * Standard offset-based pagination controls
 */
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  className,
}: DataTablePaginationProps<TData>) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const rowCount = table.getFilteredRowModel().rows.length;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Selection info */}
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0 ? (
          <>
            {selectedCount} of {rowCount} row{rowCount !== 1 ? 's' : ''} selected
          </>
        ) : (
          <>
            {rowCount} row{rowCount !== 1 ? 's' : ''} total
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {pageCount || 1}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Cursor-based "Load More" pagination
 */
interface DataTableLoadMoreProps {
  pagination: CursorPaginationState;
  onLoadMore: () => void;
  isLoading?: boolean;
  className?: string;
}

export function DataTableLoadMore({
  pagination,
  onLoadMore,
  isLoading = false,
  className,
}: DataTableLoadMoreProps) {
  const { hasNextPage, totalCount } = pagination;

  if (!hasNextPage && !isLoading) {
    return totalCount ? (
      <div className={cn('text-center text-sm text-muted-foreground py-4', className)}>
        Showing all {totalCount} results
      </div>
    ) : null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-2 py-4', className)}>
      {totalCount && (
        <p className="text-sm text-muted-foreground">Loaded results • {totalCount} total</p>
      )}
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading || !hasNextPage}
        className="min-w-[140px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  );
}

/**
 * Infinite scroll trigger component
 * Uses IntersectionObserver to trigger loading when visible
 */
interface DataTableInfiniteScrollProps {
  pagination: CursorPaginationState;
  onLoadMore: () => void;
  isLoading?: boolean;
  className?: string;
}

export function DataTableInfiniteScroll({
  pagination,
  onLoadMore,
  isLoading = false,
  className,
}: DataTableInfiniteScrollProps) {
  const { hasNextPage } = pagination;

  // Use IntersectionObserver to detect when this element is visible
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry?.isIntersecting && hasNextPage && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={(el) => {
        if (!el) return;
        const observer = new IntersectionObserver(handleIntersection, {
          rootMargin: '100px',
        });
        observer.observe(el);
        return () => observer.disconnect();
      }}
      className={cn('flex justify-center py-4', className)}
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading more...</span>
        </div>
      )}
    </div>
  );
}
