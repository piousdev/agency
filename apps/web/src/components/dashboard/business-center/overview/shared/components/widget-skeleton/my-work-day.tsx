'use client';

/**
 * My Work Today Skeleton Component
 * Task list loading state with filter bar
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

const TASK_COUNT = 5 as const;

/**
 * My Work Today skeleton - Task list items with filter controls
 */
export function MyWorkTodaySkeleton({ className }: BaseSkeletonProps) {
  const taskIndices = createSkeletonRange(TASK_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Filter bar */}
      <nav className="flex items-center gap-2 mb-3" aria-label="Task filters">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </nav>

      {/* Task list */}
      <ul className="flex-1 space-y-2">
        {taskIndices.map((index) => (
          <li
            key={generateSkeletonKey('task', index)}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index)}
          >
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-4/5" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.TASKS_LOADING}</span>
    </div>
  );
}

MyWorkTodaySkeleton.displayName = 'MyWorkTodaySkeleton';
