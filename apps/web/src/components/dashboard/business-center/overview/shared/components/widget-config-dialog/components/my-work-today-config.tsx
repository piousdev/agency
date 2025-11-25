'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MyWorkTodayConfig } from '@/lib/stores/dashboard-store';
import type { ConfigFieldsProps } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import {
  PRIORITY_FILTERS,
  SLIDER_CONFIGS,
} from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';

export function MyWorkTodayConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<MyWorkTodayConfig>) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="showCompleted">Show Completed Tasks</Label>
        <Switch
          id="showCompleted"
          checked={config.showCompleted}
          onCheckedChange={(checked) => updateConfig('showCompleted', checked)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priorityFilter">Priority Filter</Label>
        <Select
          value={config.priorityFilter}
          onValueChange={(value) => updateConfig('priorityFilter', value)}
        >
          <SelectTrigger id="priorityFilter">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_FILTERS.map((option) => (
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
