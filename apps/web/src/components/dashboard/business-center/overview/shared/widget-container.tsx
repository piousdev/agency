'use client';

import { ReactNode, useId } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconDotsVertical,
  IconRefresh,
  IconSettings,
  IconX,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  onRemove?: () => void;
  onConfigure?: () => void;
  dragHandleProps?: Record<string, unknown>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  editMode?: boolean;
  className?: string;
  /** For real-time widgets, set to 'polite' or 'assertive' for screen reader announcements */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** Description for screen readers about what this widget shows */
  'aria-description'?: string;
}

export function WidgetContainer({
  title,
  icon,
  children,
  footer,
  isLoading,
  isError,
  onRefresh,
  onRemove,
  onConfigure,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
  editMode,
  className,
  'aria-live': ariaLive,
  'aria-description': ariaDescription,
}: WidgetContainerProps) {
  const titleId = useId();

  return (
    <Card
      className={cn('flex flex-col gap-0 py-0', className)}
      role="region"
      aria-labelledby={titleId}
      aria-live={ariaLive}
      aria-description={ariaDescription}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {editMode && dragHandleProps && (
            <button
              {...dragHandleProps}
              className="cursor-grab hover:bg-muted rounded p-1 touch-none flex-shrink-0"
              aria-label="Drag to reorder"
            >
              <IconGripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
            >
              {collapsed ? (
                <IconChevronDown className="h-4 w-4" />
              ) : (
                <IconChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
          {icon && (
            <span className="text-muted-foreground flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          <CardTitle id={titleId} className="text-sm font-medium truncate">
            {title}
          </CardTitle>
        </div>
        <div className="flex items-center flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Widget options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
              )}
              {onConfigure && (
                <DropdownMenuItem onClick={onConfigure}>
                  <IconSettings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
              )}
              {editMode && onRemove && (
                <DropdownMenuItem
                  onClick={onRemove}
                  className="text-destructive focus:text-destructive"
                >
                  <IconX className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className={cn('flex-1 px-3 pb-3 pt-0', collapsed && 'hidden')}>
        {isLoading ? <WidgetSkeleton /> : isError ? <WidgetError onRetry={onRefresh} /> : children}
      </CardContent>

      {footer && !collapsed && <CardFooter className="px-3 pb-3 pt-0">{footer}</CardFooter>}
    </Card>
  );
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading widget content">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function WidgetError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 text-center"
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground mb-2">Unable to load widget data</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <IconRefresh className="mr-2 h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}
