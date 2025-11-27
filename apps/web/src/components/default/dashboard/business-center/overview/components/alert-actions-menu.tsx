import { memo } from 'react';

import { IconDotsVertical, IconX, IconClock } from '@tabler/icons-react';

import { SNOOZE_OPTIONS } from '@/components/default/dashboard/business-center/overview/constants/alert-config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item, ItemContent } from '@/components/ui/item';

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
    <DropdownMenu data-testid="alert-actions-menu">
      <DropdownMenuTrigger asChild data-testid="alert-actions-menu-trigger">
        <Item className="p-0" aria-label="Alert actions" data-testid="alert-actions-menu-trigger">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            aria-label="Alert actions"
            data-testid="alert-actions-menu-trigger-button"
          >
            <IconDotsVertical
              className="size-3.5"
              aria-hidden="true"
              data-testid="alert-actions-menu-trigger-icon"
            />
            <span
              className="sr-only"
              aria-hidden="true"
              data-testid="alert-actions-menu-trigger-sr-only"
            >
              Alert actions
            </span>
          </Button>
        </Item>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="alert-actions-menu-content">
        <DropdownMenuItem onClick={handleDismiss} data-testid="alert-dismiss-menu-item">
          <Item className="p-0" aria-label="Dismiss alert" data-testid="alert-dismiss-menu-item">
            <ItemContent
              className="flex flex-row items-center"
              aria-label="Dismiss alert"
              data-testid="alert-dismiss-menu-item-content"
            >
              <IconX
                className="size-4 mr-2"
                aria-hidden="true"
                data-testid="alert-dismiss-menu-item-icon"
              />
              <span aria-label="Dismiss alert action" data-testid="alert-dismiss-menu-item-label">
                Dismiss alert
              </span>
            </ItemContent>
          </Item>
        </DropdownMenuItem>
        <DropdownMenuSeparator aria-label="Separator" data-testid="alert-actions-menu-separator" />
        {SNOOZE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSnooze(option.value)}
            aria-label="Snooze alert"
            data-testid="alert-snooze-menu-item"
          >
            <Item className="p-0" aria-label="Snooze alert" data-testid="alert-snooze-menu-item">
              <ItemContent
                className="flex flex-row items-center"
                aria-label="Snooze alert"
                data-testid="alert-snooze-menu-item-content"
              >
                <IconClock
                  className="size-4 mr-2"
                  aria-hidden="true"
                  data-testid="alert-snooze-menu-item-icon"
                />
                <span
                  aria-label={`Snooze ${option.label} alert action`}
                  data-testid="alert-snooze-menu-item-label"
                >
                  Snooze {option.label}
                </span>
              </ItemContent>
            </Item>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
