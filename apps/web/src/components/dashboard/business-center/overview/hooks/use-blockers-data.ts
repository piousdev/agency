import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_BLOCKERS } from '@/components/dashboard/business-center/overview/constants/b-mock-data';
import { sortBlockersBySeverity } from '@/components/dashboard/business-center/overview/utils/blocker';
import type { BlockerItem } from '@/components/dashboard/business-center/overview/types';

interface UseBlockersDataOptions {
  readonly blockers?: readonly BlockerItem[];
}

interface UseBlockersDataReturn {
  readonly blockers: readonly BlockerItem[];
  readonly count: number;
  readonly isEmpty: boolean;
  readonly criticalCount: number;
}

export function useBlockersData(options: UseBlockersDataOptions = {}): UseBlockersDataReturn {
  const { blockers: propBlockers } = options;
  const overviewData = useOverviewData();

  const blockers = useMemo<readonly BlockerItem[]>(() => {
    // Priority: server data > prop data > mock data
    const raw = overviewData?.blockers ?? propBlockers ?? MOCK_BLOCKERS;
    return sortBlockersBySeverity(raw);
  }, [overviewData?.blockers, propBlockers]);

  const criticalCount = useMemo(
    () => blockers.filter((b) => b.severity === 'critical').length,
    [blockers]
  );

  return {
    blockers,
    count: blockers.length,
    isEmpty: blockers.length === 0,
    criticalCount,
  };
}
