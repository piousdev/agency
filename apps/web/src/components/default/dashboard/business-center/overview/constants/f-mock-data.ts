import type { FinancialSnapshot } from '@/components/default/dashboard/business-center/overview/types';

export const MOCK_FINANCIAL: Readonly<FinancialSnapshot> = {
  revenue: {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: 45250,
    change: 12,
    trend: 'up',
    format: 'currency',
  },
  outstanding: {
    id: 'outstanding',
    label: 'Outstanding',
    value: 12500,
    change: -5,
    trend: 'down',
    format: 'currency',
  },
  overdue: {
    id: 'overdue',
    label: 'Overdue',
    value: 3200,
    change: 8,
    trend: 'up',
    format: 'currency',
  },
  paidThisMonth: {
    id: 'paid',
    label: 'Paid This Month',
    value: 32750,
    change: 15,
    trend: 'up',
    format: 'currency',
  },
  projectBudgetUsed: 67500,
  projectBudgetTotal: 100000,
} as const;
