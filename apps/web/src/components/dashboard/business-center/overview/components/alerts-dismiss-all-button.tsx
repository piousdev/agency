import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { IconX } from '@tabler/icons-react';

interface DismissAllButtonProps {
  readonly onDismissAll: () => void;
}

export const DismissAllButton = memo(function DismissAllButton({
  onDismissAll,
}: DismissAllButtonProps) {
  return (
    <div className="pt-3 mt-auto border-t">
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground"
        onClick={onDismissAll}
      >
        <IconX className="h-4 w-4 mr-2" aria-hidden="true" />
        Dismiss all alerts
      </Button>
    </div>
  );
});
