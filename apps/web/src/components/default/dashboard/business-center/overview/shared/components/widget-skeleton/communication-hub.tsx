'use client';

/**
 * Communication Hub Skeleton Component
 * Matches HubHeader (tabs) + NotificationItem + HubActions structure
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

const MESSAGE_COUNT = 4 as const;

/**
 * HubHeader skeleton - Tabs (All, Mentions, Comments), connection dot, mark all button
 */
function HubHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-3">
      {/* Tabs */}
      <div className="flex h-7 items-center gap-0.5 rounded-md bg-muted p-0.5">
        <Skeleton className="h-6 w-10 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      {/* Connection + Mark all read */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-6 w-24 rounded" />
      </div>
    </div>
  );
}

/**
 * NotificationItem skeleton - Avatar, content (name, icon, message, context, time), actions
 */
function NotificationItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="p-3 rounded-lg border bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index, 100)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header - name, type icon, unread dot */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>

          {/* Message */}
          <Skeleton className="h-3 w-full mt-1" />

          {/* Context - badge + time */}
          <div className="flex items-center gap-2 mt-1.5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        {/* Actions */}
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
  );
}

/**
 * HubActions skeleton
 */
function HubActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Communication Hub skeleton - Matches actual widget structure
 */
export function CommunicationHubSkeleton({ className }: BaseSkeletonProps) {
  const messageIndices = createSkeletonRange(MESSAGE_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <HubHeaderSkeleton />

      {/* Notification list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {messageIndices.map((index) => (
            <NotificationItemSkeleton
              key={generateSkeletonKey('notification', index)}
              index={index}
            />
          ))}
        </div>
      </div>

      <HubActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.MESSAGES_LOADING}</span>
    </div>
  );
}

CommunicationHubSkeleton.displayName = 'CommunicationHubSkeleton';
