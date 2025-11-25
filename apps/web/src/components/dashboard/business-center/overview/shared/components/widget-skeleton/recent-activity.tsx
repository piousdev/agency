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
 * Recent Activity skeleton - Activity feed items
 */
export function RecentActivitySkeleton({ className }: BaseSkeletonProps) {
  const filterIndices = createSkeletonRange(5);
  const activityIndices = createSkeletonRange(5);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Filter tabs */}
      <nav className="flex items-center gap-1 mb-3 overflow-x-auto" aria-label="Activity filters">
        {filterIndices.map((index) => (
          <Skeleton
            key={generateSkeletonKey('activity-filter', index)}
            className="h-7 w-16 rounded-md shrink-0"
          />
        ))}
      </nav>

      {/* Activity list */}
      <ul className="flex-1 space-y-3">
        {activityIndices.map((index) => (
          <li
            key={generateSkeletonKey('activity', index)}
            className="flex items-start gap-3 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index)}
          >
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full mb-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.ACTIVITY_LOADING}</span>
    </div>
  );
}

RecentActivitySkeleton.displayName = 'RecentActivitySkeleton';
