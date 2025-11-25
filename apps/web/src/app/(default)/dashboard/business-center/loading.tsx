import { Skeleton } from '@/components/ui/skeleton';
import { WidgetGridSkeleton } from '@/components/dashboard/business-center/overview/shared/components/widget-skeleton';

/**
 * Loading skeleton for the Business Center dashboard
 * Shows while server data is being fetched
 */
export default function BusinessCenterLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-2rem)] animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Widget Grid Skeleton */}
      <WidgetGridSkeleton
        widgetTypes={[
          'my-work-today',
          'current-sprint',
          'organization-health',
          'team-status',
          'upcoming-deadlines',
          'recent-activity',
          'blockers',
          'communication-hub',
          'critical-alerts',
          'financial-snapshot',
          'risk-indicators',
          'organization-health',
          'team-status',
          'upcoming-deadlines',
          'recent-activity',
        ]}
      />
    </div>
  );
}
