import { memo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { IconDotsVertical, IconX, IconClock } from '@tabler/icons-react';
import { SNOOZE_OPTIONS } from '@/components/dashboard/business-center/overview/constants/alert-config';

interface AlertActionsMenuProps {
  readonly alertId: string;
  readonly onDismiss: (alertId: string) => void;
  readonly onSnooze: (alertId: string, duration: number) => void;
}

export const AlertActionsMenu = memo(function AlertActionsMenu({
  alertId,
  onDismiss,
  onSnooze,
}: AlertActionsMenuProps) {
  const handleDismiss = () => onDismiss(alertId);
  const handleSnooze = (duration: number) => onSnooze(alertId, duration);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          <IconDotsVertical className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Alert actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDismiss}>
          <IconX className="h-4 w-4 mr-2" aria-hidden="true" />
          Dismiss
        </DropdownMenuItem>
        {SNOOZE_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => handleSnooze(option.value)}>
            <IconClock className="h-4 w-4 mr-2" aria-hidden="true" />
            Snooze {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
