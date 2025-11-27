'use client';

import { memo } from 'react';

import { AlertItem } from '@/components/default/dashboard/business-center/overview/components/alert-item';
import { DismissAllButton } from '@/components/default/dashboard/business-center/overview/components/alerts-dismiss-all-button';
import { AlertsEmptyState } from '@/components/default/dashboard/business-center/overview/components/alerts-empty-state';
import { AlertsHeader } from '@/components/default/dashboard/business-center/overview/components/alerts-header';
import {
  useAlertsData,
  useAlertFilter,
} from '@/components/default/dashboard/business-center/overview/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface CriticalAlertsWidgetProps {
  readonly className?: string;
}

export const CriticalAlertsWidget = memo(function CriticalAlertsWidget({
  className,
}: CriticalAlertsWidgetProps) {
  const {
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    counts,
    isConnected,
    isEmpty,
    isConnecting,
    dismiss,
    snooze,
    dismissAll,
  } = useAlertsData();

  const { filter, toggleFilter, filteredAlerts } = useAlertFilter({
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
  });

  // Show empty state when connecting or no alerts
  if (isConnecting || isEmpty) {
    return (
      <AlertsEmptyState
        isConnected={isConnected}
        isConnecting={isConnecting}
        className={className}
      />
    );
  }

  const showDismissAll = alerts.length > 1;

  return (
    <div
      className={cn('flex flex-col items-center justify-center h-full', className)}
      data-testid="critical-alerts-widget-container"
      aria-label="Critical alerts widget container"
    >
      <AlertsHeader counts={counts} filter={filter} onToggleFilter={toggleFilter} />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div
          className="space-y-2 px-2"
          data-testid="critical-alerts-widget-content-container"
          aria-label="Critical alerts widget content container"
        >
          {filteredAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} onSnooze={snooze} />
          ))}
        </div>
      </ScrollArea>

      {showDismissAll && <DismissAllButton onDismissAll={dismissAll} />}
    </div>
  );
});
