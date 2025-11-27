import { formatDistanceToNow } from 'date-fns';

import {
  ENTITY_ICONS,
  DEFAULT_ENTITY_ICON,
  ALERT_TYPE_CONFIG,
} from '@/components/default/dashboard/business-center/overview/constants/alert-config';

import type {
  AlertType,
  EntityType,
  AlertTypeConfig,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Formats a timestamp to relative time.
 */
export function formatRelativeTime(timestamp: string): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Gets the icon for an entity type with fallback.
 */
export function getEntityIcon(entityType: string) {
  if (entityType in ENTITY_ICONS) {
    return ENTITY_ICONS[entityType as EntityType];
  }
  return DEFAULT_ENTITY_ICON;
}

/**
 * Gets the config for an alert type.
 */
export function getAlertTypeConfig(type: AlertType): AlertTypeConfig {
  return ALERT_TYPE_CONFIG[type];
}

/**
 * Calculates alert counts by type.
 */
export function calculateAlertCounts(
  alerts: readonly { type: AlertType }[]
): {
  total: number;
  critical: number;
  warning: number;
  info: number;
} {
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.type === 'critical').length,
    warning: alerts.filter((a) => a.type === 'warning').length,
    info: alerts.filter((a) => a.type === 'info').length,
  };
}
