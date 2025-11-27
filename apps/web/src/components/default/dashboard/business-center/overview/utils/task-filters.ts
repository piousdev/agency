import { HIGH_PRIORITIES } from '@/components/default/dashboard/business-center/overview/constants/task-config';
import { isToday } from '@/components/default/dashboard/business-center/overview/utils/task';

import type {
  TaskItem,
  FilterOption,
} from '@/components/default/dashboard/business-center/overview/types';

type TaskFilter = (task: TaskItem) => boolean;

/**
 * Filter: all tasks (no filtering).
 */
export function filterAll(): boolean {
  return true;
}

/**
 * Filter: high priority tasks only.
 */
export function filterHighPriority(task: TaskItem): boolean {
  return HIGH_PRIORITIES.includes(task.priority);
}

/**
 * Filter: tasks due today.
 */
export function filterDueToday(task: TaskItem): boolean {
  if (!task.dueAt) return false;
  return isToday(task.dueAt);
}

/**
 * Filter: blocked tasks.
 */
export function filterBlocked(task: TaskItem): boolean {
  return task.isBlocked === true;
}

const FILTER_MAP: Readonly<Record<FilterOption, TaskFilter>> = {
  all: filterAll,
  high_priority: filterHighPriority,
  due_today: filterDueToday,
  blocked: filterBlocked,
} as const;

/**
 * Gets the appropriate filter function for a filter option.
 */
export function getFilter(filterOption: FilterOption): TaskFilter {
  return FILTER_MAP[filterOption];
}

/**
 * Filters tasks by the given option.
 */
export function filterTasks(tasks: readonly TaskItem[], filterOption: FilterOption): TaskItem[] {
  const filter = getFilter(filterOption);
  return tasks.filter(filter);
}
