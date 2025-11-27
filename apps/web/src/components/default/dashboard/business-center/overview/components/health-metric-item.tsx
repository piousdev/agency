import Link from 'next/link';

import { TREND_CONFIG } from '@/components/default/dashboard/business-center/overview/constants/health-config';
import {
  getProgressColorClass,
  calculateProgress,
} from '@/components/default/dashboard/business-center/overview/utils/health';
import { Item, ItemContent, ItemMedia } from '@/components/ui/item';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import type { HealthMetric } from '@/components/default/dashboard/business-center/overview/types';


interface MetricHeaderProps {
  readonly icon: HealthMetric['icon'];
  readonly label: string;
}

const MetricHeader = ({ icon: Icon, label }: MetricHeaderProps) => {
  return (
    <Item className="gap-2 p-0" data-testid="metric-header" aria-label={label}>
      <ItemMedia aria-label={label} data-testid="metric-header-icon">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" aria-label={label} />
      </ItemMedia>
      <ItemContent aria-label={label} data-testid="metric-header-label">
        {label}
      </ItemContent>
    </Item>
  );
};

interface MetricValueProps {
  readonly value: number;
  readonly trend: HealthMetric['trend'];
  readonly trendValue: number;
}

const MetricValue = ({ value, trend, trendValue }: MetricValueProps) => {
  const trendConfig = TREND_CONFIG[trend];
  const TrendIcon = trendConfig.icon;
  const showTrendValue = trendValue > 0;

  return (
    <Item className="gap-2 p-0" data-testid="metric-value" aria-label={`${String(value)}%`}>
      <ItemContent
        className="font-medium"
        aria-label={`${String(value)}%`}
        data-testid="metric-value-content"
      >
        {value}%
      </ItemContent>
      <ItemContent
        className={cn('text-xs', trendConfig.colorClass)}
        aria-label={`${String(value)}%`}
        data-testid="metric-value-trend"
      >
        <TrendIcon className="size-3" aria-hidden="true" aria-label={`${String(value)}%`} />
        {showTrendValue && `${String(trendValue)}%`}
      </ItemContent>
    </Item>
  );
};

interface MetricContentProps {
  readonly metric: HealthMetric;
}

const MetricContent = ({ metric }: MetricContentProps) => {
  const progressValue = calculateProgress(metric.value, metric.target);
  const progressColorClass = getProgressColorClass(metric.value, metric.target);

  return (
    <Item className="flex p-0" data-testid="metric-content" aria-label={metric.label}>
      <ItemContent
        className="flex flex-row items-center justify-between text-sm"
        aria-label={metric.label}
        data-testid="metric-content"
      >
        <MetricHeader icon={metric.icon} label={metric.label} />
        <MetricValue value={metric.value} trend={metric.trend} trendValue={metric.trendValue} />
      </ItemContent>
      <Progress value={progressValue} className="h-1.5" indicatorClassName={progressColorClass} />
    </Item>
  );
};

interface HealthMetricItemProps {
  readonly metric: HealthMetric;
}

export const HealthMetricItem = ({ metric }: HealthMetricItemProps) => {
  const content = <MetricContent metric={metric} />;

  if (metric.drilldownUrl) {
    return (
      <Link
        href={metric.drilldownUrl}
        className="block rounded-md p-2 m-2 hover:bg-muted/50 transition-colors cursor-pointer"
        data-testid="metric-item"
        aria-label={metric.label}
      >
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
};
