'use client';

/**
 * Organization Health Skeleton Component
 * Health metrics and score loading state
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BaseSkeletonProps } from '@/components/dashboard/business-center/overview/shared/type';
import { ARIA_LABELS } from '@/components/dashboard/business-center/overview/shared/constants/skeleton';
import {
  getStaggeredDelay,
  createSkeletonRange,
  generateSkeletonKey,
} from '@/components/dashboard/business-center/overview/shared/utils/skeleton';

const METRIC_COUNT = 4 as const;

/**
 * Organization Health skeleton - Metric cards with health score
 */
export function OrganizationHealthSkeleton({ className }: BaseSkeletonProps) {
  const metricIndices = createSkeletonRange(METRIC_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Health score */}
      <div className="flex items-center justify-center mb-4" aria-label="Health score loading">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3 flex-1" role="list" aria-label="Health metrics">
        {metricIndices.map((index) => (
          <div
            key={generateSkeletonKey('health-metric', index)}
            role="listitem"
            className="p-3 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={getStaggeredDelay(index, 100)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-2 w-full mt-2 rounded-full" />
          </div>
        ))}
      </div>

      <span className="sr-only">{ARIA_LABELS.HEALTH_LOADING}</span>
    </div>
  );
}

OrganizationHealthSkeleton.displayName = 'OrganizationHealthSkeleton';
