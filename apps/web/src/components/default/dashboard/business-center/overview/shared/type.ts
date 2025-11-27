// Widget Skeleton
/**
 * Widget Skeleton Types
 * Immutable type definitions with strict readonly constraints
 * @see https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties
 */

import type { ComponentType } from 'react';

/**
 * Base props for all skeleton components
 * Uses Readonly utility type for compile-time immutability
 */
export type BaseSkeletonProps = Readonly<{
  className?: string;
}>;

/**
 * Widget skeleton configuration with readonly properties
 */
export type WidgetSkeletonConfig = Readonly<{
  showHeader?: boolean;
  showFooter?: boolean;
  rows?: number;
}>;

/**
 * Extended widget skeleton props combining base and config
 */
export type WidgetSkeletonProps = BaseSkeletonProps & WidgetSkeletonConfig;

/**
 * Grid skeleton configuration
 */
export type WidgetGridSkeletonProps = Readonly<{
  count?: number;
  widgetTypes?: readonly WidgetType[];
}>;

/**
 * Widget type identifiers as const for type narrowing
 */
export const WIDGET_TYPES = {
  MY_WORK_TODAY: 'my-work-today',
  CURRENT_SPRINT: 'current-sprint',
  ORGANIZATION_HEALTH: 'organization-health',
  TEAM_STATUS: 'team-status',
  UPCOMING_DEADLINES: 'upcoming-deadlines',
  RECENT_ACTIVITY: 'recent-activity',
  BLOCKERS: 'blockers',
  FINANCIAL_SNAPSHOT: 'financial-snapshot',
  RISK_INDICATORS: 'risk-indicators',
  CRITICAL_ALERTS: 'critical-alerts',
  COMMUNICATION_HUB: 'communication-hub',
} as const;

/**
 * Union type of all widget type values
 */
export type WidgetType = (typeof WIDGET_TYPES)[keyof typeof WIDGET_TYPES];

/**
 * Skeleton component type with strict props constraint
 */
export type SkeletonComponent = ComponentType<BaseSkeletonProps>;

/**
 * Immutable map of widget types to their skeleton components
 */
export type WidgetSkeletonMap = Readonly<Record<WidgetType, SkeletonComponent>>;

/**
 * Animation configuration for staggered loading
 */
export type AnimationConfig = Readonly<{
  delay: number;
  duration: number;
}>;

/**
 * Skeleton row configuration
 */
export type SkeletonRowConfig = Readonly<{
  height: string;
  width: string;
  rounded?: string;
}>;
