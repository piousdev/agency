import { memo } from 'react';

import {
  getScoreBadgeClass,
  getScoreIndicator,
} from '@/components/default/dashboard/business-center/overview/utils/health';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';

interface HealthScoreHeaderProps {
  readonly score: number;
}

export const HealthScoreHeader = memo(function HealthScoreHeader({
  score,
}: HealthScoreHeaderProps) {
  const badgeClass = getScoreBadgeClass(score);
  const Indicator = getScoreIndicator(score);

  const indicator = typeof Indicator === 'string' ? Indicator : <Indicator />;

  return (
    <Item
      className="flex items-center justify-between mb-4 p-2"
      aria-label="Health score header"
      data-testid="health-score-header"
    >
      <ItemContent>
        <ItemTitle
          className="text-sm text-muted-foreground"
          aria-label="Health score header title"
          data-testid="health-score-header-title"
        >
          Overall Health Score
        </ItemTitle>
        <ItemDescription
          className="text-3xl text-foreground font-bold"
          aria-label="Health score description"
          data-testid="health-score-description"
        >
          {score}%
        </ItemDescription>
      </ItemContent>
      <ItemMedia>
        <div
          className={cn(
            'size-12 rounded-full flex items-center justify-center text-lg font-medium',
            badgeClass
          )}
          aria-label={`Health indicator: ${score >= 90 ? 'excellent' : score >= 75 ? 'good' : 'needs attention'} badge`}
          data-testid="health-score-indicator-badge"
        >
          {indicator}
        </div>
      </ItemMedia>
    </Item>
  );
});
