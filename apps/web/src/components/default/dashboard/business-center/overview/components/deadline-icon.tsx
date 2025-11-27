import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';

import { ItemMedia } from '@/components/ui/item';
import { cn } from '@/lib/utils';

interface DeadlineIconProps {
  readonly overdue: boolean;
}

export function DeadlineIcon({ overdue }: DeadlineIconProps) {
  return (
    <ItemMedia
      className={cn('mt-1 p-2 rounded-lg', overdue ? 'bg-destructive/10' : 'bg-muted')}
      data-testid="deadline-icon"
      aria-hidden
    >
      {overdue ? (
        <IconAlertTriangle
          className="size-4 text-destructive"
          data-testid="deadline-icon-overdue"
        />
      ) : (
        <IconCalendar className="size-4 text-muted-foreground" data-testid="deadline-icon-normal" />
      )}
    </ItemMedia>
  );
}
