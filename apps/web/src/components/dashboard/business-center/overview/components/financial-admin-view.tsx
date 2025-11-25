import { memo } from 'react';
import { cn } from '@/lib/utils';
import { METRIC_CONFIG } from '@/components/dashboard/business-center/overview/constants/financial-config';
import { MetricCard } from '@/components/dashboard/business-center/overview/components/financial-metric-card';
import { BudgetProgress } from '@/components/dashboard/business-center/overview/components/financial-budget-progress';
import { FinancialActions } from '@/components/dashboard/business-center/overview/components/financial-actions';
import type { FinancialSnapshot } from '@/components/dashboard/business-center/overview/types';

interface AdminViewProps {
  readonly data: FinancialSnapshot;
  readonly budgetPercentage: number;
  readonly className?: string;
}

export const AdminView = memo(function AdminView({
  data,
  budgetPercentage,
  className,
}: AdminViewProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          metric={data.revenue}
          icon={METRIC_CONFIG.revenue.icon}
          isPositiveGood={METRIC_CONFIG.revenue.isPositiveGood}
        />
        <MetricCard
          metric={data.paidThisMonth}
          icon={METRIC_CONFIG.paidThisMonth.icon}
          isPositiveGood={METRIC_CONFIG.paidThisMonth.isPositiveGood}
        />
        <MetricCard
          metric={data.outstanding}
          icon={METRIC_CONFIG.outstanding.icon}
          isPositiveGood={METRIC_CONFIG.outstanding.isPositiveGood}
        />
        <MetricCard
          metric={data.overdue}
          icon={METRIC_CONFIG.overdue.icon}
          isPositiveGood={METRIC_CONFIG.overdue.isPositiveGood}
        />
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <BudgetProgress
          used={data.projectBudgetUsed}
          total={data.projectBudgetTotal}
          percentage={budgetPercentage}
          showValues
          showStatus
        />
      </div>

      <FinancialActions variant="admin" />
    </div>
  );
});
