'use client';

/**
 * Team Status Skeleton Component
 * Matches TeamSummary + TeamMemberItem + TeamActions structure
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

const MEMBER_COUNT = 4 as const;

/**
 * TeamSummary skeleton - Status indicators + task counts
 */
function TeamSummarySkeleton() {
  return (
    <div className="mb-4 pb-4 border-b space-y-2">
      {/* Status indicators row */}
      <div className="flex items-center gap-4">
        {/* Available */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* Busy */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        {/* Overloaded */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-3 w-18" />
        </div>
      </div>
      {/* Task count row */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * TeamMemberItem skeleton - Avatar with status, info, task badge
 */
function TeamMemberItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-3 animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index)}
    >
      {/* Avatar with status dot */}
      <div className="relative">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background" />
      </div>

      {/* Member info */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Task badge */}
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

/**
 * TeamActions skeleton
 */
function TeamActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Team Status skeleton - Matches actual widget structure
 */
export function TeamStatusSkeleton({ className }: BaseSkeletonProps) {
  const memberIndices = createSkeletonRange(MEMBER_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <TeamSummarySkeleton />

      {/* Team member list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {memberIndices.map((index) => (
            <TeamMemberItemSkeleton key={generateSkeletonKey('team-member', index)} index={index} />
          ))}
        </div>
      </div>

      <TeamActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.TEAM_LOADING}</span>
    </div>
  );
}

TeamStatusSkeleton.displayName = 'TeamStatusSkeleton';
