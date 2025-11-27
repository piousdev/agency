import { useMemo } from 'react';

import { MOCK_BLOCKERS } from '@/components/default/dashboard/business-center/overview/constants/b-mock-data';
import { useOverviewData } from '@/components/default/dashboard/business-center/overview/context/overview-data-context';
import { sortBlockersBySeverity } from '@/components/default/dashboard/business-center/overview/utils/blocker';

import type { BlockerItem } from '@/components/default/dashboard/business-center/overview/types';

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
