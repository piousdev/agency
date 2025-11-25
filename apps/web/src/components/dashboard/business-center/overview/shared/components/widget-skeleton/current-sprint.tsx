'use client';

/**
 * Current Sprint Skeleton Component
 * Sprint progress and burndown chart loading state
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BaseSkeletonProps } from '@/components/dashboard/business-center/overview/shared/type';
import { ARIA_LABELS } from '@/components/dashboard/business-center/overview/shared/constants/skeleton';
import {
  getStaggeredDelay,
  createSkeletonRange,
  generateSkeletonKey,
} from '@/components/dashboard/business-center/overview/shared/utils/skeleton';

const STAT_COUNT = 3 as const;

/**
 * Current Sprint skeleton - Progress bar + burndown chart
 */
export function CurrentSprintSkeleton({ className }: BaseSkeletonProps) {
  const statIndices = createSkeletonRange(STAT_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Sprint header */}
      <header className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </header>

      {/* Progress bar */}
      <section className="mb-4 space-y-2" aria-label="Sprint progress">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-3 gap-3 mb-4" aria-label="Sprint statistics">
        {statIndices.map((index) => (
          <div
            key={generateSkeletonKey('sprint-stat', index)}
            className="p-2 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </section>

      {/* Burndown chart placeholder */}
      <div className="flex-1 min-h-[120px]" aria-label="Burndown chart loading">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>

      <span className="sr-only">{ARIA_LABELS.SPRINT_LOADING}</span>
    </div>
  );
}

CurrentSprintSkeleton.displayName = 'CurrentSprintSkeleton';
