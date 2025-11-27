import { ALERT_TYPE_CONFIG } from '@/components/default/dashboard/business-center/overview/constants/alert-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterBadgeProps {
  readonly type: 'critical' | 'warning';
  readonly count: number;
  readonly isActive: boolean;
  readonly onToggle: () => void;
}

export const FilterBadge = ({ type, count, isActive, onToggle }: FilterBadgeProps) => {
  if (count === 0) return null;

  const config = ALERT_TYPE_CONFIG[type];
  const label = type === 'critical' ? 'Critical' : 'Warning';

  return (
    <Badge
      variant={isActive ? 'default' : 'outline'}
      className={cn('cursor-pointer text-xs', !isActive && config.badgeClass)}
      onClick={onToggle}
      data-testid="alert-item-filter-badge"
      aria-label={`Alert item filter badge ${label}`}
    >
      <span
        data-testid="alert-item-filter-badge-text"
        aria-label={`Alert item filter badge text ${String(count)} ${label}`}
      >
        {count} {label}
      </span>
    </Badge>
  );
};

FilterBadge.displayName = 'FilterBadge';
