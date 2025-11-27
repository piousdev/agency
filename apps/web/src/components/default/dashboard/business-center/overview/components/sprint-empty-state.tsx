import { memo } from 'react';

import { IconFlame } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

interface SprintEmptyStateProps {
  readonly className?: string;
}

export const SprintEmptyState = memo(function SprintEmptyState({
  className,
}: SprintEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full text-center', className)}>
      <IconFlame className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
      <p className="font-medium">No Active Sprint</p>
      <p className="text-sm text-muted-foreground mt-1">Start a new sprint to track progress</p>
    </div>
  );
});
