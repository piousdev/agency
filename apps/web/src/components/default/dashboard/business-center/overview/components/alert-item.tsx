import { AlertsContent } from '@/components/default/dashboard/business-center/overview/components/alerts-content';
import { AlertsFooter } from '@/components/default/dashboard/business-center/overview/components/alerts-footer';
import { getAlertTypeConfig } from '@/components/default/dashboard/business-center/overview/utils/alert';
import { Item, ItemContent, ItemActions, ItemGroup } from '@/components/ui/item';
import { cn } from '@/lib/utils';

import { AlertActionsMenu } from './alert-actions-menu';

import type { AlertPayload } from '@/components/default/dashboard/business-center/overview/types';


interface AlertItemProps {
  readonly alert: AlertPayload;
  readonly onDismiss: (alertId: string) => void;
  readonly onSnooze: (alertId: string, duration: number) => void;
}

export const AlertItem = ({ alert, onDismiss, onSnooze }: AlertItemProps) => {
  const config = getAlertTypeConfig(alert.type);

  return (
    <Item
      className={cn(
        'p-2 rounded-xl animate-in fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none',
        config.bgColor
      )}
      role="alert"
      aria-live="polite"
      data-testid="alert-item"
      aria-label="Alert item"
    >
      <ItemGroup
        className="flex w-full flex-row items-center justify-between gap-2"
        data-testid="alert-item-group"
        aria-label="Alert item group"
      >
        <ItemContent data-testid="alert-item-content" aria-label="Alert item content">
          <AlertsContent
            title={alert.title}
            message={alert.message}
            iconClass={config.color}
            Icon={config.icon}
          />
        </ItemContent>
        <ItemActions data-testid="alert-item-actions" aria-label="Alert item actions">
          <AlertActionsMenu alertId={alert.id} onDismiss={onDismiss} onSnooze={onSnooze} />
        </ItemActions>
      </ItemGroup>

      <AlertsFooter
        entityType={alert.entityType}
        entityName={alert.entityName}
        createdAt={alert.createdAt}
        actionUrl={alert.actionUrl}
      />
    </Item>
  );
};
