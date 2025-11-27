'use client';

import {
  PRIORITY_FILTERS,
  SLIDER_CONFIGS,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';
import { Item, ItemActions, ItemContent } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

import type { ConfigFieldsProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import type { MyWorkTodayConfig } from '@/lib/stores/dashboard-store';

export function MyWorkTodayConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<MyWorkTodayConfig>) {
  return (
    <>
      <Item
        className="flex items-center justify-between p-0"
        aria-label="Show completed tasks item"
        data-testid="show-completed-tasks-item"
      >
        <ItemContent
          aria-label="Show completed tasks content"
          data-testid="show-completed-tasks-content"
        >
          <Label
            htmlFor="showCompleted"
            aria-label="Show completed tasks label"
            data-testid="show-completed-tasks-label"
          >
            Show Completed Tasks
          </Label>
        </ItemContent>
        <ItemActions
          aria-label="Show completed tasks actions"
          data-testid="show-completed-tasks-actions"
        >
          <Switch
            id="showCompleted"
            checked={config.showCompleted}
            onCheckedChange={(checked) => updateConfig('showCompleted', checked)}
            aria-label="Show completed tasks switch"
            data-testid="show-completed-tasks-switch"
          />
        </ItemActions>
      </Item>
      <Item className="p-0" aria-label="Priority filter item" data-testid="priority-filter-item">
        <ItemContent
          aria-label="Priority filter content"
          data-testid="priority-filter-content"
          className="space-y-2"
        >
          <Label
            htmlFor="priorityFilter"
            aria-label="Priority filter label"
            data-testid="priority-filter-label"
          >
            Priority Filter
          </Label>
          <Select
            value={config.priorityFilter}
            onValueChange={(value) => updateConfig('priorityFilter', value)}
            aria-label="Priority filter select"
            data-testid="priority-filter-select"
          >
            <SelectTrigger
              id="priorityFilter"
              aria-label="Priority filter trigger"
              data-testid="priority-filter-trigger"
            >
              <SelectValue
                placeholder="Select priority"
                aria-label="Priority filter value"
                data-testid="priority-filter-value"
              />
            </SelectTrigger>
            <SelectContent
              aria-label="Priority filter SelectContent"
              data-testid="priority-filter-select-content"
            >
              {PRIORITY_FILTERS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  aria-label="Priority filter SelectItem"
                  data-testid="priority-filter-select-item"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ItemContent>
      </Item>
      <Item className="p-0" aria-label="Max items" data-testid="max-items">
        <ItemContent
          aria-label="Max items ItemContent"
          data-testid="max-items-item-content"
          className="space-y-2"
        >
          <Label htmlFor="maxItems" aria-label="Max items label" data-testid="max-items-label">
            Max Items: {config.maxItems}
          </Label>
          <Slider
            value={[config.maxItems]}
            onValueChange={([value]) => updateConfig('maxItems', value)}
            min={SLIDER_CONFIGS.MAX_ITEMS.MIN}
            max={SLIDER_CONFIGS.MAX_ITEMS.MAX}
            step={SLIDER_CONFIGS.MAX_ITEMS.STEP}
            aria-label="Max items Slider"
            data-testid="max-items-slider"
          />
        </ItemContent>
      </Item>
    </>
  );
}
