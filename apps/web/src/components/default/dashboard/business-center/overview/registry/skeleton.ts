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

import type {
  WidgetType,
  SkeletonComponent,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Maps widget types to their skeleton components.
 * Used for Suspense fallbacks during lazy loading.
 */
export const SKELETON_REGISTRY: Readonly<Record<WidgetType, SkeletonComponent>> = {
  'my-work-today': MyWorkTodaySkeleton,
  'upcoming-deadlines': UpcomingDeadlinesSkeleton,
  'recent-activity': RecentActivitySkeleton,
  'current-sprint': CurrentSprintSkeleton,
  'organization-health': OrganizationHealthSkeleton,
  'team-status': TeamStatusSkeleton,
  blockers: BlockersSkeleton,
  'financial-snapshot': FinancialSnapshotSkeleton,
  'risk-indicators': RiskIndicatorsSkeleton,
  'critical-alerts': CriticalAlertsSkeleton,
  'communication-hub': CommunicationHubSkeleton,
} as const;

/**
 * Gets the skeleton component for a widget type.
 * Falls back to generic skeleton for unknown types.
 */
export function getSkeleton(type: WidgetType): SkeletonComponent {
  if (type in SKELETON_REGISTRY) {
    return SKELETON_REGISTRY[type];
  }
  return WidgetSkeleton;
}
