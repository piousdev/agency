'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BaseSkeletonProps } from '@/components/dashboard/business-center/overview/shared/type';
import { ARIA_LABELS } from '@/components/dashboard/business-center/overview/shared/constants/skeleton';
import {
  getStaggeredDelay,
  createSkeletonRange,
  generateSkeletonKey,
} from '@/components/dashboard/business-center/overview/shared/utils/skeleton';

/**
 * Upcoming Deadlines skeleton - Timeline items
 */
export function UpcomingDeadlinesSkeleton({ className }: BaseSkeletonProps) {
  const deadlineIndices = createSkeletonRange(4);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Time filter */}
      <nav className="flex items-center gap-2 mb-3" aria-label="Time filters">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </nav>

      {/* Deadline items */}
      <ul className="flex-1 space-y-3">
        {deadlineIndices.map((index) => (
          <li
            key={generateSkeletonKey('deadline', index)}
            className="flex gap-3 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index)}
          >
            <div className="flex flex-col items-center">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-full w-0.5 mt-1" />
            </div>
            <div className="flex-1 pb-3">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.DEADLINES_LOADING}</span>
    </div>
  );
}

UpcomingDeadlinesSkeleton.displayName = 'UpcomingDeadlinesSkeleton';
