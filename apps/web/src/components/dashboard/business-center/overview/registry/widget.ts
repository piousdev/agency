import { lazy, type ComponentType } from 'react';
import { withSuspense } from '@/components/dashboard/business-center/overview/utils/with-suspense';
import { SKELETON_REGISTRY } from '@/components/dashboard/business-center/overview/registry/skeleton';
import type {
  WidgetType,
  LazyWidgetComponent,
} from '@/components/dashboard/business-center/overview/types';

/**
 * Factory function to create a lazy-loaded widget import.
 * Centralizes the import pattern and reduces boilerplate.
 */
function createLazyWidget(importPath: string, exportName: string): LazyWidgetComponent {
  // Using dynamic import with explicit path for bundler optimization
  const importMap: Record<string, () => Promise<Record<string, ComponentType>>> = {
    'my-work-today': () =>
      import('@/components/dashboard/business-center/overview/widgets/my-work-today'),
    'upcoming-deadlines': () =>
      import('@/components/dashboard/business-center/overview/widgets/upcoming-deadlines'),
    'recent-activity': () =>
      import('@/components/dashboard/business-center/overview/widgets/recent-activity'),
    'current-sprint': () =>
      import('@/components/dashboard/business-center/overview/widgets/current-sprint'),
    'organization-health': () =>
      import('@/components/dashboard/business-center/overview/widgets/organization-health'),
    'team-status': () =>
      import('@/components/dashboard/business-center/overview/widgets/team-status'),
    blockers: () => import('@/components/dashboard/business-center/overview/widgets/blockers'),
    'financial-snapshot': () =>
      import('@/components/dashboard/business-center/overview/widgets/financial-snapshot'),
    'risk-indicators': () =>
      import('@/components/dashboard/business-center/overview/widgets/risk-indicators'),
    'critical-alerts': () =>
      import('@/components/dashboard/business-center/overview/widgets/critical-alerts'),
    'communication-hub': () =>
      import('@/components/dashboard/business-center/overview/widgets/communication-hub'),
  };

  const importFn = importMap[importPath];
  if (!importFn) {
    throw new Error(`Unknown widget path: ${importPath}`);
  }

  return lazy(() =>
    importFn().then((mod) => ({
      default: mod[exportName] as ComponentType,
    }))
  );
}

/**
 * Lazy-loaded widget components.
 * Each widget is loaded on-demand for optimal code splitting.
 */
const LAZY_WIDGETS: Readonly<Record<WidgetType, LazyWidgetComponent>> = {
  'my-work-today': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/my-work-today').then((mod) => ({
      default: mod.MyWorkTodayWidget,
    }))
  ),
  'upcoming-deadlines': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/upcoming-deadlines').then(
      (mod) => ({
        default: mod.UpcomingDeadlinesWidget,
      })
    )
  ),
  'recent-activity': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/recent-activity').then(
      (mod) => ({
        default: mod.RecentActivityWidget,
      })
    )
  ),
  'current-sprint': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/current-sprint').then(
      (mod) => ({
        default: mod.CurrentSprintWidget,
      })
    )
  ),
  'organization-health': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/organization-health').then(
      (mod) => ({
        default: mod.OrganizationHealthWidget,
      })
    )
  ),
  'team-status': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/team-status').then((mod) => ({
      default: mod.TeamStatusWidget,
    }))
  ),
  blockers: lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/blockers').then((mod) => ({
      default: mod.BlockersWidget,
    }))
  ),
  'financial-snapshot': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/financial-snapshot').then(
      (mod) => ({
        default: mod.FinancialSnapshotWidget,
      })
    )
  ),
  'risk-indicators': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/risk-indicators').then(
      (mod) => ({
        default: mod.RiskIndicatorsWidget,
      })
    )
  ),
  'critical-alerts': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/critical-alerts').then(
      (mod) => ({
        default: mod.CriticalAlertsWidget,
      })
    )
  ),
  'communication-hub': lazy(() =>
    import('@/components/dashboard/business-center/overview/widgets/communication-hub').then(
      (mod) => ({
        default: mod.CommunicationHubWidget,
      })
    )
  ),
} as const;

/**
 * Widget display names for React DevTools.
 */
const WIDGET_DISPLAY_NAMES: Readonly<Record<WidgetType, string>> = {
  'my-work-today': 'MyWorkTodayWidget',
  'upcoming-deadlines': 'UpcomingDeadlinesWidget',
  'recent-activity': 'RecentActivityWidget',
  'current-sprint': 'CurrentSprintWidget',
  'organization-health': 'OrganizationHealthWidget',
  'team-status': 'TeamStatusWidget',
  blockers: 'BlockersWidget',
  'financial-snapshot': 'FinancialSnapshotWidget',
  'risk-indicators': 'RiskIndicatorsWidget',
  'critical-alerts': 'CriticalAlertsWidget',
  'communication-hub': 'CommunicationHubWidget',
} as const;

/**
 * Cache for Suspense-wrapped widget components.
 * Prevents recreating HOC wrappers on each render.
 */
const suspenseWidgetCache = new Map<WidgetType, ComponentType>();

/**
 * Gets a Suspense-wrapped widget component for a widget type.
 * Results are cached for performance.
 */
export function getSuspenseWidget(type: WidgetType): ComponentType {
  const cached = suspenseWidgetCache.get(type);
  if (cached) return cached;

  const LazyWidget = LAZY_WIDGETS[type];
  const Skeleton = SKELETON_REGISTRY[type];
  const displayName = WIDGET_DISPLAY_NAMES[type];

  const SuspenseWidget = withSuspense(LazyWidget, Skeleton, { displayName });
  suspenseWidgetCache.set(type, SuspenseWidget);

  return SuspenseWidget;
}

/**
 * Gets all Suspense-wrapped widgets as a record.
 * Useful for iterating over all available widgets.
 */
export function getAllSuspenseWidgets(): Readonly<Record<WidgetType, ComponentType>> {
  const widgets: Record<string, ComponentType> = {};

  for (const type of Object.keys(LAZY_WIDGETS) as WidgetType[]) {
    widgets[type] = getSuspenseWidget(type);
  }

  return widgets as Record<WidgetType, ComponentType>;
}

/**
 * Pre-built map of all Suspense-wrapped widgets.
 * Exported for direct access when needed.
 */
export const SUSPENSE_WIDGET_MAP: Readonly<Record<WidgetType, ComponentType>> =
  getAllSuspenseWidgets();
