import {
  IconUsers,
  IconFolder,
  IconReceipt,
  IconClockHour4,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from '@tabler/icons-react';
import type {
  TrendDirection,
  HealthLevel,
  TrendConfig,
  HealthLevelConfig,
  HealthMetricConfig,
} from '../types';

// Known metric IDs for type-safe configuration
export const METRIC_IDS = [
  'team-utilization',
  'project-health',
  'revenue-target',
  'on-time-delivery',
  'open-tickets',
  'resolved-today',
  'critical-issues',
] as const;

export type MetricId = (typeof METRIC_IDS)[number];

export const METRIC_CONFIG: Readonly<Record<MetricId, HealthMetricConfig>> = {
  'team-utilization': {
    icon: IconUsers,
    defaultUrl: '/dashboard/team/capacity',
  },
  'project-health': {
    icon: IconFolder,
    defaultUrl: '/dashboard/business-center/projects',
  },
  'revenue-target': {
    icon: IconReceipt,
    defaultUrl: '/dashboard/analytics/revenue',
  },
  'on-time-delivery': {
    icon: IconClockHour4,
    defaultUrl: '/dashboard/analytics/delivery',
  },
  'open-tickets': {
    icon: IconFolder,
    defaultUrl: '/dashboard/business-center/intake-queue',
  },
  'resolved-today': {
    icon: IconClockHour4,
    defaultUrl: '/dashboard/business-center/intake-queue?status=resolved',
  },
  'critical-issues': {
    icon: IconReceipt,
    defaultUrl: '/dashboard/business-center/intake-queue?priority=critical',
  },
} as const;

export const TREND_CONFIG: Readonly<Record<TrendDirection, TrendConfig>> = {
  up: {
    icon: IconTrendingUp,
    colorClass: 'text-success',
  },
  down: {
    icon: IconTrendingDown,
    colorClass: 'text-destructive',
  },
  stable: {
    icon: IconMinus,
    colorClass: 'text-muted-foreground',
  },
} as const;

export const HEALTH_LEVEL_CONFIG: Readonly<Record<HealthLevel, HealthLevelConfig>> = {
  excellent: {
    threshold: 0.95,
    progressClass: 'bg-success',
    badgeClass: 'bg-success/20 text-success',
    indicator: '✓',
  },
  good: {
    threshold: 0.8,
    progressClass: 'bg-warning',
    badgeClass: 'bg-warning/20 text-warning',
    indicator: '~',
  },
  poor: {
    threshold: 0,
    progressClass: 'bg-destructive',
    badgeClass: 'bg-destructive/20 text-destructive',
    indicator: '!',
  },
} as const;

export const FALLBACK_METRIC_CONFIG: HealthMetricConfig = {
  icon: IconUsers,
  defaultUrl: '/dashboard/analytics',
} as const;

export const DEFAULT_TARGET_RATIO = 0.85;
export const ANALYTICS_URL = '/dashboard/analytics';
