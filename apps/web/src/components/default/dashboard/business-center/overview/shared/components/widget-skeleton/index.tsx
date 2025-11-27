'use client';

/**
 * Base Widget Skeleton Component
 * Optimized for React 19 with automatic memoization via React Compiler
 * @see https://react.dev/blog/2024/12/05/react-19
 */

import {
  SKELETON_DEFAULTS,
  ARIA_LABELS,
} from '@/components/default/dashboard/business-center/overview/shared/constants/skeleton';
import {
  getStaggeredDelay,
  createSkeletonRange,
  generateSkeletonKey,
} from '@/components/default/dashboard/business-center/overview/shared/utils/skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { WidgetSkeletonProps } from '@/components/default/dashboard/business-center/overview/shared/type';

export { WidgetGridSkeleton } from './widget-grid';

/**
 * Base skeleton loading state for dashboard widgets
 * Features shimmer animation and configurable layout
 *
 * Note: React 19 Compiler handles memoization automatically - no need for useMemo/useCallback
 */
export function WidgetSkeleton({
  className,
  showHeader = SKELETON_DEFAULTS.SHOW_HEADER,
  showFooter = SKELETON_DEFAULTS.SHOW_FOOTER,
  rows = SKELETON_DEFAULTS.ROWS,
}: WidgetSkeletonProps) {
  const rowIndices = createSkeletonRange(rows);

  return (
    <div
      className={cn('flex flex-col h-full', className)}
      role="status"
      aria-label={ARIA_LABELS.WIDGET_LOADING}
    >
      {/* Header Skeleton */}
      {showHeader && (
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </header>
      )}

      {/* Content Skeleton */}
      <div className="flex-1 space-y-3">
        {rowIndices.map((index) => (
          <div
            key={generateSkeletonKey('widget-row', index)}
            className="flex items-center gap-3"
            style={getStaggeredDelay(index, 100)}
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      {showFooter && (
        <footer className="pt-3 mt-auto border-t">
          <Skeleton className="h-8 w-full rounded" />
        </footer>
      )}

      <span className="sr-only">{ARIA_LABELS.GENERIC_LOADING}</span>
    </div>
  );
}

WidgetSkeleton.displayName = 'WidgetSkeleton';
