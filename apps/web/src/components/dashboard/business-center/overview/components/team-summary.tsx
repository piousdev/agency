import { memo } from 'react';
import type { TeamStats } from '../types';

interface StatIndicatorProps {
  readonly color: string;
  readonly count: number;
  readonly label: string;
}

const StatIndicator = memo(function StatIndicator({ color, count, label }: StatIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs">
        <strong>{count}</strong> {label}
      </span>
    </div>
  );
});

interface TeamSummaryProps {
  readonly stats: TeamStats;
}

export const TeamSummary = memo(function TeamSummary({ stats }: TeamSummaryProps) {
  return (
    <div className="mb-4 pb-4 border-b space-y-2">
      <div className="flex items-center gap-4">
        <StatIndicator color="bg-success" count={stats.available} label="available" />
        <StatIndicator color="bg-warning" count={stats.busy} label="busy" />
        <StatIndicator color="bg-destructive" count={stats.overloaded} label="overloaded" />
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">{stats.totalTasks}</strong> total tasks
        </span>
        <span>
          <strong className="text-foreground">{stats.avgTasks}</strong> avg/member
        </span>
      </div>
    </div>
  );
});
