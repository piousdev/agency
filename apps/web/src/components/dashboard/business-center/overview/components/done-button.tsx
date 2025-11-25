import { Button } from '@/components/ui/button';
import { IconCheck } from '@tabler/icons-react';

interface DoneButtonProps {
  readonly onClick: () => void;
}

export const DoneButton = ({ onClick }: DoneButtonProps) => {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className="gap-2 cursor-pointer shadow-sm hover:shadow-sm hover:shadow-secondary/20 transition-all"
    >
      <IconCheck className="h-4 w-4" aria-hidden="true" />
      Done
    </Button>
  );
};
