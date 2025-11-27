'use client';

import { memo } from 'react';

import { AdminView } from '@/components/default/dashboard/business-center/overview/components/financial-admin-view';
import { ClientView } from '@/components/default/dashboard/business-center/overview/components/financial-client-view';
import { FinancialEmptyState } from '@/components/default/dashboard/business-center/overview/components/financial-empty-state';
import { useFinancialData } from '@/components/default/dashboard/business-center/overview/hooks/use-financial-data';

import type {
  FinancialSnapshot,
  WidgetVariant,
} from '@/components/default/dashboard/business-center/overview/types';

export interface FinancialSnapshotWidgetProps {
  readonly data?: FinancialSnapshot;
  readonly className?: string;
  readonly variant?: WidgetVariant;
}

export const FinancialSnapshotWidget = memo(function FinancialSnapshotWidget({
  data: propData,
  className,
  variant = 'admin',
}: FinancialSnapshotWidgetProps) {
  const { data, budgetPercentage, hasOverdue, hasData } = useFinancialData({
    data: propData,
  });

  if (!hasData || !data) {
    return <FinancialEmptyState className={className} />;
  }

  if (variant === 'client') {
    return (
      <ClientView
        data={data}
        budgetPercentage={budgetPercentage}
        hasOverdue={hasOverdue}
        className={className}
      />
    );
  }

  return <AdminView data={data} budgetPercentage={budgetPercentage} className={className} />;
});
