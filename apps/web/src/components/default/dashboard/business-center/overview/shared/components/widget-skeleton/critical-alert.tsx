'use client';

/**
 * Critical Alerts Skeleton Component
 * Matches AlertsHeader + AlertItem + DismissAllButton structure
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

const ALERT_COUNT = 3 as const;

/**
 * AlertsHeader skeleton - Icon, count label, connection dot, filter badges
 */
function AlertsHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-2 w-2 rounded-full ml-1" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * AlertItem skeleton - Left border, icon, title, message, footer
 */
function AlertItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="p-3 rounded-lg border-l-4 border-l-muted bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index, 100)}
    >
      {/* Header with icon, content, and actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-4 mt-0.5 shrink-0 rounded" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>

      {/* Footer - entity info, time, view link */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

/**
 * DismissAllButton skeleton
 */
function DismissAllButtonSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Critical Alerts skeleton - Matches actual widget structure
 */
export function CriticalAlertsSkeleton({ className }: BaseSkeletonProps) {
  const alertIndices = createSkeletonRange(ALERT_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <AlertsHeaderSkeleton />

      {/* Alert list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {alertIndices.map((index) => (
            <AlertItemSkeleton key={generateSkeletonKey('alert', index)} index={index} />
          ))}
        </div>
      </div>

      <DismissAllButtonSkeleton />

      <span className="sr-only">{ARIA_LABELS.ALERTS_LOADING}</span>
    </div>
  );
}

CriticalAlertsSkeleton.displayName = 'CriticalAlertsSkeleton';
