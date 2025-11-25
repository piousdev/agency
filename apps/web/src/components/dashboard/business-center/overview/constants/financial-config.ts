import { IconCurrencyDollar, IconReceipt, IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import type {
  BudgetLevel,
  MetricDisplayConfig,
} from '@/components/dashboard/business-center/overview/types';

/**
 * Budget thresholds for visual indicators.
 */
export const BUDGET_THRESHOLDS: Readonly<Record<BudgetLevel, number>> = {
  critical: 90,
  warning: 75,
  normal: 0,
} as const;

/**
 * Progress bar classes for budget levels.
 */
export const BUDGET_PROGRESS_CLASSES: Readonly<Record<BudgetLevel, string>> = {
  critical: '[&>div]:bg-destructive',
  warning: '[&>div]:bg-warning',
  normal: '',
} as const;

/**
 * Budget status messages.
 */
export const BUDGET_STATUS_MESSAGES: Readonly<Record<BudgetLevel, string>> = {
  critical: ' - Budget nearly exhausted',
  warning: ' - Approaching limit',
  normal: '',
} as const;

/**
 * Metric display configurations.
 */
export const METRIC_CONFIG = {
  revenue: {
    icon: IconCurrencyDollar,
    isPositiveGood: true,
  },
  paidThisMonth: {
    icon: IconCheck,
    isPositiveGood: true,
  },
  outstanding: {
    icon: IconReceipt,
    isPositiveGood: false,
  },
  overdue: {
    icon: IconAlertTriangle,
    isPositiveGood: false,
  },
} as const;

/**
 * Default currency configuration.
 */
export const CURRENCY_CONFIG = {
  locale: 'en-US',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const;

/**
 * Navigation URLs.
 */
export const FINANCIAL_URLS = {
  billing: '/dashboard/billing',
  invoices: '/dashboard/billing',
} as const;
