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
 * Team Status skeleton - Team member cards
 */
export function TeamStatusSkeleton({ className }: BaseSkeletonProps) {
  const memberIndices = createSkeletonRange(4);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Summary */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Team member list */}
      <ul className="flex-1 space-y-2">
        {memberIndices.map((index) => (
          <li
            key={generateSkeletonKey('team-member', index)}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index)}
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-12 mb-1" />
              <Skeleton className="h-2 w-16 rounded-full" />
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.TEAM_LOADING}</span>
    </div>
  );
}

TeamStatusSkeleton.displayName = 'TeamStatusSkeleton';
