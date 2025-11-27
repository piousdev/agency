'use client';

/**
 * Upcoming Deadlines Skeleton Component
 * Matches DeadlineItem + DeadlineActions structure
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

const DEADLINE_COUNT = 5 as const;

/**
 * DeadlineItem skeleton - Icon box, title, badge + project, date + client
 */
function DeadlineItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border bg-card animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index)}
    >
      {/* DeadlineIcon - icon box */}
      <Skeleton className="h-8 w-8 rounded-lg mt-1" />

      {/* DeadlineContent - title, badge + project */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* DeadlineMeta - date, client */}
      <div className="text-right shrink-0">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * DeadlineActions skeleton - View calendar + Export buttons
 */
function DeadlineActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t flex gap-2">
      <Skeleton className="h-8 flex-1 rounded" />
      <Skeleton className="h-8 w-8 rounded" />
    </footer>
  );
}

/**
 * Upcoming Deadlines skeleton - Matches actual widget structure
 */
export function UpcomingDeadlinesSkeleton({ className }: BaseSkeletonProps) {
  const deadlineIndices = createSkeletonRange(DEADLINE_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Deadline list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {deadlineIndices.map((index) => (
            <DeadlineItemSkeleton key={generateSkeletonKey('deadline', index)} index={index} />
          ))}
        </div>
      </div>

      <DeadlineActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.DEADLINES_LOADING}</span>
    </div>
  );
}

UpcomingDeadlinesSkeleton.displayName = 'UpcomingDeadlinesSkeleton';
