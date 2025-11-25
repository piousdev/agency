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
 * Financial Snapshot skeleton - Financial metrics
 */
export function FinancialSnapshotSkeleton({ className }: BaseSkeletonProps) {
  const metricIndices = createSkeletonRange(4);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {metricIndices.map((index) => (
          <div
            key={generateSkeletonKey('financial-metric', index)}
            className="p-3 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Budget progress */}
      <section className="p-3 rounded-lg bg-muted/30" aria-label="Budget progress">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </section>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.FINANCIAL_LOADING}</span>
    </div>
  );
}

FinancialSnapshotSkeleton.displayName = 'FinancialSnapshotSkeleton';
