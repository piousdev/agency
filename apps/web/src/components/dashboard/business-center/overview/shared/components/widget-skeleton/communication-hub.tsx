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
 * Communication Hub skeleton - Messages and mentions
 */
export function CommunicationHubSkeleton({ className }: BaseSkeletonProps) {
  const messageIndices = createSkeletonRange(4);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Header with tabs */}
      <header className="flex items-center justify-between mb-3">
        <nav className="flex gap-1" aria-label="Message tabs">
          <Skeleton className="h-7 w-14 rounded" />
          <Skeleton className="h-7 w-10 rounded" />
          <Skeleton className="h-7 w-10 rounded" />
        </nav>
        <Skeleton className="h-6 w-24 rounded" />
      </header>

      {/* Notification list */}
      <ul className="flex-1 space-y-2">
        {messageIndices.map((index) => (
          <li
            key={generateSkeletonKey('message', index)}
            className="p-3 rounded-lg border bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.MESSAGES_LOADING}</span>
    </div>
  );
}

CommunicationHubSkeleton.displayName = 'CommunicationHubSkeleton';
