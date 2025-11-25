import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { IconBell } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ConnectionDot } from '@/components/dashboard/business-center/overview/shared';
import { ALERT_TYPE_CONFIG } from '@/components/dashboard/business-center/overview/constants/alert-config';
import type {
  AlertFilter,
  AlertCounts,
} from '@/components/dashboard/business-center/overview/types';

interface FilterBadgeProps {
  readonly type: 'critical' | 'warning';
  readonly count: number;
  readonly isActive: boolean;
  readonly onToggle: () => void;
}

const FilterBadge = memo(function FilterBadge({
  type,
  count,
  isActive,
  onToggle,
}: FilterBadgeProps) {
  if (count === 0) return null;

  const config = ALERT_TYPE_CONFIG[type];
  const label = type === 'critical' ? 'Critical' : 'Warning';

  return (
    <Badge
      variant={isActive ? 'default' : 'outline'}
      className={cn('cursor-pointer text-xs', !isActive && config.badgeClass)}
      onClick={onToggle}
    >
      {count} {label}
    </Badge>
  );
});

interface AlertsHeaderProps {
  readonly counts: AlertCounts;
  readonly filter: AlertFilter;
  readonly onToggleFilter: (filter: 'critical' | 'warning') => void;
}

export const AlertsHeader = memo(function AlertsHeader({
  counts,
  filter,
  onToggleFilter,
}: AlertsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <IconBell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{counts.total} Active</span>
        <ConnectionDot className="ml-1" />
      </div>
      <div className="flex items-center gap-1">
        <FilterBadge
          type="critical"
          count={counts.critical}
          isActive={filter === 'critical'}
          onToggle={() => onToggleFilter('critical')}
        />
        <FilterBadge
          type="warning"
          count={counts.warning}
          isActive={filter === 'warning'}
          onToggle={() => onToggleFilter('warning')}
        />
      </div>
    </div>
  );
});
