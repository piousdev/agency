import {
  HEALTH_LEVEL_CONFIG,
  METRIC_CONFIG,
  FALLBACK_METRIC_CONFIG,
  DEFAULT_TARGET_RATIO,
  type MetricId,
} from '../constants/health-config';

import type { HealthLevel, HealthMetric, HealthMetricConfig } from '../types';

/**
 * Determines health level based on value/target ratio.
 */
export function getHealthLevel(value: number, target: number): HealthLevel {
  if (target <= 0) return 'poor';

  const ratio = value / target;

  if (ratio >= HEALTH_LEVEL_CONFIG.excellent.threshold) return 'excellent';
  if (ratio >= HEALTH_LEVEL_CONFIG.good.threshold) return 'good';
  return 'poor';
}

/**
 * Gets the progress bar color class for a metric.
 */
export function getProgressColorClass(value: number, target: number): string {
  const level = getHealthLevel(value, target);
  return HEALTH_LEVEL_CONFIG[level].progressClass;
}

/**
 * Gets the badge styling for overall score.
 */
export function getScoreBadgeClass(score: number): string {
  if (score >= 90) return HEALTH_LEVEL_CONFIG.excellent.badgeClass;
  if (score >= 75) return HEALTH_LEVEL_CONFIG.good.badgeClass;
  return HEALTH_LEVEL_CONFIG.poor.badgeClass;
}

/**
 * Gets the indicator symbol for overall score.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function getScoreIndicator(score: number): React.ElementType | string {
  if (score >= 90) return HEALTH_LEVEL_CONFIG.excellent.indicator;
  if (score >= 75) return HEALTH_LEVEL_CONFIG.good.indicator;
  return HEALTH_LEVEL_CONFIG.poor.indicator;
}

/**
 * Calculates progress percentage (capped at 100).
 */
export function calculateProgress(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((value / target) * 100, 100);
}

/**
 * Calculates overall health score from metrics.
 */
export function calculateOverallScore(metrics: readonly HealthMetric[]): number {
  if (metrics.length === 0) return 0;

  const totalRatio = metrics.reduce((acc, metric) => {
    if (metric.target <= 0) return acc;
    return acc + (metric.value / metric.target) * 100;
  }, 0);

  return Math.round(totalRatio / metrics.length);
}

/**
 * Gets metric configuration by ID with fallback.
 */
export function getMetricConfig(id: string): HealthMetricConfig {
  if (id in METRIC_CONFIG) {
    return METRIC_CONFIG[id as MetricId];
  }
  return FALLBACK_METRIC_CONFIG;
}

/**
 * Derives target from value using default ratio.
 */
export function deriveTarget(value: number): number {
  if (value <= 0) return 100;
  return Math.ceil(value / DEFAULT_TARGET_RATIO);
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
