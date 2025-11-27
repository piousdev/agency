// components/metric-card/metric-card-grid.tsx
import {
  GRID_COLUMNS,
  METRIC_CARD_CLASSES,
  METRIC_CARD_DEFAULTS,
} from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/constants';
import { cn } from '@/lib/utils';

import type { MetricCardGridProps } from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/types';

export function MetricCardGrid({
  children,
  columns = METRIC_CARD_DEFAULTS.COLUMNS,
  className,
}: MetricCardGridProps) {
  return (
    <div className={cn(METRIC_CARD_CLASSES.GRID, GRID_COLUMNS[columns], className)}>{children}</div>
  );
}
