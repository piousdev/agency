import { IconClock, IconCheck, IconAlertCircle } from '@tabler/icons-react';

import type { SprintStatConfig, SprintStatus } from '../types';

/**
 * On-track tolerance percentage.
 * Sprint is considered on track if progress is within this % of expected.
 */
export const ON_TRACK_TOLERANCE = 10;

/**
 * Task stat card configurations.
 */
export const SPRINT_STAT_CONFIG: Readonly<Record<SprintStatus, Omit<SprintStatConfig, 'status'>>> =
  {
    todo: {
      label: 'To Do',
      icon: IconClock,
      bgClass: 'bg-muted/50',
      iconClass: 'text-muted-foreground',
    },
    in_progress: {
      label: 'In Progress',
      icon: IconClock,
      bgClass: 'bg-primary/10',
      iconClass: 'text-primary',
    },
    completed: {
      label: 'Done',
      icon: IconCheck,
      bgClass: 'bg-success/10',
      iconClass: 'text-success',
    },
    blocked: {
      label: 'Blocked',
      icon: IconAlertCircle,
      bgClass: 'bg-destructive/10',
      iconClass: 'text-destructive',
    },
  } as const;

/**
 * Trend color classes.
 */
export const TREND_COLORS: Readonly<Record<string, string>> = {
  up: 'text-success',
  down: 'text-destructive',
  stable: 'text-muted-foreground',
} as const;

/**
 * Navigation URLs.
 */
export const SPRINT_URLS = {
  board: '/dashboard/business-center/sprints',
} as const;
