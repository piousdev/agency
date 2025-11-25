// components/widget-config-dialog/config-fields/current-sprint-config.tsx
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { CurrentSprintConfig } from '@/lib/stores/dashboard-store';
import type { ConfigFieldsProps } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';

export function CurrentSprintConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<CurrentSprintConfig>) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="showBurndown">Show Burndown Chart</Label>
        <Switch
          id="showBurndown"
          checked={config.showBurndown}
          onCheckedChange={(checked) => updateConfig('showBurndown', checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="showVelocity">Show Velocity Comparison</Label>
        <Switch
          id="showVelocity"
          checked={config.showVelocity}
          onCheckedChange={(checked) => updateConfig('showVelocity', checked)}
        />
      </div>
    </>
  );
}
