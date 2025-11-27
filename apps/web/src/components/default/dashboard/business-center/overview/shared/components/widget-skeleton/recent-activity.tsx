'use client';

/**
 * Recent Activity Skeleton Component
 * Matches ActivityFilter + ConnectionIndicator + ActivityItem + ActivityActions structure
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

const ACTIVITY_COUNT = 6 as const;

/**
 * ActivityFilter + ConnectionIndicator skeleton - Dropdown filter + status dot
 */
function ActivityFilterSkeleton() {
  return (
    <div className="flex items-center gap-2 p-0 mb-3">
      {/* ActivityFilter - Select dropdown */}
      <Skeleton className="h-8 w-28 rounded-md" />
      {/* ConnectionIndicator */}
      <Skeleton className="h-2 w-2 rounded-full ml-auto" />
    </div>
  );
}

/**
 * ActivityItem skeleton - Avatar, content (name, description, project), meta (type icon, time)
 */
function ActivityItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-start gap-3 p-0 my-4 animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index)}
    >
      {/* ActivityAvatar */}
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />

      {/* ActivityContent */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-3 w-32 mt-0.5" />
      </div>

      {/* ActivityMeta - type icon + time */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

/**
 * ActivityActions skeleton
 */
function ActivityActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Recent Activity skeleton - Matches actual widget structure
 */
export function RecentActivitySkeleton({ className }: BaseSkeletonProps) {
  const activityIndices = createSkeletonRange(ACTIVITY_COUNT);

  return (
    <div className={cn('flex flex-col h-full p-2', className)} role="status">
      <ActivityFilterSkeleton />

      {/* Activity list in ScrollArea */}
      <div className="flex-1">
        <div className="space-y-3">
          {activityIndices.map((index) => (
            <ActivityItemSkeleton key={generateSkeletonKey('activity', index)} index={index} />
          ))}
        </div>
      </div>

      <ActivityActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.ACTIVITY_LOADING}</span>
    </div>
  );
}

RecentActivitySkeleton.displayName = 'RecentActivitySkeleton';
