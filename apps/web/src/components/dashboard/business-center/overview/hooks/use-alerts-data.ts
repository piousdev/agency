import { useMemo, useCallback } from 'react';
import { useRealtimeAlerts } from '@/lib/hooks/use-socket';
import { calculateAlertCounts } from '@/components/dashboard/business-center/overview/utils/alert';
import type {
  AlertPayload,
  AlertCounts,
} from '@/components/dashboard/business-center/overview/types';

interface UseAlertsDataReturn {
  readonly alerts: readonly AlertPayload[];
  readonly criticalAlerts: readonly AlertPayload[];
  readonly warningAlerts: readonly AlertPayload[];
  readonly infoAlerts: readonly AlertPayload[];
  readonly counts: AlertCounts;
  readonly isConnected: boolean;
  readonly isEmpty: boolean;
  readonly isConnecting: boolean;
  readonly dismiss: (alertId: string) => void;
  readonly snooze: (alertId: string, duration: number) => void;
  readonly dismissAll: () => void;
}

export function useAlertsData(): UseAlertsDataReturn {
  const { alerts, criticalAlerts, warningAlerts, infoAlerts, isConnected, dismiss, snooze } =
    useRealtimeAlerts();

  const counts = useMemo(() => calculateAlertCounts(alerts), [alerts]);

  const dismissAll = useCallback(() => {
    alerts.forEach((alert) => dismiss(alert.id));
  }, [alerts, dismiss]);

  return {
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    counts,
    isConnected,
    isEmpty: alerts.length === 0,
    isConnecting: !isConnected && alerts.length === 0,
    dismiss,
    snooze,
    dismissAll,
  };
}
