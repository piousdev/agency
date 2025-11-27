'use client';

import { useState } from 'react';

import { IconCircleCheck } from '@tabler/icons-react';

import {
  BentoCard,
  BentoCardContent,
  BentoCardFooter,
  BentoCardHeader,
} from '@/components/ui/bento-grid';

import { CardActionButton } from './card-action-button';
import { InfoTooltip } from './info-tooltip';
import { MiniSparkline } from './mini-sparkline';
import { TimeFilter, type TimeFilterOption } from './time-filter';

interface CompletedProjectsCardProps {
  completedCount: number;
  totalProjects: number;
}

// Mock trend data for sparkline - in production this would come from props
const mockCompletedTrend = [3, 5, 4, 7, 6, 8, 9];

export function CompletedProjectsCard({
  completedCount,
  totalProjects,
}: CompletedProjectsCardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('this_year');
  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;

  return (
    <BentoCard
      aria-label={`Completed Projects: ${String(completedCount)} delivered, ${String(completionRate)}% completion rate`}
    >
      {/* Watermark Icon */}
      <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
        <IconCircleCheck className="w-32 h-32" />
      </div>

      <BentoCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-success/10 rounded-lg">
            <IconCircleCheck className="h-4 w-4 text-success" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Completed
            </h3>
            <InfoTooltip content="Successfully delivered projects and overall completion rate." />
          </div>
        </div>
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </BentoCardHeader>

      <BentoCardContent className="flex-1 flex flex-col justify-center gap-3">
        {/* Main Metric with Sparkline */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {completedCount}
            </div>
            <p className="text-xs text-muted-foreground">Total delivered</p>
          </div>
          <MiniSparkline data={mockCompletedTrend} color="var(--success)" />
        </div>

        {/* Completion Rate */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion rate</span>
            <span className="font-semibold text-success">{completionRate}%</span>
          </div>
          <div
            className="h-2 w-full bg-muted/20 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-success transition-all duration-500 motion-reduce:transition-none"
              style={{ width: `${String(completionRate)}%` }}
            />
          </div>
        </div>

        {/* Total Projects */}
        <p className="text-xs text-muted-foreground">of {totalProjects} total projects</p>
      </BentoCardContent>

      <BentoCardFooter>
        <CardActionButton
          href="/dashboard/business-center/recently-completed"
          label="View History"
        />
      </BentoCardFooter>
    </BentoCard>
  );
}
