import type { TaskPriority, TaskStatus, SortOption, FilterOption } from '../types';

export const PRIORITY_ORDER: Readonly<Record<TaskPriority, number>> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

export const PRIORITY_COLORS: Readonly<Record<TaskPriority, string>> = {
  low: 'bg-muted-foreground',
  medium: 'bg-primary',
  high: 'bg-warning',
  critical: 'bg-destructive',
} as const;

export const STATUS_LABELS: Readonly<Record<TaskStatus, string>> = {
  open: 'To Do',
  in_progress: 'In Progress',
  pending_client: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
} as const;

export const SORT_OPTIONS_CONFIG: readonly {
  readonly value: SortOption;
  readonly label: string;
}[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'points', label: 'Points' },
] as const;

export const FILTER_OPTIONS_CONFIG: readonly {
  readonly value: FilterOption;
  readonly label: string;
}[] = [
  { value: 'all', label: 'All Tasks' },
  { value: 'high_priority', label: 'High Priority' },
  { value: 'due_today', label: 'Due Today' },
  { value: 'blocked', label: 'Blocked' },
] as const;

export const HIGH_PRIORITIES: readonly TaskPriority[] = ['critical', 'high'] as const;

export const TASK_DETAIL_URL_BASE = '/dashboard/business-center/intake';
export const ALL_TASKS_URL = '/dashboard/business-center/work';
