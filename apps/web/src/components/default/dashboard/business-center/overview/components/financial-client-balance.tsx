import { memo } from 'react';

import { IconAlertTriangle } from '@tabler/icons-react';

import { formatCurrency } from '@/components/default/dashboard/business-center/overview/utils/financial';

interface ClientBalanceProps {
  readonly balance: number;
  readonly overdueAmount: number;
  readonly hasOverdue: boolean;
}

export const ClientBalance = memo(function ClientBalance({
  balance,
  overdueAmount,
  hasOverdue,
}: ClientBalanceProps) {
  return (
    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
      <p className="text-sm text-muted-foreground mb-1">Account Balance</p>
      <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
      {hasOverdue && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <IconAlertTriangle className="h-3 w-3" aria-hidden="true" />
          {formatCurrency(overdueAmount)} overdue
        </p>
      )}
    </div>
  );
});
