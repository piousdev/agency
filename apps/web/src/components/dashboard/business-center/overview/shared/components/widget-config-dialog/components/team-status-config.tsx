// components/widget-config-dialog/config-fields/team-status-config.tsx
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { TeamStatusConfig } from '@/lib/stores/dashboard-store';
import type { ConfigFieldsProps } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';

export function TeamStatusConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<TeamStatusConfig>) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="showUtilization">Show Utilization Bars</Label>
      <Switch
        id="showUtilization"
        checked={config.showUtilization}
        onCheckedChange={(checked) => updateConfig('showUtilization', checked)}
      />
    </div>
  );
}
