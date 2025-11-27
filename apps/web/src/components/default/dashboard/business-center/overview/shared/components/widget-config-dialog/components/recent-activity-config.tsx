// components/widget-config-dialog/config-fields/recent-activity-config.tsx
'use client';

import {
  ACTIVITY_FILTERS,
  SLIDER_CONFIGS,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';
import { Item, ItemContent } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import type { ConfigFieldsProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import type { RecentActivityConfig } from '@/lib/stores/dashboard-store';

export function RecentActivityConfigFields({
  config,
  updateConfig,
}: ConfigFieldsProps<RecentActivityConfig>) {
  return (
    <>
      <Item className="p-0" aria-label="Default filter" data-testid="default-filter">
        <ItemContent
          aria-label="Default filter ItemContent"
          data-testid="default-filter-item-content"
          className="space-y-2"
        >
          <Label
            htmlFor="filterCategory"
            aria-label="Default filter label"
            data-testid="default-filter-label"
          >
            Default Filter
          </Label>
          <Select
            value={config.filterCategory}
            onValueChange={(value) => updateConfig('filterCategory', value)}
            aria-label="Default filter Select"
            data-testid="default-filter-select"
          >
            <SelectTrigger
              id="filterCategory"
              aria-label="Default filter trigger"
              data-testid="default-filter-trigger"
            >
              <SelectValue
                placeholder="Select filter"
                aria-label="Default filter value"
                data-testid="default-filter-value"
              />
            </SelectTrigger>
            <SelectContent
              aria-label="Default filter SelectContent"
              data-testid="default-filter-select-content"
            >
              {ACTIVITY_FILTERS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  aria-label="Default filter SelectItem"
                  data-testid="default-filter-select-item"
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
