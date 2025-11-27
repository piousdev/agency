import {
  BUDGET_THRESHOLDS,
  BUDGET_PROGRESS_CLASSES,
  BUDGET_STATUS_MESSAGES,
  CURRENCY_CONFIG,
} from '@/components/default/dashboard/business-center/overview/constants/financial-config';

import type {
  BudgetLevel,
  ValueFormat,
  TrendDirection,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Formats a currency value.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits,
  }).format(value);
}

/**
 * Formats a value based on its format type.
 */
export function formatValue(value: number, format: ValueFormat): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return `${String(value)}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}

/**
 * Calculates budget percentage (capped at 100).
 */
export function calculateBudgetPercentage(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((used / total) * 100), 100);
}

/**
 * Determines budget level based on percentage.
 */
export function getBudgetLevel(percentage: number): BudgetLevel {
  if (percentage > BUDGET_THRESHOLDS.critical) return 'critical';
  if (percentage > BUDGET_THRESHOLDS.warning) return 'warning';
  return 'normal';
}

/**
 * Gets the progress bar class for a budget percentage.
 */
export function getBudgetProgressClass(percentage: number): string {
  const level = getBudgetLevel(percentage);
  return BUDGET_PROGRESS_CLASSES[level];
}

/**
 * Gets the status message for a budget percentage.
 */
export function getBudgetStatusMessage(percentage: number): string {
  const level = getBudgetLevel(percentage);
  return BUDGET_STATUS_MESSAGES[level];
}

/**
 * Determines trend color based on whether positive is good.
 */
export function getTrendColorClass(trend: TrendDirection, isPositiveGood: boolean): string {
  if (trend === 'neutral') return 'text-muted-foreground';

  const isPositive = trend === 'up';
  const isGood = isPositiveGood ? isPositive : !isPositive;

  return isGood ? 'text-success' : 'text-destructive';
}

/**
 * Formats change value with sign.
 */
export function formatChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${String(change)}%`;
}
