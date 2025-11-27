// components/widget-config-dialog/config-fields/organization-health-config.tsx
'use client';

import { Item, ItemContent, ItemActions } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import type { ConfigFieldsProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import type { OrganizationHealthConfig } from '@/lib/stores/dashboard-store';

export function OrganizationHealthConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<OrganizationHealthConfig>) {
  return (
    <Item
      className="p-0"
      aria-label="Show trend indicators Item"
      data-testid="show-trend-indicators-item"
    >
      <ItemContent
        aria-label="Show trend indicators ItemContent"
        data-testid="show-trend-indicators-item-content"
      >
        <Label
          htmlFor="showTrends"
          aria-label="Show trend indicators Label"
          data-testid="show-trend-indicators-label"
        >
          Show Trend Indicators
        </Label>
      </ItemContent>
      <ItemActions
        aria-label="Show trend indicators ItemActions"
        data-testid="show-trend-indicators-item-actions"
      >
        <Switch
          id="showTrends"
          aria-label="Show trend indicators Switch"
          data-testid="show-trend-indicators-switch"
          checked={config.showTrends}
          onCheckedChange={(checked) => updateConfig('showTrends', checked)}
        />
      </ItemActions>
    </Item>
  );
}
