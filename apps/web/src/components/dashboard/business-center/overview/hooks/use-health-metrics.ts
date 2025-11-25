import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_METRICS } from '@/components/dashboard/business-center/overview/constants/oh-mock-data';
import {
  getMetricConfig,
  deriveTarget,
  calculateOverallScore,
} from '@/components/dashboard/business-center/overview/utils/health';
import {
  normalizeTrend,
  type HealthMetric,
} from '@/components/dashboard/business-center/overview/types';

interface UseHealthMetricsOptions {
  readonly metrics?: readonly HealthMetric[];
}

interface UseHealthMetricsReturn {
  readonly metrics: readonly HealthMetric[];
  readonly overallScore: number;
  readonly isEmpty: boolean;
}

export function useHealthMetrics(options: UseHealthMetricsOptions = {}): UseHealthMetricsReturn {
  const { metrics: propMetrics } = options;
  const overviewData = useOverviewData();

  const metrics = useMemo<readonly HealthMetric[]>(() => {
    // Priority: server data > prop data > mock data
    if (overviewData?.orgHealth?.length) {
      return overviewData.orgHealth.map((serverMetric): HealthMetric => {
        const config = getMetricConfig(serverMetric.id);

        return {
          id: serverMetric.id,
          label: serverMetric.label,
          value: Math.max(0, serverMetric.value), // Ensure non-negative
          target: deriveTarget(serverMetric.value),
          trend: normalizeTrend(serverMetric.trend),
          trendValue: Math.abs(serverMetric.change),
          icon: config.icon,
          drilldownUrl: config.defaultUrl,
        };
      });
    }

    return propMetrics ?? MOCK_METRICS;
  }, [overviewData?.orgHealth, propMetrics]);

  const overallScore = useMemo(() => calculateOverallScore(metrics), [metrics]);

  return {
    metrics,
    overallScore,
    isEmpty: metrics.length === 0,
  };
}
