// components/metric-card/metric-card.tsx
'use client';

import { MetricIcon } from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/components/metric-icon';
import { TrendIndicator } from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/components/trend-indicator';
import {
  METRIC_CARD_CLASSES,
  METRIC_CARD_DEFAULTS,
} from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/constants';
import {
  getSizeClasses,
  getValueSizeClasses,
} from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/utils';
import { cn } from '@/lib/utils';

import type { MetricCardProps } from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/types';

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  trend,
  icon,
  className,
  size = METRIC_CARD_DEFAULTS.SIZE,
}: MetricCardProps) {
  return (
    <div className={cn(METRIC_CARD_CLASSES.CONTAINER, getSizeClasses(size), className)}>
      <div className={METRIC_CARD_CLASSES.HEADER}>
        <div className={METRIC_CARD_CLASSES.CONTENT}>
          <p className={METRIC_CARD_CLASSES.LABEL}>{label}</p>
          <p className={cn(METRIC_CARD_CLASSES.VALUE, getValueSizeClasses(size))}>{value}</p>
        </div>
        {icon && <MetricIcon icon={icon} />}
      </div>
      <TrendIndicator trend={trend} change={change} changeLabel={changeLabel} />
    </div>
  );
}
