// components/quick-actions/quick-actions.tsx
import { Button } from '@/components/ui/button';
import { IconLayout } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import type { QuickActionsProps } from '@/components/dashboard/business-center/overview/shared/components/quick-actions/types';
import {
  QUICK_ACTIONS,
  MENU_LABELS,
  MENU_CONFIG,
  TRIGGER_BUTTON_CLASSES,
  ICON_CLASSES,
} from '@/components/dashboard/business-center/overview/shared/components/quick-actions/constants';
import { QuickActionItem } from '@/components/dashboard/business-center/overview/shared/components/quick-actions/components/quick-action-item';
import { CustomizeWidgetsItem } from '@/components/dashboard/business-center/overview/shared/components/quick-actions/components/customize-widgets-item';

export function QuickActions({ className }: QuickActionsProps) {
  const toggleEditMode = useDashboardStore((state) => state.toggleEditMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          aria-label={MENU_LABELS.OPEN_MENU}
          size="icon-sm"
          className={cn(TRIGGER_BUTTON_CLASSES, className)}
        >
          <IconLayout className={ICON_CLASSES.TRIGGER} />
          <span className="sr-only">{MENU_LABELS.SR_ONLY}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={MENU_CONFIG.WIDTH} align={MENU_CONFIG.ALIGN}>
        <DropdownMenuLabel>{MENU_LABELS.QUICK_ACTIONS}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <CustomizeWidgetsItem onToggleEditMode={toggleEditMode} />
        <DropdownMenuSeparator />
        {QUICK_ACTIONS.map((action) => (
          <QuickActionItem key={action.id} action={action} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
