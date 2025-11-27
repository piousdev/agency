import { SEVERITY_CONFIG } from '@/components/default/dashboard/business-center/overview/constants/blocker-config';

import type {
  BlockerItem,
  BlockerSeverity,
  SeverityConfig,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Gets severity configuration.
 */
export function getSeverityConfig(severity: BlockerSeverity): SeverityConfig {
  return SEVERITY_CONFIG[severity];
}

/**
 * Formats days blocked as display string.
 */
export function formatDaysBlocked(days: number): string {
  return `${String(days)}d`;
}

/**
 * Sorts blockers by severity (critical first) then by days blocked.
 */
export function sortBlockersBySeverity(blockers: readonly BlockerItem[]): BlockerItem[] {
  const severityOrder: Record<BlockerSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
  };

  return [...blockers].sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.daysBlocked - a.daysBlocked;
  });
}
