import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_RISK_SUMMARY } from '@/components/dashboard/business-center/overview/constants/ri-mock-data';
import { sortRisksBySeverity } from '@/components/dashboard/business-center/overview/utils/risk';
import type { RiskSummary } from '@/components/dashboard/business-center/overview/types';

interface UseRiskDataOptions {
  readonly data?: RiskSummary;
}

interface UseRiskDataReturn {
  readonly data: RiskSummary;
  readonly isEmpty: boolean;
  readonly sortedRisks: RiskSummary['risks'];
  readonly hasHighPriority: boolean;
}

export function useRiskData(options: UseRiskDataOptions = {}): UseRiskDataReturn {
  const { data: propData } = options;
  const overviewData = useOverviewData();

  const data = useMemo<RiskSummary>(() => {
    // Priority: server data > prop data > mock data
    return overviewData?.riskSummary ?? propData ?? MOCK_RISK_SUMMARY;
  }, [overviewData?.riskSummary, propData]);

  const sortedRisks = useMemo(() => sortRisksBySeverity(data.risks), [data.risks]);

  const hasHighPriority = data.critical > 0 || data.high > 0;

  return {
    data,
    isEmpty: data.total === 0,
    sortedRisks,
    hasHighPriority,
  };
}
