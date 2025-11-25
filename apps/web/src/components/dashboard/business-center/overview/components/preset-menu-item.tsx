import { memo } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { IconCheck } from '@tabler/icons-react';
import type { LayoutPreset } from '@/components/dashboard/business-center/overview/types';

interface PresetMenuItemProps {
  readonly preset: LayoutPreset;
  readonly label: string;
  readonly isActive: boolean;
  readonly onSelect: (preset: LayoutPreset) => void;
  readonly showCheckmark?: boolean;
}

export const PresetMenuItem = memo(function PresetMenuItem({
  preset,
  label,
  isActive,
  onSelect,
  showCheckmark = true,
}: PresetMenuItemProps) {
  const handleClick = () => onSelect(preset);

  return (
    <DropdownMenuItem className="cursor-pointer justify-between" onClick={handleClick}>
      {label}
      {showCheckmark && isActive && <IconCheck className="h-4 w-4" aria-hidden="true" />}
    </DropdownMenuItem>
  );
});
