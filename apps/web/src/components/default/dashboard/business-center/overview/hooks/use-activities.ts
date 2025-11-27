import { useMemo } from 'react';

import { MOCK_ACTIVITIES } from '@/components/default/dashboard/business-center/overview/constants/a-mock-data';
import { useOverviewData } from '@/components/default/dashboard/business-center/overview/context/overview-data-context';
import {
  sortByTimestamp,
  dedupeById,
} from '@/components/default/dashboard/business-center/overview/utils/activity';
import {
  transformServerActivities,
  transformRealtimeActivities,
} from '@/components/default/dashboard/business-center/overview/utils/activity-transformers';
import { useRealtimeActivity } from '@/lib/hooks/use-socket';

import type { ActivityItem } from '@/components/default/dashboard/business-center/overview/types';

interface UseActivitiesOptions {
  readonly activities?: readonly ActivityItem[];
}

interface UseActivitiesReturn {
  readonly activities: readonly ActivityItem[];
  readonly realtimeCount: number;
  readonly isConnected: boolean;
  readonly isEmpty: boolean;
}

export function useActivities(options: UseActivitiesOptions = {}): UseActivitiesReturn {
  const { activities: propActivities } = options;
  const overviewData = useOverviewData();
  const { activities: realtimeRaw, isConnected } = useRealtimeActivity();

  const activities = useMemo<readonly ActivityItem[]>(() => {
    // Transform realtime activities
    const realtimeItems = transformRealtimeActivities(realtimeRaw);

    // Transform server activities (priority: server > props > mock)
    const serverItems = overviewData?.recentActivity
      ? transformServerActivities(overviewData.recentActivity)
      : propActivities
        ? [...propActivities]
        : [...MOCK_ACTIVITIES];

    // Combine, dedupe, and sort
    const combined = [...realtimeItems, ...serverItems];
    const deduped = dedupeById(combined);
    return sortByTimestamp(deduped);
  }, [realtimeRaw, overviewData?.recentActivity, propActivities]);

  return {
    activities,
    realtimeCount: realtimeRaw.length,
    isConnected,
    isEmpty: activities.length === 0,
  };
}
