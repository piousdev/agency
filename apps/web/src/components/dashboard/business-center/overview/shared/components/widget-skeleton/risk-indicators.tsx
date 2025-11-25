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
 * Risk Indicators skeleton - Risk items
 */
export function RiskIndicatorsSkeleton({ className }: BaseSkeletonProps) {
  const riskIndices = createSkeletonRange(3);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Summary */}
      <header className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-1.5 ml-auto">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </header>

      {/* Risk list */}
      <ul className="flex-1 space-y-3">
        {riskIndices.map((index) => (
          <li
            key={generateSkeletonKey('risk', index)}
            className="p-3 rounded-lg bg-muted/30 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-3/4 mb-2" />
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </footer>

      <span className="sr-only">{ARIA_LABELS.RISK_LOADING}</span>
    </div>
  );
}

RiskIndicatorsSkeleton.displayName = 'RiskIndicatorsSkeleton';
