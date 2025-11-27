'use client';

/**
 * Widget Content Skeleton
 * Generic loading skeleton for widget content area
 * Note: This is different from dashboard widget skeletons
 */

import {
  WIDGET_ARIA_LABELS,
  WIDGET_CLASSES,
  WIDGET_SKELETON_VARIANTS,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-container/constants';
import { Skeleton } from '@/components/ui/skeleton';

import type { WidgetSkeletonProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-container/type';

/**
 * Renders appropriate skeleton based on variant
 */
export function WidgetContentSkeleton({
  variant = WIDGET_SKELETON_VARIANTS.DEFAULT,
}: WidgetSkeletonProps) {
  return (
    <div
      className={WIDGET_CLASSES.SKELETON_CONTAINER}
      role="status"
      aria-label={WIDGET_ARIA_LABELS.LOADING_CONTENT}
    >
      {variant === WIDGET_SKELETON_VARIANTS.COMPACT && <CompactSkeleton />}
      {variant === WIDGET_SKELETON_VARIANTS.DETAILED && <DetailedSkeleton />}
      {variant === WIDGET_SKELETON_VARIANTS.DEFAULT && <DefaultSkeleton />}

      <span className="sr-only">{WIDGET_ARIA_LABELS.LOADING_TEXT}</span>
    </div>
  );
}

WidgetContentSkeleton.displayName = 'WidgetContentSkeleton';

/**
 * Default skeleton variant - balanced layout
 */
function DefaultSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </>
  );
}

/**
 * Compact skeleton variant - minimal layout
 */
function CompactSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-16 w-full" />
    </>
  );
}

/**
 * Detailed skeleton variant - comprehensive layout
 */
function DetailedSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </>
  );
}
