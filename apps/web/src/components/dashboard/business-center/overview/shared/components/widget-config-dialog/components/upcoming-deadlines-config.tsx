// components/widget-config-dialog/config-fields/upcoming-deadlines-config.tsx
'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import type { UpcomingDeadlinesConfig } from '@/lib/stores/dashboard-store';
import type {
  ConfigFieldsProps,
  DeadlineType,
} from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import {
  DEADLINE_TYPES,
  SLIDER_CONFIGS,
} from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';
import {
  toggleArrayItem,
  isDeadlineTypeSelected,
} from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/utils';

export function UpcomingDeadlinesConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<UpcomingDeadlinesConfig>) {
  const handleToggleDeadlineType = (type: DeadlineType) => {
    const current = config.deadlineTypes || [];
    updateConfig('deadlineTypes', toggleArrayItem(current, type));
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Days Ahead: {config.daysAhead}</Label>
        <Slider
          value={[config.daysAhead]}
          onValueChange={([value]) => updateConfig('daysAhead', value)}
          min={SLIDER_CONFIGS.DAYS_AHEAD.MIN}
          max={SLIDER_CONFIGS.DAYS_AHEAD.MAX}
          step={SLIDER_CONFIGS.DAYS_AHEAD.STEP}
        />
      </div>
      <div className="space-y-2">
        <Label>Deadline Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {DEADLINE_TYPES.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`deadline-${option.value}`}
                checked={isDeadlineTypeSelected(config.deadlineTypes, option.value)}
                onCheckedChange={() => handleToggleDeadlineType(option.value)}
              />
              <Label htmlFor={`deadline-${option.value}`} className="text-sm font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
