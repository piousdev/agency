import { PRIORITY_ORDER } from '@/components/dashboard/business-center/overview/constants/task-config';
import { getNumericValue } from '@/components/dashboard/business-center/overview/utils/task';
import type { TaskItem, SortOption } from '@/components/dashboard/business-center/overview/types';

type TaskSorter = (a: TaskItem, b: TaskItem) => number;

/**
 * Sorts tasks by due date (earliest first, null last).
 */
export function sortByDueDate(a: TaskItem, b: TaskItem): number {
  if (!a.dueAt && !b.dueAt) return 0;
  if (!a.dueAt) return 1;
  if (!b.dueAt) return -1;
  return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
}

/**
 * Sorts tasks by priority (highest first).
 */
export function sortByPriority(a: TaskItem, b: TaskItem): number {
  return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
}

/**
 * Sorts tasks by story points (highest first).
 */
export function sortByPoints(a: TaskItem, b: TaskItem): number {
  return getNumericValue(b.storyPoints) - getNumericValue(a.storyPoints);
}

const SORTER_MAP: Readonly<Record<SortOption, TaskSorter>> = {
  due_date: sortByDueDate,
  priority: sortByPriority,
  points: sortByPoints,
} as const;

/**
 * Gets the appropriate sorter function for a sort option.
 */
export function getSorter(sortOption: SortOption): TaskSorter {
  return SORTER_MAP[sortOption];
}

/**
 * Sorts tasks by the given option.
 */
export function sortTasks(tasks: readonly TaskItem[], sortOption: SortOption): TaskItem[] {
  const sorter = getSorter(sortOption);
  return [...tasks].sort(sorter);
}
