'use client';

/**
 * Financial Snapshot Skeleton Component
 * Matches MetricCard (2x2 grid) + BudgetProgress + FinancialActions structure
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
 * MetricCard skeleton - Icon + label, value, trend indicator
 */
function MetricCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="p-3 rounded-lg bg-muted/50 animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index, 50)}
    >
      {/* Icon + label row */}
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      {/* Value */}
      <Skeleton className="h-5 w-16 mb-1" />
      {/* Trend indicator */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

/**
 * BudgetProgress skeleton - Label, values, progress bar, percentage
 */
function BudgetProgressSkeleton() {
  return (
    <div className="mb-4">
      {/* Label */}
      <Skeleton className="h-3 w-24 mb-2" />
      {/* Values row */}
      <div className="flex items-baseline gap-1 mb-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Progress bar with percentage */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-2 flex-1 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

/**
 * FinancialActions skeleton
 */
function FinancialActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Financial Snapshot skeleton - Matches actual widget structure
 */
export function FinancialSnapshotSkeleton({ className }: BaseSkeletonProps) {
  const metricIndices = createSkeletonRange(METRIC_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Main Metrics Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {metricIndices.map((index) => (
          <MetricCardSkeleton key={generateSkeletonKey('financial-metric', index)} index={index} />
        ))}
      </div>

      <BudgetProgressSkeleton />
      <FinancialActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.FINANCIAL_LOADING}</span>
    </div>
  );
}

FinancialSnapshotSkeleton.displayName = 'FinancialSnapshotSkeleton';
