import {
  IconClock,
  IconCurrencyDollar,
  IconTarget,
  IconUsers,
  IconShieldCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import type { RiskSeverity, RiskCategory, RiskSeverityConfig, RiskCategoryConfig } from '../types';

export const SEVERITY_CONFIG: Readonly<Record<RiskSeverity, RiskSeverityConfig>> = {
  critical: {
    badgeClass: 'bg-destructive text-destructive-foreground',
    borderClass: 'border-l-destructive',
    label: 'Critical',
  },
  high: {
    badgeClass: 'bg-destructive/80 text-destructive-foreground',
    borderClass: 'border-l-destructive/80',
    label: 'High',
  },
  medium: {
    badgeClass: 'bg-warning text-warning-foreground',
    borderClass: 'border-l-warning',
    label: 'Medium',
  },
  low: {
    badgeClass: 'bg-muted text-muted-foreground',
    borderClass: 'border-l-muted-foreground',
    label: 'Low',
  },
} as const;

export const CATEGORY_CONFIG: Readonly<Record<RiskCategory, RiskCategoryConfig>> = {
  schedule: { icon: IconClock, label: 'Schedule' },
  budget: { icon: IconCurrencyDollar, label: 'Budget' },
  scope: { icon: IconTarget, label: 'Scope' },
  resource: { icon: IconUsers, label: 'Resource' },
  quality: { icon: IconShieldCheck, label: 'Quality' },
} as const;

export const FALLBACK_CATEGORY_ICON = IconAlertTriangle;

// Summary badge display order (only show these in header)
export const SUMMARY_SEVERITIES: readonly RiskSeverity[] = ['critical', 'high', 'medium'] as const;
