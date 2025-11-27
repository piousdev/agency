// components/widget-config-dialog/config-fields/current-sprint-config.tsx
'use client';

import { Item, ItemContent, ItemActions } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import type { ConfigFieldsProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import type { CurrentSprintConfig } from '@/lib/stores/dashboard-store';

export function CurrentSprintConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<CurrentSprintConfig>) {
  return (
    <>
      <Item className="p-0" aria-label="Show burndown" data-testid="show-burndown">
        <ItemContent
          aria-label="Show burndown ItemContent"
          data-testid="show-burndown-item-content"
        >
          <Label
            htmlFor="showBurndown"
            aria-label="Show burndown label"
            data-testid="show-burndown-label"
          >
            Show Burndown Chart
          </Label>
        </ItemContent>
        <ItemActions
          aria-label="Show burndown ItemActions"
          data-testid="show-burndown-item-actions"
        >
          <Switch
            id="showBurndown"
            checked={config.showBurndown}
            onCheckedChange={(checked) => updateConfig('showBurndown', checked)}
            aria-label="Show burndown switch"
            data-testid="show-burndown-switch"
          />
        </ItemActions>
      </Item>
      <Item className="p-0" aria-label="Show velocity" data-testid="show-velocity">
        <ItemContent
          aria-label="Show velocity ItemContent"
          data-testid="show-velocity-item-content"
        >
          <Label
            htmlFor="showVelocity"
            aria-label="Show velocity label"
            data-testid="show-velocity-label"
          >
            Show Velocity Comparison
          </Label>
        </ItemContent>
        <ItemActions
          aria-label="Show velocity ItemActions"
          data-testid="show-velocity-item-actions"
        >
          <Switch
            id="showVelocity"
            checked={config.showVelocity}
            onCheckedChange={(checked) => updateConfig('showVelocity', checked)}
            aria-label="Show velocity switch"
            data-testid="show-velocity-switch"
          />
        </ItemActions>
      </Item>
    </>
  );
}
