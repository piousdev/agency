import { IconExclamationCircle, IconAlertTriangle } from '@tabler/icons-react';

import type {
  BlockerSeverity,
  SeverityConfig,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Severity visual configurations.
 */
export const SEVERITY_CONFIG: Readonly<Record<BlockerSeverity, SeverityConfig>> = {
  critical: {
    icon: IconExclamationCircle,
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    borderClass: 'border-destructive/20',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  high: {
    icon: IconAlertTriangle,
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
    borderClass: 'border-warning/20',
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
  },
  medium: {
    icon: IconAlertTriangle,
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    borderClass: 'border-primary/20',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
} as const;

/**
 * Navigation URLs.
 */
export const BLOCKER_URLS = {
  allBlockers: '/dashboard/issues?filter=blocked',
} as const;

/**
 * Toast messages.
 */
export const TOAST_MESSAGES = {
  escalated: (title: string) => `Escalated: "${title}"`,
  escalatedDescription: (projectName: string) =>
    `This blocker has been escalated to management. Project: ${projectName}`,
  escalationCancelled: 'Escalation cancelled',
  resolved: (title: string) => `Resolved: "${title}"`,
  resolvedDescription: (daysBlocked: number) =>
    `Blocker marked as resolved after ${String(daysBlocked)} days`,
} as const;
