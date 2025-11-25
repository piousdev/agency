'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  useActivities,
  useActivityFilter,
} from '@/components/dashboard/business-center/overview/hooks';
import { ActivityFilter } from '@/components/dashboard/business-center/overview/components/activity-filter';
import { ConnectionIndicator } from '@/components/dashboard/business-center/overview/components/connection-indicator';
import { ActivityItem } from '@/components/dashboard/business-center/overview/components/activity-item';
import { ActivityEmptyState } from '@/components/dashboard/business-center/overview/components/activity-empty-state';
import { ActivityActions } from '@/components/dashboard/business-center/overview/components/activity-actions';
import type { ActivityItem as ActivityItemType } from '@/components/dashboard/business-center/overview/types';
import { Item, ItemContent } from '@/components/ui/item';

export interface RecentActivityWidgetProps {
  readonly activities?: readonly ActivityItemType[];
  readonly className?: string;
}

export const RecentActivityWidget = ({
  activities: propActivities,
  className,
}: RecentActivityWidgetProps) => {
  const { activities, realtimeCount, isConnected } = useActivities({
    activities: propActivities,
  });

  const { filterBy, setFilterBy, filteredActivities, filteredCount, isFiltered } =
    useActivityFilter({ activities });

  const isEmpty = filteredActivities.length === 0;

  return (
    <div className={cn('flex flex-col h-full p-2', className)}>
      {/* Filter Controls */}
      <Item className="flex items-center gap-2 p-0">
        <ItemContent>
          <ActivityFilter
            value={filterBy}
            onChange={setFilterBy}
            filteredCount={filteredCount}
            showCount={isFiltered}
          />
        </ItemContent>
        <ItemContent>
          <ConnectionIndicator isConnected={isConnected} newCount={realtimeCount} />
        </ItemContent>
      </Item>

      {/* Activity List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {isEmpty ? (
            <ActivityEmptyState isFiltered={isFiltered} />
          ) : (
            filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </ScrollArea>

      <ActivityActions />
    </div>
  );
};
