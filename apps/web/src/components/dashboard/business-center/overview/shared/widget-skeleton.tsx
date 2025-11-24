'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface WidgetSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  rows?: number;
}

/**
 * Base skeleton loading state for dashboard widgets
 * Features shimmer animation and configurable layout
 */
export function WidgetSkeleton({
  className,
  showHeader = true,
  showFooter = true,
  rows = 3,
}: WidgetSkeletonProps) {
  return (
    <div
      className={cn('flex flex-col h-full', className)}
      role="status"
      aria-label="Loading widget content"
    >
      {/* Header Skeleton */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      )}

      {/* Content Skeleton */}
      <div className="flex-1 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      {showFooter && (
        <div className="pt-3 mt-auto border-t">
          <Skeleton className="h-8 w-full rounded" />
        </div>
      )}

      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Grid skeleton for multiple widgets loading together
 * Implements staggered loading appearance
 */
export function WidgetGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card border rounded-lg p-4 h-64 animate-in fade-in duration-500 fill-mode-both"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <WidgetSkeleton />
        </div>
      ))}
    </div>
  );
}

/**
 * Quick Actions skeleton - Grid of action buttons
 */
export function QuickActionsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-2', className)} role="status">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-in fade-in duration-300 fill-mode-both"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ))}
      <span className="sr-only">Loading quick actions...</span>
    </div>
  );
}

/**
 * My Work Today skeleton - Task list items
 */
export function MyWorkTodaySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-4/5" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading tasks...</span>
    </div>
  );
}

/**
 * Current Sprint skeleton - Progress bar + burndown chart
 */
export function CurrentSprintSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Sprint header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Progress bar */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-2 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>

      {/* Burndown chart placeholder */}
      <div className="flex-1 min-h-[120px]">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
      <span className="sr-only">Loading sprint data...</span>
    </div>
  );
}

/**
 * Organization Health skeleton - Metric cards
 */
export function OrganizationHealthSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Health score */}
      <div className="flex items-center justify-center mb-4">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-2 w-full mt-2 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading organization health...</span>
    </div>
  );
}

/**
 * Team Status skeleton - Team member cards
 */
export function TeamStatusSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Summary */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Team member list */}
      <div className="flex-1 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-12 mb-1" />
              <Skeleton className="h-2 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading team status...</span>
    </div>
  );
}

/**
 * Upcoming Deadlines skeleton - Timeline items
 */
export function UpcomingDeadlinesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Time filter */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>

      {/* Deadline items */}
      <div className="flex-1 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="flex flex-col items-center">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-full w-0.5 mt-1" />
            </div>
            <div className="flex-1 pb-3">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading deadlines...</span>
    </div>
  );
}

/**
 * Recent Activity skeleton - Activity feed items
 */
export function RecentActivitySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-md flex-shrink-0" />
        ))}
      </div>

      {/* Activity list */}
      <div className="flex-1 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full mb-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading activity...</span>
    </div>
  );
}

/**
 * Blockers skeleton - Blocker items
 */
export function BlockersSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Summary */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full ml-auto" />
      </div>

      {/* Blocker list */}
      <div className="flex-1 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted/30 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/2 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading blockers...</span>
    </div>
  );
}

/**
 * Financial Snapshot skeleton - Financial metrics
 */
export function FinancialSnapshotSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Budget progress */}
      <div className="p-3 rounded-lg bg-muted/30">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading financial data...</span>
    </div>
  );
}

/**
 * Risk Indicators skeleton - Risk items
 */
export function RiskIndicatorsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-1.5 ml-auto">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      {/* Risk list */}
      <div className="flex-1 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted/30 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-3/4 mb-2" />
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading risk data...</span>
    </div>
  );
}

/**
 * Critical Alerts skeleton - Alert items
 */
export function CriticalAlertsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted/30 border-l-4 border-l-muted animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <Skeleton className="h-4 w-4 rounded mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading alerts...</span>
    </div>
  );
}

/**
 * Communication Hub skeleton - Messages and mentions
 */
export function CommunicationHubSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full', className)} role="status">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          <Skeleton className="h-7 w-14 rounded" />
          <Skeleton className="h-7 w-10 rounded" />
          <Skeleton className="h-7 w-10 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded" />
      </div>

      {/* Notification list */}
      <div className="flex-1 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border bg-muted/30 animate-in fade-in duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Skeleton className="h-8 w-full rounded" />
      </div>
      <span className="sr-only">Loading messages...</span>
    </div>
  );
}

/**
 * Map of widget types to their skeleton components
 */
export const widgetSkeletonMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'quick-actions': QuickActionsSkeleton,
  'my-work-today': MyWorkTodaySkeleton,
  'current-sprint': CurrentSprintSkeleton,
  'organization-health': OrganizationHealthSkeleton,
  'team-status': TeamStatusSkeleton,
  'upcoming-deadlines': UpcomingDeadlinesSkeleton,
  'recent-activity': RecentActivitySkeleton,
  blockers: BlockersSkeleton,
  'financial-snapshot': FinancialSnapshotSkeleton,
  'risk-indicators': RiskIndicatorsSkeleton,
  'critical-alerts': CriticalAlertsSkeleton,
  'communication-hub': CommunicationHubSkeleton,
};

/**
 * Get the appropriate skeleton for a widget type
 */
export function getWidgetSkeleton(type: string): React.ComponentType<{ className?: string }> {
  return widgetSkeletonMap[type] || WidgetSkeleton;
}
