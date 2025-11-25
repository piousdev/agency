// components/widget-config-dialog/config-fields/recent-activity-config.tsx
'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RecentActivityConfig } from '@/lib/stores/dashboard-store';
import type { ConfigFieldsProps } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import {
  ACTIVITY_FILTERS,
  SLIDER_CONFIGS,
} from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';

export function RecentActivityConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<RecentActivityConfig>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="filterCategory">Default Filter</Label>
        <Select
          value={config.filterCategory}
          onValueChange={(value) => updateConfig('filterCategory', value)}
        >
          <SelectTrigger id="filterCategory">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Max Items: {config.maxItems}</Label>
        <Slider
          value={[config.maxItems]}
          onValueChange={([value]) => updateConfig('maxItems', value)}
          min={SLIDER_CONFIGS.MAX_ITEMS.MIN}
          max={SLIDER_CONFIGS.MAX_ITEMS.MAX}
          step={SLIDER_CONFIGS.MAX_ITEMS.STEP}
        />
      </div>
    </>
  );
}
