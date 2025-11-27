// components/widget-config-dialog/config-fields/team-status-config.tsx
'use client';

import { Item, ItemContent, ItemActions } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import type { ConfigFieldsProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import type { TeamStatusConfig } from '@/lib/stores/dashboard-store';

export function TeamStatusConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<TeamStatusConfig>) {
  return (
    <Item className="p-0" aria-label="Show utilization Item" data-testid="show-utilization-item">
      <ItemContent
        aria-label="Show utilization ItemContent"
        data-testid="show-utilization-item-content"
      >
        <Label
          htmlFor="showUtilization"
          aria-label="Show utilization Label"
          data-testid="show-utilization-label"
        >
          Show Utilization Bars
        </Label>
      </ItemContent>
      <ItemActions
        aria-label="Show utilization ItemActions"
        data-testid="show-utilization-item-actions"
      >
        <Switch
          id="showUtilization"
          checked={config.showUtilization}
          onCheckedChange={(checked) => updateConfig('showUtilization', checked)}
          aria-label="Show utilization Switch"
          data-testid="show-utilization-switch"
        />
      </ItemActions>
    </Item>
  );
}
