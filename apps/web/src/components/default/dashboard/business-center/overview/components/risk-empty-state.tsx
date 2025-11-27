import { memo } from 'react';

import { IconShieldCheck } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

interface RiskEmptyStateProps {
  readonly className?: string;
}

export const RiskEmptyState = memo(function RiskEmptyState({ className }: RiskEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full text-center', className)}>
      <IconShieldCheck className="h-8 w-8 text-success mb-2" aria-hidden="true" />
      <p className="font-medium">No Active Risks</p>
      <p className="text-sm text-muted-foreground mt-1">All projects are on track</p>
    </div>
  );
});
