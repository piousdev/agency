'use client';

/**
 * Organization Health Skeleton Component
 * Matches HealthScoreHeader + HealthMetricItem + HealthActions structure
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

const METRIC_COUNT = 4 as const;

/**
 * HealthScoreHeader skeleton - Label, score percentage, indicator circle
 */
function HealthScoreHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <Skeleton className="h-3 w-28 mb-1" />
        <Skeleton className="h-8 w-14" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  );
}

/**
 * HealthMetricItem skeleton - Icon, label, value with trend, progress bar
 */
function HealthMetricItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="space-y-1 animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index, 75)}
    >
      <div className="flex items-center justify-between text-sm">
        {/* MetricHeader - icon + label */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* MetricValue - value + trend */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      {/* Progress bar */}
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

/**
 * HealthActions skeleton
 */
function HealthActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Organization Health skeleton - Matches actual widget structure
 */
export function OrganizationHealthSkeleton({ className }: BaseSkeletonProps) {
  const metricIndices = createSkeletonRange(METRIC_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <HealthScoreHeaderSkeleton />

      <div className="space-y-3 flex-1">
        {metricIndices.map((index) => (
          <HealthMetricItemSkeleton
            key={generateSkeletonKey('health-metric', index)}
            index={index}
          />
        ))}
      </div>

      <HealthActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.HEALTH_LOADING}</span>
    </div>
  );
}

OrganizationHealthSkeleton.displayName = 'OrganizationHealthSkeleton';
