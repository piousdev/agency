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
 * Blockers skeleton - Blocker items
 */
export function BlockersSkeleton({ className }: BaseSkeletonProps) {
  const blockerIndices = createSkeletonRange(3);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Summary */}
      <header className="flex items-center gap-3 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full ml-auto" />
      </header>

      {/* Blocker list */}
      <ul className="flex-1 space-y-3">
        {blockerIndices.map((index) => (
          <li
            key={generateSkeletonKey('blocker', index)}
            className="p-3 rounded-lg bg-muted/30 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/2 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </li>
        ))}
      </ul>

      <span className="sr-only">{ARIA_LABELS.BLOCKERS_LOADING}</span>
    </div>
  );
}

BlockersSkeleton.displayName = 'BlockersSkeleton';
