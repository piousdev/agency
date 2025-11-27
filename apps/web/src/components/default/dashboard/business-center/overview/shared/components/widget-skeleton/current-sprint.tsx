'use client';

/**
 * Current Sprint Skeleton Component
 * Matches SprintHeader + SprintProgress + TaskStatsGrid + BurndownSection + SprintActions structure
 */

import { ARIA_LABELS } from '@/components/default/dashboard/business-center/overview/shared/constants/skeleton';
import {
  getStaggeredDelay,
  createSkeletonRange,
  generateSkeletonKey,
} from '@/components/default/dashboard/business-center/overview/shared/utils/skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { BaseSkeletonProps } from '@/components/default/dashboard/business-center/overview/shared/type';

const STAT_COUNT = 4 as const;

/**
 * SprintHeader skeleton - Icon, name, project, days badge
 */
function SprintHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-20 mt-0.5" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

/**
 * SprintProgress skeleton - Progress label, percentage, progress bar
 */
function SprintProgressSkeleton() {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

/**
 * TaskStatsGrid skeleton - 4 stat cards (todo, in_progress, completed, blocked)
 */
function TaskStatsGridSkeleton() {
  const statIndices = createSkeletonRange(STAT_COUNT);

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {statIndices.map((index) => (
        <div
          key={generateSkeletonKey('sprint-stat', index)}
          className="text-center p-2 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
          style={getStaggeredDelay(index, 50)}
        >
          {/* Icon */}
          <div className="flex items-center justify-center gap-1">
            <Skeleton className="h-3.5 w-3.5 rounded" />
          </div>
          {/* Count */}
          <Skeleton className="h-5 w-6 mx-auto mt-1" />
          {/* Label */}
          <Skeleton className="h-3 w-12 mx-auto mt-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * BurndownSection skeleton - Chart placeholder
 */
function BurndownSectionSkeleton() {
  return (
    <div className="flex-1 min-h-[100px] mb-4">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

/**
 * SprintActions skeleton
 */
function SprintActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Current Sprint skeleton - Matches actual widget structure
 */
export function CurrentSprintSkeleton({ className }: BaseSkeletonProps) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <SprintHeaderSkeleton />
      <SprintProgressSkeleton />
      <TaskStatsGridSkeleton />
      <BurndownSectionSkeleton />
      <SprintActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.SPRINT_LOADING}</span>
    </div>
  );
}

CurrentSprintSkeleton.displayName = 'CurrentSprintSkeleton';
