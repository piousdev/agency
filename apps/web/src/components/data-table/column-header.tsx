'use client';

import { type Column } from '@tanstack/react-table';
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsUpDown,
  IconEyeOff,
  IconGripVertical,
  IconPin,
  IconPinnedOff,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enablePinning?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement> | null;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableSorting = true,
  enableHiding = true,
  enablePinning = true,
  dragHandleProps,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isSorted = column.getIsSorted();
  const canSort = column.getCanSort() && enableSorting;
  const canHide = column.getCanHide() && enableHiding;
  const canPin = column.getCanPin() && enablePinning;
  const isPinned = column.getIsPinned();

  // Handle keyboard sorting
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSort) {
      e.preventDefault();
      column.toggleSorting(isSorted === 'asc');
    }
  };

  if (!canSort && !canHide && !canPin) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab text-muted-foreground hover:text-foreground"
            aria-label="Drag to reorder column"
          >
            <IconGripVertical className="h-4 w-4" />
          </div>
        )}
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing p-1 -ml-1 rounded hover:bg-accent"
          aria-label="Drag to reorder column"
          onMouseDown={(e) => {
            // Prevent dropdown from opening when starting drag
            e.stopPropagation();
          }}
          onClick={(e) => {
            // Prevent any click events from bubbling
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <IconGripVertical className="h-4 w-4" />
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onKeyDown={handleKeyDown}
            aria-label={`${title}${isSorted ? `, sorted ${isSorted === 'asc' ? 'ascending' : 'descending'}` : ''}`}
          >
            <span>{title}</span>
            {canSort && (
              <span className="ml-2">
                {isSorted === 'desc' ? (
                  <IconArrowDown className="h-4 w-4" aria-hidden="true" />
                ) : isSorted === 'asc' ? (
                  <IconArrowUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <IconArrowsUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
                )}
              </span>
            )}
            {isPinned && <IconPin className="ml-1 h-3 w-3 text-primary" aria-hidden="true" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {canSort && (
            <>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(false)}
                aria-label="Sort ascending"
              >
                <IconArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(true)}
                aria-label="Sort descending"
              >
                <IconArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Desc
              </DropdownMenuItem>
              {isSorted && (
                <DropdownMenuItem onClick={() => column.clearSorting()} aria-label="Clear sorting">
                  <IconArrowsUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Clear
                </DropdownMenuItem>
              )}
              {(canHide || canPin) && <DropdownMenuSeparator />}
            </>
          )}
          {canPin && (
            <>
              {isPinned !== 'left' && (
                <DropdownMenuItem
                  onClick={() => column.pin('left')}
                  aria-label="Pin column to left"
                >
                  <IconPin className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Pin Left
                </DropdownMenuItem>
              )}
              {isPinned !== 'right' && (
                <DropdownMenuItem
                  onClick={() => column.pin('right')}
                  aria-label="Pin column to right"
                >
                  <IconPin className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 rotate-90" />
                  Pin Right
                </DropdownMenuItem>
              )}
              {isPinned && (
                <DropdownMenuItem onClick={() => column.pin(false)} aria-label="Unpin column">
                  <IconPinnedOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Unpin
                </DropdownMenuItem>
              )}
              {canHide && <DropdownMenuSeparator />}
            </>
          )}
          {canHide && (
            <DropdownMenuItem
              onClick={() => column.toggleVisibility(false)}
              aria-label={`Hide ${title} column`}
            >
              <IconEyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Get common pinning styles for a column
 */
export function getColumnPinningStyles<TData>(column: Column<TData, unknown>): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isLastLeftPinned
      ? 'inset -4px 0 4px -4px rgba(0, 0, 0, 0.1)'
      : isFirstRightPinned
        ? 'inset 4px 0 4px -4px rgba(0, 0, 0, 0.1)'
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    backgroundColor: isPinned ? 'var(--background)' : undefined,
  };
}
