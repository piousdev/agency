import { memo } from 'react';
import Link from 'next/link';
import { IconExternalLink } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  getAlertTypeConfig,
  getEntityIcon,
  formatRelativeTime,
} from '@/components/dashboard/business-center/overview/utils/alert';
import { AlertActionsMenu } from './alert-actions-menu';
import type { AlertPayload } from '@/components/dashboard/business-center/overview/types';

interface AlertContentProps {
  readonly title: string;
  readonly message: string;
  readonly iconClass: string;
  readonly Icon: React.ComponentType<{ className?: string }>;
}

const AlertContent = memo(function AlertContent({
  title,
  message,
  iconClass,
  Icon,
}: AlertContentProps) {
  return (
    <div className="flex items-start gap-2 flex-1 min-w-0">
      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconClass)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{message}</p>
      </div>
    </div>
  );
});

interface AlertFooterProps {
  readonly entityType: string;
  readonly entityName?: string;
  readonly createdAt: string;
  readonly actionUrl?: string;
}

const AlertFooter = memo(function AlertFooter({
  entityType,
  entityName,
  createdAt,
  actionUrl,
}: AlertFooterProps) {
  const EntityIcon = getEntityIcon(entityType);

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {entityName && (
          <span className="flex items-center gap-1">
            <EntityIcon className="h-3 w-3" aria-hidden="true" />
            {entityName}
          </span>
        )}
        <span>{formatRelativeTime(createdAt)}</span>
      </div>
      {actionUrl && (
        <Link
          href={actionUrl}
          className="text-xs text-primary hover:underline flex items-center gap-0.5"
        >
          View
          <IconExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
});

interface AlertItemProps {
  readonly alert: AlertPayload;
  readonly onDismiss: (alertId: string) => void;
  readonly onSnooze: (alertId: string, duration: number) => void;
}

export const AlertItem = memo(function AlertItem({ alert, onDismiss, onSnooze }: AlertItemProps) {
  const config = getAlertTypeConfig(alert.type);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4 animate-in fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none',
        config.bgColor,
        config.borderColor
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <AlertContent
          title={alert.title}
          message={alert.message}
          iconClass={config.color}
          Icon={config.icon}
        />
        <AlertActionsMenu alertId={alert.id} onDismiss={onDismiss} onSnooze={onSnooze} />
      </div>

      <AlertFooter
        entityType={alert.entityType}
        entityName={alert.entityName}
        createdAt={alert.createdAt}
        actionUrl={alert.actionUrl}
      />
    </div>
  );
});
