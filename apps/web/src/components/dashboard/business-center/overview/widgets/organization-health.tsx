'use client';

import { cn } from '@/lib/utils';
import { useHealthMetrics } from '@/components/dashboard/business-center/overview/hooks/use-health-metrics';
import { HealthScoreHeader } from '@/components/dashboard/business-center/overview/components/health-score-header';
import { HealthMetricItem } from '@/components/dashboard/business-center/overview/components/health-metric-item';
import { HealthActions } from '@/components/dashboard/business-center/overview/components/health-actions';
import type { HealthMetric } from '@/components/dashboard/business-center/overview/types';

export interface OrganizationHealthWidgetProps {
  readonly metrics?: readonly HealthMetric[];
  readonly className?: string;
}

export const OrganizationHealthWidget = ({
  metrics: propMetrics,
  className,
}: OrganizationHealthWidgetProps) => {
  const { metrics, overallScore } = useHealthMetrics({ metrics: propMetrics });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <HealthScoreHeader score={overallScore} />

      <div className="space-y-3 flex-1">
        {metrics.map((metric) => (
          <HealthMetricItem key={metric.id} metric={metric} />
        ))}
      </div>

      <HealthActions />
    </div>
  );
};
