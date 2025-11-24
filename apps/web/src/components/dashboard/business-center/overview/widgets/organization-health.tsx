'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconUsers,
  IconFolder,
  IconReceipt,
  IconClockHour4,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';

// Icon mapping from string to component
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  IconUsers,
  IconFolder,
  IconReceipt,
  IconClockHour4,
};

interface HealthMetric {
  id?: string;
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: React.ComponentType<{ className?: string }>;
  drilldownUrl?: string;
}

// Drilldown URL mapping
const DRILLDOWN_URLS: Record<string, string> = {
  'team-utilization': '/dashboard/team/capacity',
  'project-health': '/dashboard/business-center/projects',
  'revenue-target': '/dashboard/analytics/revenue',
  'on-time-delivery': '/dashboard/analytics/delivery',
  'open-tickets': '/dashboard/business-center/intake-queue',
  'resolved-today': '/dashboard/business-center/intake-queue?status=resolved',
  'critical-issues': '/dashboard/business-center/intake-queue?priority=critical',
};

// Mock data
const MOCK_METRICS: HealthMetric[] = [
  {
    id: 'team-utilization',
    label: 'Team Utilization',
    value: 78,
    target: 80,
    trend: 'up',
    trendValue: 5,
    icon: IconUsers,
    drilldownUrl: DRILLDOWN_URLS['team-utilization'],
  },
  {
    id: 'project-health',
    label: 'Project Health',
    value: 85,
    target: 90,
    trend: 'stable',
    trendValue: 0,
    icon: IconFolder,
    drilldownUrl: DRILLDOWN_URLS['project-health'],
  },
  {
    id: 'revenue-target',
    label: 'Revenue Target',
    value: 92,
    target: 100,
    trend: 'up',
    trendValue: 12,
    icon: IconReceipt,
    drilldownUrl: DRILLDOWN_URLS['revenue-target'],
  },
  {
    id: 'on-time-delivery',
    label: 'On-Time Delivery',
    value: 88,
    target: 95,
    trend: 'down',
    trendValue: 3,
    icon: IconClockHour4,
    drilldownUrl: DRILLDOWN_URLS['on-time-delivery'],
  },
];

export interface OrganizationHealthWidgetProps {
  metrics?: HealthMetric[];
  className?: string;
}

export function OrganizationHealthWidget({
  metrics: propMetrics,
  className,
}: OrganizationHealthWidgetProps) {
  const overviewData = useOverviewData();

  // Transform server data to widget format if available
  const metrics: HealthMetric[] = overviewData?.orgHealth
    ? overviewData.orgHealth.map((m) => ({
        id: m.id,
        label: m.label,
        value: m.value,
        target: m.value > 0 ? Math.ceil(m.value / 0.85) : 100, // Derive target from value
        trend: m.trend === 'neutral' ? 'stable' : m.trend,
        trendValue: Math.abs(m.change),
        icon:
          m.id === 'open-tickets'
            ? IconFolder
            : m.id === 'resolved-today'
              ? IconClockHour4
              : m.id === 'critical-issues'
                ? IconReceipt
                : IconUsers,
        drilldownUrl: DRILLDOWN_URLS[m.id] || '/dashboard/analytics',
      }))
    : propMetrics || MOCK_METRICS;

  const trendIcons = {
    up: IconTrendingUp,
    down: IconTrendingDown,
    stable: IconMinus,
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    stable: 'text-muted-foreground',
  };

  const getHealthColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 0.95) return 'bg-success';
    if (ratio >= 0.8) return 'bg-warning';
    return 'bg-destructive';
  };

  // Calculate overall health score
  const overallScore = Math.round(
    metrics.reduce((acc, m) => acc + (m.value / m.target) * 100, 0) / metrics.length
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Overall Score */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Overall Health Score</p>
          <p className="text-3xl font-bold">{overallScore}%</p>
        </div>
        <div
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            overallScore >= 90
              ? 'bg-success/20 text-success'
              : overallScore >= 75
                ? 'bg-warning/20 text-warning'
                : 'bg-destructive/20 text-destructive'
          )}
        >
          {overallScore >= 90 ? '!' : overallScore >= 75 ? '~' : '!!'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3 flex-1">
        {metrics.map((metric) => {
          const TrendIcon = trendIcons[metric.trend];
          const Icon = metric.icon;
          const MetricContent = (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{metric.value}%</span>
                  <span className={cn('flex items-center text-xs', trendColors[metric.trend])}>
                    <TrendIcon className="h-3 w-3" />
                    {metric.trendValue > 0 && `${metric.trendValue}%`}
                  </span>
                </div>
              </div>
              <Progress
                value={(metric.value / metric.target) * 100}
                className="h-1.5"
                // @ts-expect-error - custom indicator class
                indicatorClassName={getHealthColor(metric.value, metric.target)}
              />
            </div>
          );

          return metric.drilldownUrl ? (
            <Link
              key={metric.id || metric.label}
              href={metric.drilldownUrl}
              className="block rounded-md p-1 -m-1 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {MetricContent}
            </Link>
          ) : (
            <div key={metric.id || metric.label}>{MetricContent}</div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/analytics">
            View analytics
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
