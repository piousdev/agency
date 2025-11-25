import { memo } from 'react';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { TREND_COLORS } from '@/components/dashboard/business-center/overview/constants/sprint-config';
import { formatVelocityChange } from '@/components/dashboard/business-center/overview/utils/sprint';
import type { TrendDirection } from '@/components/dashboard/business-center/overview/types';

interface VelocityTrendIndicatorProps {
  readonly trend: TrendDirection;
  readonly change: number;
}

const VelocityTrendIndicator = memo(function VelocityTrendIndicator({
  trend,
  change,
}: VelocityTrendIndicatorProps) {
  if (trend === 'stable') return null;

  const Icon = trend === 'up' ? IconTrendingUp : IconTrendingDown;
  const colorClass = TREND_COLORS[trend];

  return (
    <div className="flex items-center gap-1">
      <Icon className={cn('h-4 w-4', colorClass)} aria-hidden="true" />
      <span className={cn('text-xs', colorClass)}>{formatVelocityChange(change)} vs prev</span>
    </div>
  );
});

interface VelocityComparisonProps {
  readonly velocity: number;
  readonly trend: TrendDirection;
  readonly change: number;
}

export const VelocityComparison = memo(function VelocityComparison({
  velocity,
  trend,
  change,
}: VelocityComparisonProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Velocity</span>
        <span className="font-semibold">{velocity}</span>
        <span className="text-xs text-muted-foreground">pts/sprint</span>
      </div>
      <VelocityTrendIndicator trend={trend} change={change} />
    </div>
  );
});
