'use client';

/**
 * My Work Today Skeleton Component
 * Matches TaskControls + TaskItem structure
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

const TASK_COUNT = 4 as const;

/**
 * TaskControls skeleton - Two select dropdowns
 */
function TaskControlsSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-3">
      {/* Sort select - h-7 w-[110px] */}
      <Skeleton className="h-7 w-[110px] rounded-md" />
      {/* Filter select - h-7 w-[120px] */}
      <Skeleton className="h-7 w-[120px] rounded-md" />
    </div>
  );
}

/**
 * TaskItem skeleton - Checkbox, priority dot, title, meta, status badge
 */
function TaskItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border bg-card animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index)}
    >
      {/* Checkbox */}
      <Skeleton className="h-4 w-4 rounded mt-1" />

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Title row with priority dot */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Meta row - ticket, project, points */}
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Actions area */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Due time */}
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

/**
 * TaskActionsFooter skeleton
 */
function TaskActionsFooterSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * My Work Today skeleton - Matches actual widget structure
 */
export function MyWorkTodaySkeleton({ className }: BaseSkeletonProps) {
  const taskIndices = createSkeletonRange(TASK_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <TaskControlsSkeleton />

      {/* Task list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {taskIndices.map((index) => (
            <TaskItemSkeleton key={generateSkeletonKey('task', index)} index={index} />
          ))}
        </div>
      </div>

      <TaskActionsFooterSkeleton />

      <span className="sr-only">{ARIA_LABELS.TASKS_LOADING}</span>
    </div>
  );
}

MyWorkTodaySkeleton.displayName = 'MyWorkTodaySkeleton';
