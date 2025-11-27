import { useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the Business Center dashboard
 * Shows while server data is being fetched
 *
 * Note: Individual widget skeletons are handled by Suspense boundaries
 * in the widget registry. This only shows the page header skeleton.
 *
 * @returns {React.ReactElement} The loading skeleton component for the Business Center dashboard.
 */
export default function BusinessCenterLoading(): React.ReactElement {
  const skeletonIds = useMemo(
    () => Array.from({ length: 6 }, (_, i) => `skeleton-${String(i)}`),
    []
  );

  return (
    <div
      className={[
        'flex flex-col',
        'h-[calc(100vh-var(--header-height)-2rem)]',
        'animate-in',
        'fade-in',
        'duration-300',
      ].join(' ')}
    >
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

      {/* Widget grid placeholder - actual widget skeletons handled by Suspense */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonIds.map((id) => (
          <Skeleton key={id} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
