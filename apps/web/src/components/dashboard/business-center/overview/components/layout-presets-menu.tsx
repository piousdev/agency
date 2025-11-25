import { memo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { IconLayout, IconRotate } from '@tabler/icons-react';
import { PRESET_CONFIGS } from '@/components/dashboard/business-center/overview/constants/preset-config';
import type { LayoutPreset } from '@/components/dashboard/business-center/overview/types';

interface LayoutPresetsMenuProps {
  readonly onApplyPreset: (preset: LayoutPreset) => void;
  readonly onResetToDefault: () => void;
}

export const LayoutPresetsMenu = ({ onApplyPreset, onResetToDefault }: LayoutPresetsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <IconLayout className="h-4 w-4" aria-hidden="true" />
          Layout Presets
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Apply Preset</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PRESET_CONFIGS.map((config) => (
          <DropdownMenuItem key={config.id} onClick={() => onApplyPreset(config.id)}>
            {config.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onResetToDefault}>
          <IconRotate className="h-4 w-4 mr-2" aria-hidden="true" />
          Reset to My Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
