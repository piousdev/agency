import { ON_TRACK_TOLERANCE } from '@/components/dashboard/business-center/overview/constants/sprint-config';
import type {
  SprintData,
  TrendDirection,
} from '@/components/dashboard/business-center/overview/types';

/**
 * Calculates sprint progress percentage.
 */
export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Calculates todo tasks count.
 */
export function calculateTodoTasks(sprint: SprintData): number {
  return Math.max(
    0,
    sprint.totalTasks - sprint.completedTasks - sprint.inProgressTasks - sprint.blockedTasks
  );
}

/**
 * Calculates total sprint days.
 */
export function calculateTotalDays(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates elapsed days in sprint.
 */
export function calculateElapsedDays(totalDays: number, daysRemaining: number): number {
  return Math.max(0, totalDays - daysRemaining);
}

/**
 * Calculates expected progress based on elapsed time.
 */
export function calculateExpectedProgress(elapsedDays: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return (elapsedDays / totalDays) * 100;
}

/**
 * Determines if sprint is on track.
 */
export function isSprintOnTrack(sprint: SprintData, progress: number): boolean {
  const totalDays = calculateTotalDays(sprint.startDate, sprint.endDate);
  if (totalDays <= 0) return true;

  const elapsedDays = calculateElapsedDays(totalDays, sprint.daysRemaining);
  const expectedProgress = calculateExpectedProgress(elapsedDays, totalDays);

  return progress >= expectedProgress - ON_TRACK_TOLERANCE;
}

/**
 * Gets trend direction from velocity comparison.
 */
export function getVelocityTrend(
  current: number | undefined,
  previous: number | undefined
): TrendDirection {
  if (current === undefined || previous === undefined) return 'stable';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

/**
 * Calculates velocity change.
 */
export function calculateVelocityChange(
  current: number | undefined,
  previous: number | undefined
): number {
  if (current === undefined || previous === undefined) return 0;
  return current - previous;
}

/**
 * Formats velocity change with sign.
 */
export function formatVelocityChange(change: number): string {
  if (change === 0) return '0';
  return change > 0 ? `+${change}` : `${change}`;
}

/**
 * Gets remaining work from burndown data.
 */
export function getRemainingWork(burndownData: readonly { value: number }[] | undefined): number {
  if (!burndownData || burndownData.length === 0) return 0;
  return burndownData[burndownData.length - 1]?.value ?? 0;
}
