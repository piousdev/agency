import { memo } from 'react';

import { IconCurrencyDollar } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

interface FinancialEmptyStateProps {
  readonly className?: string;
}

export const FinancialEmptyState = memo(function FinancialEmptyState({
  className,
}: FinancialEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full text-center', className)}>
      <IconCurrencyDollar className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
      <p className="font-medium">No Financial Data</p>
      <p className="text-sm text-muted-foreground mt-1">Financial data is not available</p>
    </div>
  );
});
