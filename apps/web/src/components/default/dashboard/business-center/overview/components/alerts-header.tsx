

import { IconBell } from '@tabler/icons-react';

import { FilterBadge } from '@/components/default/dashboard/business-center/overview/components/alerts-filter-badge';
import { ConnectionDot } from '@/components/default/dashboard/business-center/overview/shared';
import { Item, ItemContent } from '@/components/ui/item';

import type {
  AlertFilter,
  AlertCounts,
} from '@/components/default/dashboard/business-center/overview/types';

interface AlertsHeaderProps {
  readonly counts: AlertCounts;
  readonly filter: AlertFilter;
  readonly onToggleFilter: (filter: 'critical' | 'warning') => void;
}

export const AlertsHeader = ({ counts, filter, onToggleFilter }: AlertsHeaderProps) => {
  return (
    <Item
      className="flex flex-row items-center justify-between mb-3 p-2 w-full"
      data-testid="alert-item-header"
      aria-label="Alert item header"
    >
      <ItemContent
        className="flex flex-row items-center gap-2"
        data-testid="alert-item-header-content"
        aria-label="Alert item header content"
      >
        <IconBell
          className="size-4 text-muted-foreground"
          aria-hidden="true"
          data-testid="alert-item-header-content-icon"
        />
        <span
          className="text-sm font-medium"
          data-testid="alert-item-header-content-text"
          aria-label={`Alert item header content text ${String(counts.total)} Active`}
        >
          {counts.total} Active
        </span>
        <ConnectionDot className="ml-1" />
      </ItemContent>
      <ItemContent
        className="flex flex-row items-center gap-1"
        data-testid="alert-item-header-filter-content"
        aria-label="Alert item header filter content"
      >
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
      </ItemContent>
    </Item>
  );
};
