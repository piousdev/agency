import { useState, useMemo, useCallback } from 'react';

import {
  isValidSortOption,
  isValidFilterOption,
  type TaskItem,
  type SortOption,
  type FilterOption,
} from '@/components/default/dashboard/business-center/overview/types';
import { filterTasks } from '@/components/default/dashboard/business-center/overview/utils/task-filters';
import { sortTasks } from '@/components/default/dashboard/business-center/overview/utils/task-sorters';

interface UseTaskFiltersOptions {
  readonly tasks: readonly TaskItem[];
  readonly defaultSort?: SortOption;
  readonly defaultFilter?: FilterOption;
}

interface UseTaskFiltersReturn {
  readonly sortBy: SortOption;
  readonly filterBy: FilterOption;
  readonly setSortBy: (value: string) => void;
  readonly setFilterBy: (value: string) => void;
  readonly filteredTasks: readonly TaskItem[];
  readonly filteredCount: number;
  readonly isFiltered: boolean;
  readonly isEmpty: boolean;
}

export function useTaskFilters({
  tasks,
  defaultSort = 'due_date',
  defaultFilter = 'all',
}: UseTaskFiltersOptions): UseTaskFiltersReturn {
  const [sortBy, setSortByInternal] = useState<SortOption>(defaultSort);
  const [filterBy, setFilterByInternal] = useState<FilterOption>(defaultFilter);

  const setSortBy = useCallback((value: string) => {
    if (isValidSortOption(value)) {
      setSortByInternal(value);
    }
  }, []);

  const setFilterBy = useCallback((value: string) => {
    if (isValidFilterOption(value)) {
      setFilterByInternal(value);
    }
  }, []);

  const filteredTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filterBy);
    return sortTasks(filtered, sortBy);
  }, [tasks, filterBy, sortBy]);

  return {
    sortBy,
    filterBy,
    setSortBy,
    setFilterBy,
    filteredTasks,
    filteredCount: filteredTasks.length,
    isFiltered: filterBy !== 'all',
    isEmpty: filteredTasks.length === 0,
  };
}
