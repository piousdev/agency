'use client';

/**
 * Widget Grid Skeleton Component
 * Implements staggered loading appearance for multiple widgets
 */

import { WidgetSkeleton } from '@/components/dashboard/business-center/overview/shared/components/widget-skeleton';
import type { WidgetGridSkeletonProps } from '@/components/dashboard/business-center/overview/shared/type';
import {
  SKELETON_DEFAULTS,
  GRID_CONFIGS,
} from '@/components/dashboard/business-center/overview/shared/constants/skeleton';
import {
  getStaggeredDelay,
  createSkeletonRange,
  generateSkeletonKey,
  getWidgetSkeleton,
} from '@/components/dashboard/business-center/overview/shared/utils/skeleton';

/**
 * Grid skeleton for multiple widgets loading together
 * Uses staggered animation for better perceived performance
 */
export function WidgetGridSkeleton({
  count = SKELETON_DEFAULTS.GRID_COUNT,
  widgetTypes,
}: WidgetGridSkeletonProps) {
  const gridIndices = createSkeletonRange(count);

  if (widgetTypes && widgetTypes.length > 0) {
    return (
      <div className={`grid ${GRID_CONFIGS.RESPONSIVE} gap-4`}>
        {widgetTypes.map((type, index) => {
          const SpecificSkeleton = getWidgetSkeleton(type);
          return (
            <div
              key={generateSkeletonKey(`widget-grid-${type}`, index)}
              className="bg-card border rounded-lg p-4 h-64 animate-in fade-in duration-500 fill-mode-both"
              style={getStaggeredDelay(index)}
            >
              <SpecificSkeleton />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid ${GRID_CONFIGS.RESPONSIVE} gap-4`}>
      {gridIndices.map((index) => (
        <div
          key={generateSkeletonKey('widget-grid', index)}
          className="bg-card border rounded-lg p-4 h-64 animate-in fade-in duration-500 fill-mode-both"
          style={getStaggeredDelay(index)}
        >
          <WidgetSkeleton />
        </div>
      ))}
    </div>
  );
}

WidgetGridSkeleton.displayName = 'WidgetGridSkeleton';
