import { memo } from 'react';
import { Progress } from '@/components/ui/progress';

interface SprintProgressProps {
  readonly progress: number;
}

export const SprintProgress = memo(function SprintProgress({ progress }: SprintProgressProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
});
