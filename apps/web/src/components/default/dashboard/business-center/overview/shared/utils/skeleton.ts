/**
 * Widget Skeleton Utilities
 * Pure utility functions for skeleton generation and configuration
 */

import { WidgetSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton';
import { BlockersSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/blockers';
import { CommunicationHubSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/communication-hub';
import { CriticalAlertsSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/critical-alert';
import { CurrentSprintSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/current-sprint';
import { FinancialSnapshotSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/financial-snapshot';
import { MyWorkTodaySkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/my-work-day';
import { OrganizationHealthSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/organisation-health';
import { RecentActivitySkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/recent-activity';
import { RiskIndicatorsSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/risk-indicators';
import { TeamStatusSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/team-status';
import { UpcomingDeadlinesSkeleton } from '@/components/default/dashboard/business-center/overview/shared/components/widget-skeleton/upcoming-deadline';
import { ANIMATION_DEFAULTS } from '@/components/default/dashboard/business-center/overview/shared/constants/skeleton';
import {
  WIDGET_TYPES,
  type WidgetSkeletonMap,
  type WidgetType,
  type SkeletonComponent, type AnimationConfig 
} from '@/components/default/dashboard/business-center/overview/shared/type';

/**
 * Generates animation delay for staggered loading effect
 * @param index - Item index in sequence
 * @param delayMs - Delay multiplier in milliseconds
 * @returns CSS style object with animation delay
 */
export const getStaggeredDelay = (
  index: number,
  delayMs: number = ANIMATION_DEFAULTS.STAGGER_DELAY
): Readonly<{ animationDelay: string }> =>
  ({
    animationDelay: `${String(index * delayMs)}ms`,
  }) as const;

/**
 * Generates animation configuration for skeleton items
 * @param index - Item index
 * @param config - Optional animation configuration
 * @returns Complete animation config
 */
export const getAnimationConfig = (
  index: number,
  config?: Partial<AnimationConfig>
): Readonly<AnimationConfig> =>
  ({
    delay: config?.delay ?? ANIMATION_DEFAULTS.STAGGER_DELAY,
    duration: config?.duration ?? ANIMATION_DEFAULTS.FADE_DURATION,
  }) as const;

/**
 * Creates a range array for skeleton row generation
 * @param length - Number of items to generate
 * @returns Readonly array of indices
 */
export const createSkeletonRange = (length: number): readonly number[] =>
  Object.freeze(Array.from({ length }, (_, i) => i));

/**
 * Combines CSS classes safely
 * @param classes - Array of class strings
 * @returns Combined class string
 */
export const combineClasses = (...classes: readonly (string | undefined)[]): string =>
  classes.filter(Boolean).join(' ');

/**
 * Generates unique key for skeleton items
 * @param prefix - Key prefix
 * @param index - Item index
 * @returns Unique key string
 */
export const generateSkeletonKey = (prefix: string, index: number): string =>
  `${prefix}-skeleton-${String(index)}`;

/**
 * Immutable map of widget types to their skeleton components
 * Using const assertion for deep immutability at compile-time
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
 */
export const widgetSkeletonMap: WidgetSkeletonMap = Object.freeze({
  [WIDGET_TYPES.MY_WORK_TODAY]: MyWorkTodaySkeleton,
  [WIDGET_TYPES.CURRENT_SPRINT]: CurrentSprintSkeleton,
  [WIDGET_TYPES.ORGANIZATION_HEALTH]: OrganizationHealthSkeleton,
  [WIDGET_TYPES.TEAM_STATUS]: TeamStatusSkeleton,
  [WIDGET_TYPES.UPCOMING_DEADLINES]: UpcomingDeadlinesSkeleton,
  [WIDGET_TYPES.RECENT_ACTIVITY]: RecentActivitySkeleton,
  [WIDGET_TYPES.BLOCKERS]: BlockersSkeleton,
  [WIDGET_TYPES.FINANCIAL_SNAPSHOT]: FinancialSnapshotSkeleton,
  [WIDGET_TYPES.RISK_INDICATORS]: RiskIndicatorsSkeleton,
  [WIDGET_TYPES.CRITICAL_ALERTS]: CriticalAlertsSkeleton,
  [WIDGET_TYPES.COMMUNICATION_HUB]: CommunicationHubSkeleton,
} as const);

/**
 * Get the appropriate skeleton component for a widget type
 * Provides type-safe access to skeleton components with fallback
 *
 * @param type - Widget type identifier
 * @returns Skeleton component for the widget type
 *
 * @example
 * ```tsx
 * const Skeleton = getWidgetSkeleton('my-work-today');
 * return <Skeleton className="custom-class" />;
 * ```
 */
export function getWidgetSkeleton(type: string): SkeletonComponent {
  // Type guard for valid widget types
  const isValidWidgetType = (t: string): t is WidgetType =>
    Object.values(WIDGET_TYPES).includes(t as WidgetType);

  return isValidWidgetType(type) ? widgetSkeletonMap[type] : WidgetSkeleton;
}
