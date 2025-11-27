import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconExternalLink,
} from '@tabler/icons-react';

import type {
  AlertFilter,
  AlertType,
  EntityType,
  AlertTypeConfig,
  SnoozeOption,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Alert type visual configurations.
 */
export const ALERT_TYPE_CONFIG: Readonly<Record<AlertType, AlertTypeConfig>> = {
  critical: {
    icon: IconAlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    badgeClass: 'text-destructive border-destructive/50',
  },
  warning: {
    icon: IconAlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    badgeClass: 'text-warning border-warning/50',
  },
  info: {
    icon: IconInfoCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    badgeClass: 'text-primary border-primary/50',
  },
} as const;

/**
 * Entity type icon mapping.
 */
export const ENTITY_ICONS: Readonly<Record<EntityType, typeof IconExternalLink>> = {
  project: IconExternalLink,
  ticket: IconExternalLink,
  client: IconExternalLink,
  sprint: IconExternalLink,
  system: IconAlertCircle,
} as const;

/**
 * Default entity icon fallback.
 */
export const DEFAULT_ENTITY_ICON = IconExternalLink;

/**
 * Snooze duration options.
 */
export const SNOOZE_OPTIONS: readonly SnoozeOption[] = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '4 hours', value: 4 * 60 * 60 * 1000 },
  { label: 'Until tomorrow', value: 24 * 60 * 60 * 1000 },
] as const;

/**
 * Filter badge configurations.
 */
export const FILTER_BADGE_CONFIG: Readonly<
  Record<Exclude<AlertFilter, 'all'>, { label: string; type: AlertType }>
> = {
  critical: { label: 'Critical', type: 'critical' },
  warning: { label: 'Warning', type: 'warning' },
  info: { label: 'Info', type: 'info' },
} as const;
