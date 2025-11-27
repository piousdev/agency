import { useState, useMemo, useCallback } from 'react';

import { CATEGORY_TYPE_MAPPING } from '@/components/default/dashboard/business-center/overview/constants/activity-config';
import {
  isValidFilterCategory,
  type ActivityItem,
  type FilterCategory,
} from '@/components/default/dashboard/business-center/overview/types';

interface UseActivityFilterOptions {
  readonly activities: readonly ActivityItem[];
}

interface UseActivityFilterReturn {
  readonly filterBy: FilterCategory;
  readonly setFilterBy: (category: FilterCategory) => void;
  readonly filteredActivities: readonly ActivityItem[];
  readonly filteredCount: number;
  readonly isFiltered: boolean;
}

export function useActivityFilter({
  activities,
}: UseActivityFilterOptions): UseActivityFilterReturn {
  const [filterBy, setFilterByInternal] = useState<FilterCategory>('all');

  const setFilterBy = useCallback((value: string) => {
    if (isValidFilterCategory(value)) {
      setFilterByInternal(value);
    }
  }, []);

  const filteredActivities = useMemo(() => {
    if (filterBy === 'all') return activities;

    const allowedTypes = CATEGORY_TYPE_MAPPING[filterBy];
    return activities.filter((activity) =>
      allowedTypes.includes(activity.type as (typeof allowedTypes)[number])
    );
  }, [activities, filterBy]);

  return {
    filterBy,
    setFilterBy,
    filteredActivities,
    filteredCount: filteredActivities.length,
    isFiltered: filterBy !== 'all',
  };
}
