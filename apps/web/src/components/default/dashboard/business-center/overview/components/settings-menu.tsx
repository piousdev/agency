import { Fragment } from 'react';

import { IconPencil, IconRotate, IconSettings } from '@tabler/icons-react';

import {
  PRESET_GROUPS,
  getPresetConfig,
} from '@/components/default/dashboard/business-center/overview/constants/preset-config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { PresetMenuItem } from './preset-menu-item';

import type { LayoutPreset } from '@/components/default/dashboard/business-center/overview/types';

interface SettingsMenuProps {
  readonly editMode: boolean;
  readonly onToggleEditMode: () => void;
  readonly onResetLayout: () => void;
  readonly onApplyPreset: (preset: LayoutPreset) => void;
  readonly isCurrentPreset: (preset: LayoutPreset) => boolean;
}

export const SettingsMenu = ({
  editMode,
  onToggleEditMode,
  onResetLayout,
  onApplyPreset,
  isCurrentPreset,
}: SettingsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="size-8 cursor-pointer hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm hover:shadow-secondary/20 transition-all hover:border hover:border-border border border-dashed"
        >
          <IconSettings className="size-4" aria-hidden="true" />
          <span className="sr-only">Dashboard Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-sm font-semibold">Dashboard Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Edit Mode Toggle */}
        <DropdownMenuItem className="cursor-pointer" onClick={onToggleEditMode}>
          <IconPencil className="mr-2 h-4 w-4" aria-hidden="true" />
          {editMode ? 'Exit Edit Mode' : 'Edit Layout'}
        </DropdownMenuItem>

        {/* Reset Layout */}
        <DropdownMenuItem className="cursor-pointer" onClick={onResetLayout}>
          <IconRotate className="mr-2 h-4 w-4" aria-hidden="true" />
          Reset Layout
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-sm font-semibold">Layout Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Preset Groups */}
        {PRESET_GROUPS.map((group, groupIndex) => (
          // eslint-disable-next-line react/no-array-index-key -- Static preset groups
          <Fragment key={groupIndex}>
            {group.presets.map((preset) => {
              const config = getPresetConfig(preset);
              return (
                <PresetMenuItem
                  key={preset}
                  preset={preset}
                  label={config.label}
                  isActive={isCurrentPreset(preset)}
                  onSelect={onApplyPreset}
                />
              );
            })}
            {group.hasSeparatorAfter && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
