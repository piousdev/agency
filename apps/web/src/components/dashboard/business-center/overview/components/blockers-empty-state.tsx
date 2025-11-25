import { memo } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface BlockersEmptyStateProps {
  readonly className?: string;
}

export const BlockersEmptyState = memo(function BlockersEmptyState({
  className,
}: BlockersEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full text-center', className)}>
      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
        <IconAlertTriangle className="h-6 w-6 text-success" aria-hidden="true" />
      </div>
      <p className="font-medium">No blockers!</p>
      <p className="text-sm text-muted-foreground mt-1">All tasks are progressing smoothly</p>
    </div>
  );
});
