// components/widget-config-dialog/config-fields/organization-health-config.tsx
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { OrganizationHealthConfig } from '@/lib/stores/dashboard-store';
import type { ConfigFieldsProps } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';

export function OrganizationHealthConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<OrganizationHealthConfig>) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="showTrends">Show Trend Indicators</Label>
      <Switch
        id="showTrends"
        checked={config.showTrends}
        onCheckedChange={(checked) => updateConfig('showTrends', checked)}
      />
    </div>
  );
}
