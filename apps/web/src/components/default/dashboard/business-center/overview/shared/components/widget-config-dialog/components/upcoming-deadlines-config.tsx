// components/widget-config-dialog/config-fields/upcoming-deadlines-config.tsx
'use client';

import {
  DEADLINE_TYPES,
  SLIDER_CONFIGS,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';
import {
  toggleArrayItem,
  isDeadlineTypeSelected,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Item, ItemContent } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

import type {
  ConfigFieldsProps,
  DeadlineType,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import type { UpcomingDeadlinesConfig } from '@/lib/stores/dashboard-store';

export function UpcomingDeadlinesConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<UpcomingDeadlinesConfig>) {
  const handleToggleDeadlineType = (type: DeadlineType) => {
    const current = config.deadlineTypes;
    updateConfig('deadlineTypes', toggleArrayItem(current, type));
  };

  return (
    <>
      <Item className="p-0" aria-label="Days ahead" data-testid="days-ahead">
        <ItemContent
          aria-label="Days ahead ItemContent"
          data-testid="days-ahead-item-content"
          className="space-y-2"
        >
          <Label htmlFor="daysAhead" aria-label="Days ahead label" data-testid="days-ahead-label">
            Days Ahead: {config.daysAhead}
          </Label>
          <Slider
            value={[config.daysAhead]}
            onValueChange={([value]) => updateConfig('daysAhead', value)}
            min={SLIDER_CONFIGS.DAYS_AHEAD.MIN}
            max={SLIDER_CONFIGS.DAYS_AHEAD.MAX}
            step={SLIDER_CONFIGS.DAYS_AHEAD.STEP}
            aria-label="Days ahead Slider"
            data-testid="days-ahead-slider"
          />
        </ItemContent>
      </Item>
      <Item className="p-0" aria-label="Deadline types" data-testid="deadline-types">
        <ItemContent
          aria-label="Deadline types ItemContent"
          data-testid="deadline-types-item-content"
          className="space-y-2"
        >
          <Label
            htmlFor="deadlineTypes"
            aria-label="Deadline types label"
            data-testid="deadline-types-label"
          >
            Deadline Types
          </Label>
          <div
            className="grid grid-cols-2 gap-2"
            aria-label="Deadline types grid"
            data-testid="deadline-types-grid"
          >
            {DEADLINE_TYPES.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`deadline-${option.value}`}
                  checked={isDeadlineTypeSelected(config.deadlineTypes, option.value)}
                  onCheckedChange={() => handleToggleDeadlineType(option.value)}
                  aria-label={`Deadline type ${option.value}`}
                  data-testid={`deadline-type-${option.value}`}
                />
                <Label
                  htmlFor={`deadline-${option.value}`}
                  className="text-sm font-normal"
                  aria-label={`Deadline type ${option.value}`}
                  data-testid={`deadline-type-${option.value}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </ItemContent>
      </Item>
    </>
  );
}
