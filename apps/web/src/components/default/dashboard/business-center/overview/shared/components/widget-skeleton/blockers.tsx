'use client';

/**
 * Blockers Skeleton Component
 * Matches BlockersSummary + BlockerItem + BlockersFooter structure
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

const BLOCKER_COUNT = 3 as const;

/**
 * BlockersSummary skeleton - Icon circle, count, label
 */
function BlockersSummarySkeleton() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div>
        <Skeleton className="h-7 w-8 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * BlockerItem skeleton - Icon box, title, project, days badge, reason, actions
 */
function BlockerItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="p-3 rounded-lg border bg-card animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index, 100)}
    >
      {/* BlockerHeader - icon, title/project, days badge */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-7 w-7 rounded-md mt-0.5" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Reason */}
      <Skeleton className="h-3 w-4/5 mt-2 ml-10" />

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-3">
        <Skeleton className="h-7 w-20 rounded" />
        <Skeleton className="h-7 w-16 rounded" />
      </div>
    </div>
  );
}

/**
 * BlockersFooter skeleton
 */
function BlockersFooterSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Blockers skeleton - Matches actual widget structure
 */
export function BlockersSkeleton({ className }: BaseSkeletonProps) {
  const blockerIndices = createSkeletonRange(BLOCKER_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <BlockersSummarySkeleton />

      {/* Blocker list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {blockerIndices.map((index) => (
            <BlockerItemSkeleton key={generateSkeletonKey('blocker', index)} index={index} />
          ))}
        </div>
      </div>

      <BlockersFooterSkeleton />

      <span className="sr-only">{ARIA_LABELS.BLOCKERS_LOADING}</span>
    </div>
  );
}

BlockersSkeleton.displayName = 'BlockersSkeleton';
