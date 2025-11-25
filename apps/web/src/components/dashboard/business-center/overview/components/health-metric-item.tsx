import { memo } from 'react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TREND_CONFIG } from '@/components/dashboard/business-center/overview/constants/health-config';
import {
  getProgressColorClass,
  calculateProgress,
} from '@/components/dashboard/business-center/overview/utils/health';
import type { HealthMetric } from '@/components/dashboard/business-center/overview/types';

interface MetricHeaderProps {
  readonly icon: HealthMetric['icon'];
  readonly label: string;
}

const MetricHeader = memo(function MetricHeader({ icon: Icon, label }: MetricHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
});

interface MetricValueProps {
  readonly value: number;
  readonly trend: HealthMetric['trend'];
  readonly trendValue: number;
}

const MetricValue = memo(function MetricValue({ value, trend, trendValue }: MetricValueProps) {
  const trendConfig = TREND_CONFIG[trend];
  const TrendIcon = trendConfig.icon;
  const showTrendValue = trendValue > 0;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{value}%</span>
      <span className={cn('flex items-center text-xs', trendConfig.colorClass)}>
        <TrendIcon className="h-3 w-3" aria-hidden="true" />
        {showTrendValue && `${trendValue}%`}
      </span>
    </div>
  );
});

interface MetricContentProps {
  readonly metric: HealthMetric;
}

const MetricContent = memo(function MetricContent({ metric }: MetricContentProps) {
  const progressValue = calculateProgress(metric.value, metric.target);
  const progressColorClass = getProgressColorClass(metric.value, metric.target);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <MetricHeader icon={metric.icon} label={metric.label} />
        <MetricValue value={metric.value} trend={metric.trend} trendValue={metric.trendValue} />
      </div>
      <Progress value={progressValue} className="h-1.5" indicatorClassName={progressColorClass} />
    </div>
  );
});

interface HealthMetricItemProps {
  readonly metric: HealthMetric;
}

export const HealthMetricItem = memo(function HealthMetricItem({ metric }: HealthMetricItemProps) {
  const content = <MetricContent metric={metric} />;

  if (metric.drilldownUrl) {
    return (
      <Link
        href={metric.drilldownUrl}
        className="block rounded-md p-1 -m-1 hover:bg-muted/50 transition-colors cursor-pointer"
      >
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
});
