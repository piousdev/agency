'use client';

import { lazy, Suspense, type ComponentType } from 'react';
import {
  WidgetSkeleton,
  QuickActionsSkeleton,
  MyWorkTodaySkeleton,
  CurrentSprintSkeleton,
  OrganizationHealthSkeleton,
  TeamStatusSkeleton,
  UpcomingDeadlinesSkeleton,
  RecentActivitySkeleton,
  BlockersSkeleton,
  FinancialSnapshotSkeleton,
  RiskIndicatorsSkeleton,
  CriticalAlertsSkeleton,
  CommunicationHubSkeleton,
} from '../shared/widget-skeleton';

// Lazy-loaded widget components for code splitting
const LazyQuickActionsGrid = lazy(() =>
  import('./quick-actions').then((mod) => ({ default: mod.QuickActionsGrid }))
);

const LazyMyWorkTodayWidget = lazy(() =>
  import('./my-work-today').then((mod) => ({ default: mod.MyWorkTodayWidget }))
);

const LazyUpcomingDeadlinesWidget = lazy(() =>
  import('./upcoming-deadlines').then((mod) => ({ default: mod.UpcomingDeadlinesWidget }))
);

const LazyRecentActivityWidget = lazy(() =>
  import('./recent-activity').then((mod) => ({ default: mod.RecentActivityWidget }))
);

const LazyCurrentSprintWidget = lazy(() =>
  import('./current-sprint').then((mod) => ({ default: mod.CurrentSprintWidget }))
);

const LazyOrganizationHealthWidget = lazy(() =>
  import('./organization-health').then((mod) => ({ default: mod.OrganizationHealthWidget }))
);

const LazyTeamStatusWidget = lazy(() =>
  import('./team-status').then((mod) => ({ default: mod.TeamStatusWidget }))
);

const LazyBlockersWidget = lazy(() =>
  import('./blockers').then((mod) => ({ default: mod.BlockersWidget }))
);

const LazyFinancialSnapshotWidget = lazy(() =>
  import('./financial-snapshot').then((mod) => ({ default: mod.FinancialSnapshotWidget }))
);

const LazyRiskIndicatorsWidget = lazy(() =>
  import('./risk-indicators').then((mod) => ({ default: mod.RiskIndicatorsWidget }))
);

const LazyCriticalAlertsWidget = lazy(() =>
  import('./critical-alerts').then((mod) => ({ default: mod.CriticalAlertsWidget }))
);

const LazyCommunicationHubWidget = lazy(() =>
  import('./communication-hub').then((mod) => ({ default: mod.CommunicationHubWidget }))
);

/**
 * Higher-order component that wraps a lazy widget with Suspense
 */
function withSuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  FallbackComponent: ComponentType<{ className?: string }>
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Widget components with Suspense boundaries
export const SuspenseQuickActionsGrid = withSuspense(LazyQuickActionsGrid, QuickActionsSkeleton);
export const SuspenseMyWorkTodayWidget = withSuspense(LazyMyWorkTodayWidget, MyWorkTodaySkeleton);
export const SuspenseUpcomingDeadlinesWidget = withSuspense(
  LazyUpcomingDeadlinesWidget,
  UpcomingDeadlinesSkeleton
);
export const SuspenseRecentActivityWidget = withSuspense(
  LazyRecentActivityWidget,
  RecentActivitySkeleton
);
export const SuspenseCurrentSprintWidget = withSuspense(
  LazyCurrentSprintWidget,
  CurrentSprintSkeleton
);
export const SuspenseOrganizationHealthWidget = withSuspense(
  LazyOrganizationHealthWidget,
  OrganizationHealthSkeleton
);
export const SuspenseTeamStatusWidget = withSuspense(LazyTeamStatusWidget, TeamStatusSkeleton);
export const SuspenseBlockersWidget = withSuspense(LazyBlockersWidget, BlockersSkeleton);
export const SuspenseFinancialSnapshotWidget = withSuspense(
  LazyFinancialSnapshotWidget,
  FinancialSnapshotSkeleton
);
export const SuspenseRiskIndicatorsWidget = withSuspense(
  LazyRiskIndicatorsWidget,
  RiskIndicatorsSkeleton
);
export const SuspenseCriticalAlertsWidget = withSuspense(
  LazyCriticalAlertsWidget,
  CriticalAlertsSkeleton
);
export const SuspenseCommunicationHubWidget = withSuspense(
  LazyCommunicationHubWidget,
  CommunicationHubSkeleton
);

/**
 * Map of widget types to their lazy-loaded Suspense-wrapped components
 */
export const lazyWidgetMap: Record<string, ComponentType> = {
  'quick-actions': SuspenseQuickActionsGrid,
  'my-work-today': SuspenseMyWorkTodayWidget,
  'upcoming-deadlines': SuspenseUpcomingDeadlinesWidget,
  'recent-activity': SuspenseRecentActivityWidget,
  'current-sprint': SuspenseCurrentSprintWidget,
  'organization-health': SuspenseOrganizationHealthWidget,
  'team-status': SuspenseTeamStatusWidget,
  blockers: SuspenseBlockersWidget,
  'financial-snapshot': SuspenseFinancialSnapshotWidget,
  'risk-indicators': SuspenseRiskIndicatorsWidget,
  'critical-alerts': SuspenseCriticalAlertsWidget,
  'communication-hub': SuspenseCommunicationHubWidget,
};

/**
 * Get the lazy-loaded widget component for a given type
 * Falls back to a generic skeleton wrapper for unknown types
 */
export function getLazyWidget(type: string): ComponentType {
  const Widget = lazyWidgetMap[type];
  if (Widget) return Widget;

  // Return a placeholder for unknown widget types
  return function UnknownWidget() {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <p className="text-sm">{type}</p>
        <p className="text-xs">Widget coming soon</p>
      </div>
    );
  };
}

/**
 * Render a lazy-loaded widget by type
 * Uses Suspense with appropriate skeleton fallback
 */
export function LazyWidgetContent({ type }: { type: string }) {
  const Widget = getLazyWidget(type);
  return <Widget />;
}
