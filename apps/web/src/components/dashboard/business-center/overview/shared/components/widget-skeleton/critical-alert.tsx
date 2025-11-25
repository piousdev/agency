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
 * Critical Alerts skeleton - Alert items
 */
export function CriticalAlertsSkeleton({ className }: BaseSkeletonProps) {
  const alertIndices = createSkeletonRange(3);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </header>

      {/* Alert list */}
      <ul className="flex-1 space-y-2">
        {alertIndices.map((index) => (
          <li
            key={generateSkeletonKey('alert', index)}
            className="p-3 rounded-lg bg-muted/30 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <Skeleton className="h-4 w-4 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
          </li>
        ))}
      </ul>

      <span className="sr-only">{ARIA_LABELS.ALERTS_LOADING}</span>
    </div>
  );
}

CriticalAlertsSkeleton.displayName = 'CriticalAlertsSkeleton';
