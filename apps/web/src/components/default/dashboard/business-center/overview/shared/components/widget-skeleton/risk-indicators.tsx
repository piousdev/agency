'use client';

/**
 * Risk Indicators Skeleton Component
 * Matches RiskSummaryHeader + RiskItem + RiskActions structure
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

const RISK_COUNT = 3 as const;

/**
 * RiskSummaryHeader skeleton - Icon, total count, severity badges
 */
function RiskSummaryHeaderSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Icon + Total label */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Severity badges */}
      <div className="flex gap-1.5 ml-auto">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

/**
 * RiskItem skeleton - Category/severity header, description, impact, footer
 */
function RiskItemSkeleton({ index }: { index: number }) {
  return (
    <div
      className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
      style={getStaggeredDelay(index, 100)}
    >
      {/* RiskItemHeader - category icon/label, severity badge */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>

      {/* RiskItemContent - description, impact, mitigation */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <Skeleton className="h-3 w-2/3" />

      {/* RiskItemFooter - project name, view link */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/**
 * RiskActions skeleton
 */
function RiskActionsSkeleton() {
  return (
    <footer className="pt-3 mt-auto border-t">
      <Skeleton className="h-8 w-full rounded" />
    </footer>
  );
}

/**
 * Risk Indicators skeleton - Matches actual widget structure
 */
export function RiskIndicatorsSkeleton({ className }: BaseSkeletonProps) {
  const riskIndices = createSkeletonRange(RISK_COUNT);

  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      <RiskSummaryHeaderSkeleton />

      {/* Risk list in ScrollArea */}
      <div className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {riskIndices.map((index) => (
            <RiskItemSkeleton key={generateSkeletonKey('risk', index)} index={index} />
          ))}
        </div>
      </div>

      <RiskActionsSkeleton />

      <span className="sr-only">{ARIA_LABELS.RISK_LOADING}</span>
    </div>
  );
}

RiskIndicatorsSkeleton.displayName = 'RiskIndicatorsSkeleton';
