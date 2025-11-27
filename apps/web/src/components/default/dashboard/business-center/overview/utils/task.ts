import { TASK_DETAIL_URL_BASE } from '@/components/default/dashboard/business-center/overview/constants/task-config';

/**
 * Checks if a task is overdue.
 */
export function isOverdue(dueAt: string | null | undefined): boolean {
  if (!dueAt) return false;
  return new Date(dueAt) < new Date();
}

/**
 * Checks if a date is today.
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Formats due time to a relative string.
 */
export function formatDueTime(dueAt: string | null | undefined): string | null {
  if (!dueAt) return null;

  const date = new Date(dueAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return 'Overdue';
  if (diffHours === 0) return 'Due now';
  if (diffHours < 24) return `${String(diffHours)}h`;

  return `${String(Math.round(diffHours / 24))}d`;
}

/**
 * Builds task detail URL from task ID.
 */
export function getTaskUrl(taskId: string): string {
  return `${TASK_DETAIL_URL_BASE}/${encodeURIComponent(taskId)}`;
}

/**
 * Safely gets a numeric value with fallback.
 */
export function getNumericValue(value: number | null | undefined, fallback = 0): number {
  return value ?? fallback;
}
