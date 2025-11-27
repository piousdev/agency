import { memo, type ComponentType } from 'react';

import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

import {
  formatValue,
  getTrendColorClass,
  formatChange,
} from '@/components/default/dashboard/business-center/overview/utils/financial';
import { cn } from '@/lib/utils';

import type {
  FinancialMetric,
  TrendDirection,
} from '@/components/default/dashboard/business-center/overview/types';

interface TrendIndicatorProps {
  readonly trend: TrendDirection;
  readonly change: number;
  readonly colorClass: string;
}

const TrendIndicator = memo(function TrendIndicator({
  trend,
  change,
  colorClass,
}: TrendIndicatorProps) {
  if (trend === 'neutral') return null;

  const Icon = trend === 'up' ? IconTrendingUp : IconTrendingDown;

  return (
    <div className={cn('flex items-center gap-1 text-xs', colorClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{formatChange(change)}</span>
    </div>
  );
});

interface MetricCardProps {
  readonly metric: FinancialMetric;
  readonly icon: ComponentType<{ className?: string }>;
  readonly isPositiveGood: boolean;
}

export const MetricCard = memo(function MetricCard({
  metric,
  icon: Icon,
  isPositiveGood,
}: MetricCardProps) {
  const trendColorClass = getTrendColorClass(metric.trend, isPositiveGood);

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">{metric.label}</span>
      </div>
      <p className="text-lg font-semibold">{formatValue(metric.value, metric.format)}</p>
      <TrendIndicator trend={metric.trend} change={metric.change} colorClass={trendColorClass} />
    </div>
  );
});
