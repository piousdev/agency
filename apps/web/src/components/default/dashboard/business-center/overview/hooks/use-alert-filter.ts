import { useState, useMemo, useCallback } from 'react';

import {
  isValidAlertFilter,
  type AlertPayload,
  type AlertFilter,
} from '@/components/default/dashboard/business-center/overview/types';

interface UseAlertFilterOptions {
  readonly alerts: readonly AlertPayload[];
  readonly criticalAlerts: readonly AlertPayload[];
  readonly warningAlerts: readonly AlertPayload[];
  readonly infoAlerts: readonly AlertPayload[];
}

interface UseAlertFilterReturn {
  readonly filter: AlertFilter;
  readonly setFilter: (filter: AlertFilter) => void;
  readonly toggleFilter: (filter: Exclude<AlertFilter, 'all'>) => void;
  readonly filteredAlerts: readonly AlertPayload[];
  readonly isFiltered: boolean;
}

export function useAlertFilter({
  alerts,
  criticalAlerts,
  warningAlerts,
  infoAlerts,
}: UseAlertFilterOptions): UseAlertFilterReturn {
  const [filter, setFilterInternal] = useState<AlertFilter>('all');

  const setFilter = useCallback((value: AlertFilter) => {
    if (isValidAlertFilter(value)) {
      setFilterInternal(value);
    }
  }, []);

  const toggleFilter = useCallback((targetFilter: Exclude<AlertFilter, 'all'>) => {
    setFilterInternal((current) => (current === targetFilter ? 'all' : targetFilter));
  }, []);

  const filteredAlerts = useMemo(() => {
    switch (filter) {
      case 'critical':
        return criticalAlerts;
      case 'warning':
        return warningAlerts;
      case 'info':
        return infoAlerts;
      default:
        return alerts;
    }
  }, [filter, alerts, criticalAlerts, warningAlerts, infoAlerts]);

  return {
    filter,
    setFilter,
    toggleFilter,
    filteredAlerts,
    isFiltered: filter !== 'all',
  };
}
