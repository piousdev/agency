'use client';

import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAlertsData } from '@/components/dashboard/business-center/overview/hooks';
import { useAlertFilter } from '@/components/dashboard/business-center/overview/hooks';
import { AlertsEmptyState } from '@/components/dashboard/business-center/overview/components/alerts-empty-state';
import { AlertsHeader } from '@/components/dashboard/business-center/overview/components/alerts-header';
import { AlertItem } from '@/components/dashboard/business-center/overview/components/alert-item';
import { DismissAllButton } from '@/components/dashboard/business-center/overview/components/alerts-dismiss-all-button';

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
    <div className={cn('flex flex-col h-full', className)}>
      <AlertsHeader counts={counts} filter={filter} onToggleFilter={toggleFilter} />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} onSnooze={snooze} />
          ))}
        </div>
      </ScrollArea>

      {showDismissAll && <DismissAllButton onDismissAll={dismissAll} />}
    </div>
  );
});
