import { IconUsers, IconFolder, IconReceipt, IconClockHour4 } from '@tabler/icons-react';

import { METRIC_CONFIG } from '@/components/default/dashboard/business-center/overview/constants/health-config';

import type { HealthMetric } from '@/components/default/dashboard/business-center/overview/types';

export const MOCK_METRICS: readonly HealthMetric[] = [
  {
    id: 'team-utilization',
    label: 'Team Utilization',
    value: 78,
    target: 80,
    trend: 'up',
    trendValue: 5,
    icon: IconUsers,
    drilldownUrl: METRIC_CONFIG['team-utilization'].defaultUrl,
  },
  {
    id: 'project-health',
    label: 'Project Health',
    value: 85,
    target: 90,
    trend: 'stable',
    trendValue: 0,
    icon: IconFolder,
    drilldownUrl: METRIC_CONFIG['project-health'].defaultUrl,
  },
  {
    id: 'revenue-target',
    label: 'Revenue Target',
    value: 92,
    target: 100,
    trend: 'up',
    trendValue: 12,
    icon: IconReceipt,
    drilldownUrl: METRIC_CONFIG['revenue-target'].defaultUrl,
  },
  {
    id: 'on-time-delivery',
    label: 'On-Time Delivery',
    value: 88,
    target: 95,
    trend: 'down',
    trendValue: 3,
    icon: IconClockHour4,
    drilldownUrl: METRIC_CONFIG['on-time-delivery'].defaultUrl,
  },
] as const;
