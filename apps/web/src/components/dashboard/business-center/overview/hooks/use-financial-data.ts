import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_FINANCIAL } from '@/components/dashboard/business-center/overview/constants/f-mock-data';
import {
  calculateBudgetPercentage,
  getBudgetLevel,
} from '@/components/dashboard/business-center/overview/utils/financial';
import type {
  FinancialSnapshot,
  BudgetLevel,
} from '@/components/dashboard/business-center/overview/types';

interface UseFinancialDataOptions {
  readonly data?: FinancialSnapshot;
}

interface UseFinancialDataReturn {
  readonly data: FinancialSnapshot | null;
  readonly budgetPercentage: number;
  readonly budgetLevel: BudgetLevel;
  readonly hasData: boolean;
  readonly hasOverdue: boolean;
}

export function useFinancialData(options: UseFinancialDataOptions = {}): UseFinancialDataReturn {
  const { data: propData } = options;
  const overviewData = useOverviewData();

  const data = useMemo<FinancialSnapshot | null>(() => {
    // Priority: server data > prop data > mock data
    return overviewData?.financialSnapshot ?? propData ?? MOCK_FINANCIAL;
  }, [overviewData?.financialSnapshot, propData]);

  const budgetPercentage = useMemo(() => {
    if (!data) return 0;
    return calculateBudgetPercentage(data.projectBudgetUsed, data.projectBudgetTotal);
  }, [data]);

  const budgetLevel = useMemo(() => getBudgetLevel(budgetPercentage), [budgetPercentage]);

  const hasOverdue = useMemo(() => {
    if (!data) return false;
    return data.overdue.value > 0;
  }, [data]);

  return {
    data,
    budgetPercentage,
    budgetLevel,
    hasData: data !== null,
    hasOverdue,
  };
}
