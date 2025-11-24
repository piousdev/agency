'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyDollar,
  IconReceipt,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import type { FinancialSnapshot, FinancialMetric } from '@/lib/actions/business-center/overview';

// Mock data for when no server data is available
const MOCK_FINANCIAL: FinancialSnapshot = {
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
};

export interface FinancialSnapshotWidgetProps {
  data?: FinancialSnapshot;
  className?: string;
  variant?: 'admin' | 'client';
}

export function FinancialSnapshotWidget({
  data: propData,
  className,
  variant = 'admin',
}: FinancialSnapshotWidgetProps) {
  const overviewData = useOverviewData();
  const data = overviewData?.financialSnapshot || propData || MOCK_FINANCIAL;

  if (!data) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconCurrencyDollar className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-medium">No Financial Data</p>
        <p className="text-sm text-muted-foreground mt-1">Financial data is not available</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const budgetPercentage =
    data.projectBudgetTotal > 0
      ? Math.round((data.projectBudgetUsed / data.projectBudgetTotal) * 100)
      : 0;

  // Admin/PM view - show all metrics
  if (variant === 'admin') {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricCard metric={data.revenue} icon={IconCurrencyDollar} positive />
          <MetricCard metric={data.paidThisMonth} icon={IconCheck} positive />
          <MetricCard metric={data.outstanding} icon={IconReceipt} />
          <MetricCard metric={data.overdue} icon={IconAlertTriangle} negative />
        </div>

        {/* Budget Progress */}
        <div className="p-3 rounded-lg bg-muted/50 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Project Budget</span>
            <span className="font-medium">
              {formatCurrency(data.projectBudgetUsed)} / {formatCurrency(data.projectBudgetTotal)}
            </span>
          </div>
          <Progress
            value={budgetPercentage}
            className={cn(
              'h-2',
              budgetPercentage > 90 && '[&>div]:bg-destructive',
              budgetPercentage > 75 && budgetPercentage <= 90 && '[&>div]:bg-warning'
            )}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {budgetPercentage}% used
            {budgetPercentage > 90 && ' - Budget nearly exhausted'}
            {budgetPercentage > 75 && budgetPercentage <= 90 && ' - Approaching limit'}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-auto border-t">
          <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
            <Link href="/dashboard/billing">
              View billing details
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Client view - simplified, shows balance and project budget
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Client Balance */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 mb-4">
        <p className="text-sm text-muted-foreground mb-1">Account Balance</p>
        <p className="text-2xl font-bold">{formatCurrency(data.outstanding.value)}</p>
        {data.overdue.value > 0 && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <IconAlertTriangle className="h-3 w-3" />
            {formatCurrency(data.overdue.value)} overdue
          </p>
        )}
      </div>

      {/* Project Budget */}
      <div className="p-3 rounded-lg bg-muted/50 mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Project Budget</span>
          <span className="font-medium">{budgetPercentage}% used</span>
        </div>
        <Progress
          value={budgetPercentage}
          className={cn(
            'h-2',
            budgetPercentage > 90 && '[&>div]:bg-destructive',
            budgetPercentage > 75 && budgetPercentage <= 90 && '[&>div]:bg-warning'
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>{formatCurrency(data.projectBudgetUsed)}</span>
          <span>{formatCurrency(data.projectBudgetTotal)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/billing">
            View invoices
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Metric card component for admin view
function MetricCard({
  metric,
  icon: Icon,
  positive,
  negative,
}: {
  metric: FinancialMetric;
  icon: React.ComponentType<{ className?: string }>;
  positive?: boolean;
  negative?: boolean;
}) {
  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (format === 'percent') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getTrendColor = () => {
    if (negative && metric.trend === 'up') return 'text-destructive';
    if (negative && metric.trend === 'down') return 'text-success';
    if (positive && metric.trend === 'up') return 'text-success';
    if (positive && metric.trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{metric.label}</span>
      </div>
      <p className="text-lg font-semibold">{formatValue(metric.value, metric.format)}</p>
      <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
        {metric.trend === 'up' ? (
          <IconTrendingUp className="h-3 w-3" />
        ) : metric.trend === 'down' ? (
          <IconTrendingDown className="h-3 w-3" />
        ) : null}
        <span>
          {metric.change > 0 ? '+' : ''}
          {metric.change}%
        </span>
      </div>
    </div>
  );
}
