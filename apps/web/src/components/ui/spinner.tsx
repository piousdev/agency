import { IconLoader2 } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number;
}

function Spinner({ className, size }: SpinnerProps) {
  return (
    <IconLoader2
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      size={size}
    />
  );
}

export { Spinner };
