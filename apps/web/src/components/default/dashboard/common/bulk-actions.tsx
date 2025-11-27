'use client';

import * as React from 'react';

import { IconDotsVertical, IconX } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  action: (selectedIds: string[]) => void;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount?: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  actions: BulkAction[];
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
  className,
}: BulkActionsBarProps) {
  const [selectedIds] = React.useState<string[]>([]); // This would come from parent component

  if (selectedCount === 0) return null;

  const primaryActions = actions.filter((a) => a.variant !== 'destructive').slice(0, 2);
  const destructiveActions = actions.filter((a) => a.variant === 'destructive');
  const moreActions = actions.filter((a) => a.variant !== 'destructive').slice(2);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2',
        className
      )}
    >
      {/* Selection info */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-medium">
          {selectedCount} selected
        </Badge>
        {totalCount && totalCount > selectedCount && onSelectAll && (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onSelectAll}>
            Select all {totalCount}
          </Button>
        )}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Primary actions */}
      <div className="flex items-center gap-1">
        {primaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => action.action(selectedIds)}
            >
              {Icon && <Icon className="mr-2 size-4" />}
              {action.label}
            </Button>
          );
        })}

        {/* More actions dropdown */}
        {moreActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {moreActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={action.id} onClick={() => action.action(selectedIds)}>
                    {Icon && <Icon className="mr-2 size-4" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Destructive actions */}
        {destructiveActions.length > 0 && (
          <>
            <div className="h-6 w-px bg-border" />
            {destructiveActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="destructive"
                  size="sm"
                  onClick={() => action.action(selectedIds)}
                >
                  {Icon && <Icon className="mr-2 size-4" />}
                  {action.label}
                </Button>
              );
            })}
          </>
        )}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Clear selection */}
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <IconX className="size-4" />
      </Button>
    </div>
  );
}

// Hook for managing bulk selection
export function useBulkSelection(items: { id: string }[]) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const isSelected = React.useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleSelection = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectRange = React.useCallback(
    (startId: string, endId: string) => {
      const startIndex = items.findIndex((item) => item.id === startId);
      const endIndex = items.findIndex((item) => item.id === endId);

      if (startIndex === -1 || endIndex === -1) return;

      const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
      const rangeIds = items.slice(start, end + 1).map((item) => item.id);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        rangeIds.forEach((id) => next.add(id));
        return next;
      });
    },
    [items]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectRange,
  };
}
