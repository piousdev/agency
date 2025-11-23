'use client';

import { useState } from 'react';
import { IconCalendar } from '@tabler/icons-react';
import {
  BentoCard,
  BentoCardContent,
  BentoCardFooter,
  BentoCardHeader,
} from '@/components/ui/bento-grid';
import { TimeFilter, type TimeFilterOption } from './time-filter';
import { InfoTooltip } from './info-tooltip';
import { CardActionButton } from './card-action-button';
import { MiniSparkline } from './mini-sparkline';

interface DeliverablesCardProps {
  upcomingCount: number;
  overdueCount: number;
  thisWeekCount: number;
}

// Mock trend data for sparkline - in production this would come from props
const mockDeliverablesTrend = [8, 12, 10, 15, 11, 9, 13];

export function DeliverablesCard({
  upcomingCount,
  overdueCount,
  thisWeekCount,
}: DeliverablesCardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('this_month');
  const totalDeliverables = upcomingCount + overdueCount;

  return (
    <BentoCard
      aria-label={`Deliverables: ${totalDeliverables} total, ${overdueCount} overdue, ${thisWeekCount} due this week`}
    >
      {/* Watermark Icon */}
      <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
        <IconCalendar className="w-32 h-32" />
      </div>

      <BentoCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-info/10 rounded-lg">
            <IconCalendar className="h-4 w-4 text-info" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Deliverables
            </h3>
            <InfoTooltip content="Project deliveries scheduled and their current status." />
          </div>
        </div>
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </BentoCardHeader>

      <BentoCardContent className="flex-1 flex flex-col justify-center gap-3">
        {/* Main metric with Sparkline */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {totalDeliverables}
            </div>
            <p className="text-xs text-muted-foreground truncate">Upcoming deliveries</p>
          </div>
          <div className="shrink-0 hidden sm:block">
            <MiniSparkline data={mockDeliverablesTrend} color="var(--info)" />
          </div>
        </div>

        {/* Status breakdown */}
        <div className="space-y-1.5">
          {overdueCount > 0 && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="text-muted-foreground">Overdue</span>
              </div>
              <span className="font-semibold text-error">{overdueCount}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">This week</span>
            </div>
            <span className="font-semibold text-warning">{thisWeekCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span className="text-muted-foreground">Later</span>
            </div>
            <span className="font-semibold text-muted-foreground">
              {upcomingCount - thisWeekCount}
            </span>
          </div>
        </div>
      </BentoCardContent>

      <BentoCardFooter>
        <CardActionButton href="/dashboard/business-center/deliverables" label="Inspect" />
      </BentoCardFooter>
    </BentoCard>
  );
}
