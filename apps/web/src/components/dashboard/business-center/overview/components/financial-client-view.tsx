import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ClientBalance } from '@/components/dashboard/business-center/overview/components/financial-client-balance';
import { BudgetProgress } from '@/components/dashboard/business-center/overview/components/financial-budget-progress';
import { FinancialActions } from '@/components/dashboard/business-center/overview/components/financial-actions';
import type { FinancialSnapshot } from '@/components/dashboard/business-center/overview/types';

interface ClientViewProps {
  readonly data: FinancialSnapshot;
  readonly budgetPercentage: number;
  readonly hasOverdue: boolean;
  readonly className?: string;
}

export const ClientView = memo(function ClientView({
  data,
  budgetPercentage,
  hasOverdue,
  className,
}: ClientViewProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Client Balance */}
      <div className="mb-4">
        <ClientBalance
          balance={data.outstanding.value}
          overdueAmount={data.overdue.value}
          hasOverdue={hasOverdue}
        />
      </div>

      {/* Project Budget */}
      <div className="mb-4">
        <BudgetProgress
          used={data.projectBudgetUsed}
          total={data.projectBudgetTotal}
          percentage={budgetPercentage}
          showValues={false}
          showStatus={false}
        />
      </div>

      <FinancialActions variant="client" />
    </div>
  );
});
