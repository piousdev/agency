import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getSeverityConfig,
  formatDaysBlocked,
} from '@/components/dashboard/business-center/overview/utils/blocker';
import { BlockerActions } from '@/components/dashboard/business-center/overview/components/blocker-actions';
import type { BlockerItem as BlockerItemType } from '@/components/dashboard/business-center/overview/types';

interface BlockerHeaderProps {
  readonly severity: BlockerItemType['severity'];
  readonly title: string;
  readonly projectName: string;
  readonly daysBlocked: number;
}

interface BlockerItemProps {
  readonly blocker: BlockerItemType;
  readonly onEscalate: (blocker: BlockerItemType) => void;
  readonly onResolve: (blocker: BlockerItemType) => void;
}

const BlockerHeader = memo(function BlockerHeader({
  severity,
  title,
  projectName,
  daysBlocked,
}: BlockerHeaderProps) {
  const config = getSeverityConfig(severity);
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3">
      <div className={cn('mt-0.5 p-1.5 rounded-md', config.bgClass)}>
        <Icon className={cn('h-3.5 w-3.5', config.textClass)} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
      </div>
      <Badge variant="outline" className={cn('text-xs', config.badgeClass)}>
        {formatDaysBlocked(daysBlocked)}
      </Badge>
    </div>
  );
});

export const BlockerItem = memo(function BlockerItem({
  blocker,
  onEscalate,
  onResolve,
}: BlockerItemProps) {
  return (
    <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      <BlockerHeader
        severity={blocker.severity}
        title={blocker.title}
        projectName={blocker.projectName}
        daysBlocked={blocker.daysBlocked}
      />

      {blocker.reason && (
        <p className="text-xs text-muted-foreground mt-2 ml-10">{blocker.reason}</p>
      )}

      <BlockerActions blocker={blocker} onEscalate={onEscalate} onResolve={onResolve} />
    </div>
  );
});
