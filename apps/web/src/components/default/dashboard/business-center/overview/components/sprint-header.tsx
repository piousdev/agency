import { memo } from 'react';

import { IconFlame } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';

interface SprintHeaderProps {
  readonly name: string;
  readonly projectName: string;
  readonly daysRemaining: number;
  readonly isOnTrack: boolean;
}

export const SprintHeader = memo(function SprintHeader({
  name,
  projectName,
  daysRemaining,
  isOnTrack,
}: SprintHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <IconFlame className="h-4 w-4 text-warning" aria-hidden="true" />
          <span className="font-medium">{name}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
      </div>
      <Badge variant={isOnTrack ? 'default' : 'destructive'}>{daysRemaining}d left</Badge>
    </div>
  );
});
