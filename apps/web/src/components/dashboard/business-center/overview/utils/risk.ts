import {
  CATEGORY_CONFIG,
  FALLBACK_CATEGORY_ICON,
} from '@/components/dashboard/business-center/overview/constants/risk-config';
import {
  isValidRiskCategory,
  isValidRiskSeverity,
  type RiskCategory,
  type RiskIndicator,
  type RiskSeverity,
  type RiskSummary,
} from '@/components/dashboard/business-center/overview/types';

/**
 * Gets the icon component for a risk category with fallback.
 */
export function getCategoryIcon(category: string) {
  if (isValidRiskCategory(category)) {
    return CATEGORY_CONFIG[category].icon;
  }
  return FALLBACK_CATEGORY_ICON;
}

/**
 * Normalizes severity with validation and fallback.
 */
export function normalizeSeverity(severity: unknown): RiskSeverity {
  if (isValidRiskSeverity(severity)) return severity;
  console.warn(`Unknown risk severity: ${severity}, defaulting to 'low'`);
  return 'low';
}

/**
 * Normalizes category with validation and fallback.
 */
export function normalizeCategory(category: unknown): RiskCategory {
  if (isValidRiskCategory(category)) return category;
  console.warn(`Unknown risk category: ${category}, defaulting to 'scope'`);
  return 'scope';
}

/**
 * Calculates risk counts by severity from a list of risks.
 */
export function calculateRiskCounts(
  risks: readonly RiskIndicator[]
): Pick<RiskSummary, 'total' | 'critical' | 'high' | 'medium' | 'low'> {
  return {
    total: risks.length,
    critical: risks.filter((r) => r.severity === 'critical').length,
    high: risks.filter((r) => r.severity === 'high').length,
    medium: risks.filter((r) => r.severity === 'medium').length,
    low: risks.filter((r) => r.severity === 'low').length,
  };
}

/**
 * Sorts risks by severity (critical first).
 */
export function sortRisksBySeverity(risks: readonly RiskIndicator[]): readonly RiskIndicator[] {
  const severityOrder: Record<RiskSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...risks].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Builds project URL from project ID.
 */
export function getProjectUrl(projectId: string): string {
  return `/dashboard/business-center/projects/${encodeURIComponent(projectId)}`;
}
