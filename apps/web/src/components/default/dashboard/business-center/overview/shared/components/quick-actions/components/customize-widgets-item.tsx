import { IconSettings } from '@tabler/icons-react';

import {
  MENU_LABELS,
  ICON_CLASSES,
} from '@/components/default/dashboard/business-center/overview/shared/components/quick-actions/constants';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type CustomizeWidgetsItemProps = Readonly<{
  onToggleEditMode: () => void;
}>;

export function CustomizeWidgetsItem({ onToggleEditMode }: CustomizeWidgetsItemProps) {
  return (
    <DropdownMenuItem className="cursor-pointer" onClick={onToggleEditMode}>
      <IconSettings className={ICON_CLASSES.MENU_ITEM} />
      <span>{MENU_LABELS.CUSTOMIZE_WIDGETS}</span>
    </DropdownMenuItem>
  );
}
