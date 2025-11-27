

import { IconX } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent } from '@/components/ui/item';

interface DismissAllButtonProps {
  readonly onDismissAll: () => void;
}

export const DismissAllButton = ({ onDismissAll }: DismissAllButtonProps): React.JSX.Element => {
  return (
    <Item className="mt-2 p-0" aria-label="Dismiss all alerts" data-testid="dismiss-all-button">
      <ItemContent
        className="flex items-center gap-2 w-full"
        aria-label="Dismiss all alerts"
        data-testid="dismiss-all-button-content"
      >
        <Button
          variant="ghost"
          size="default"
          className="w-full text-muted-foreground cursor-pointer"
          onClick={onDismissAll}
          aria-label="Dismiss all alerts"
          data-testid="dismiss-all-button-button"
        >
          <ItemActions aria-label="Dismiss all alerts" data-testid="dismiss-all-button-actions">
            <IconX
              className="size-4 mr-2"
              aria-hidden="true"
              data-testid="dismiss-all-button-icon"
            />
            Dismiss all alerts
          </ItemActions>
        </Button>
      </ItemContent>
    </Item>
  );
};
