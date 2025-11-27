import type { TeamStats } from '../types';

interface StatIndicatorProps {
  readonly color: string;
  readonly count: number;
  readonly label: string;
}

const StatIndicator = ({ color, count, label }: StatIndicatorProps) => {
  return (
    <div className="flex items-center gap-2" data-testid="stat-indicator-container">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} data-testid="stat-indicator-dot" />
      <span className="text-xs" data-testid="stat-indicator-text">
        <strong data-testid="stat-indicator-count">{count}</strong>{' '}
        <span data-testid="stat-indicator-label">{label}</span>
      </span>
    </div>
  );
};

interface TeamSummaryProps {
  readonly stats: TeamStats;
}

export const TeamSummary = ({ stats }: TeamSummaryProps) => {
  return (
    <div className="mb-4 pb-4 border-b space-y-2 px-2" data-testid="team-summary-container">
      <div className="flex items-center gap-4">
        <StatIndicator color="bg-success" count={stats.available} label="available" />
        <StatIndicator color="bg-warning" count={stats.busy} label="busy" />
        <StatIndicator color="bg-destructive" count={stats.overloaded} label="overloaded" />
      </div>
      <div
        className="flex items-center gap-4 text-xs text-muted-foreground"
        data-testid="stat-indicator-text"
      >
        <span>
          <strong className="text-foreground" data-testid="stat-indicator-total-tasks">
            {stats.totalTasks}
          </strong>{' '}
          <span data-testid="stat-indicator-total-tasks-text">total tasks</span>
        </span>
        <span>
          <strong className="text-foreground" data-testid="stat-indicator-avg-tasks">
            {stats.avgTasks}
          </strong>{' '}
          <span data-testid="stat-indicator-avg-tasks-text">avg/member</span>
        </span>
      </div>
    </div>
  );
};
