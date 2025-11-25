import { memo } from 'react';
import { cn } from '@/lib/utils';
import {
  getScoreBadgeClass,
  getScoreIndicator,
} from '@/components/dashboard/business-center/overview/utils/health';

interface HealthScoreHeaderProps {
  readonly score: number;
}

export const HealthScoreHeader = memo(function HealthScoreHeader({
  score,
}: HealthScoreHeaderProps) {
  const badgeClass = getScoreBadgeClass(score);
  const indicator = getScoreIndicator(score);

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-muted-foreground">Overall Health Score</p>
        <p className="text-3xl font-bold">{score}%</p>
      </div>
      <div
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center text-lg font-medium',
          badgeClass
        )}
        aria-label={`Health indicator: ${score >= 90 ? 'excellent' : score >= 75 ? 'good' : 'needs attention'}`}
      >
        {indicator}
      </div>
    </div>
  );
});
