import { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  getBudgetProgressClass,
  getBudgetStatusMessage,
} from '@/components/dashboard/business-center/overview/utils/financial';

interface BudgetProgressProps {
  readonly used: number;
  readonly total: number;
  readonly percentage: number;
  readonly showValues?: boolean;
  readonly showStatus?: boolean;
}

export const BudgetProgress = memo(function BudgetProgress({
  used,
  total,
  percentage,
  showValues = true,
  showStatus = true,
}: BudgetProgressProps) {
  const progressClass = getBudgetProgressClass(percentage);
  const statusMessage = getBudgetStatusMessage(percentage);

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Project Budget</span>
        {showValues ? (
          <span className="font-medium">
            {formatCurrency(used)} / {formatCurrency(total)}
          </span>
        ) : (
          <span className="font-medium">{percentage}% used</span>
        )}
      </div>
      <Progress value={percentage} className={cn('h-2', progressClass)} />
      {showStatus && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {percentage}% used{statusMessage}
        </p>
      )}
      {!showValues && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>{formatCurrency(used)}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      )}
    </div>
  );
});
