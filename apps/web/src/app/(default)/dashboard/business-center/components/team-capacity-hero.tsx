'use client';

import { useState } from 'react';

import { IconUsers } from '@tabler/icons-react';

import {
  BentoCard,
  BentoCardContent,
  BentoCardFooter,
  BentoCardHeader,
} from '@/components/ui/bento-grid';
import { cn } from '@/lib/utils';

import { CardActionButton } from './card-action-button';
import { InfoTooltip } from './info-tooltip';
import { MiniSparkline } from './mini-sparkline';
import { TimeFilter, type TimeFilterOption } from './time-filter';

interface TeamCapacityHeroProps {
  available: number;
  atCapacity: number;
  overloaded: number;
  total: number;
}

type CapacityStatus = 'available' | 'at_capacity' | 'overloaded';

const statusConfig: Record<CapacityStatus, { label: string; colorClass: string; bgClass: string }> =
  {
    available: {
      label: 'Available',
      colorClass: 'text-success',
      bgClass: 'bg-success',
    },
    at_capacity: {
      label: 'At Capacity',
      colorClass: 'text-warning',
      bgClass: 'bg-warning',
    },
    overloaded: {
      label: 'Overloaded',
      colorClass: 'text-error',
      bgClass: 'bg-error',
    },
  };

// Mock trend data for sparkline - in production this would come from props
const mockTrendData = [65, 70, 68, 72, 75, 73, 78];

export function TeamCapacityHero({
  available,
  atCapacity,
  overloaded,
  total,
}: TeamCapacityHeroProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('this_week');
  const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;

  const segments = [
    { status: 'available' as CapacityStatus, count: available },
    { status: 'at_capacity' as CapacityStatus, count: atCapacity },
    { status: 'overloaded' as CapacityStatus, count: overloaded },
  ].filter((s) => s.count > 0);

  return (
    <BentoCard aria-label={`Team Capacity: ${String(availabilityRate)}% available`}>
      {/* Watermark Icon */}
      <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
        <IconUsers className="w-32 h-32" />
      </div>

      <BentoCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <IconUsers className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Team Capacity
            </h3>
            <InfoTooltip content="Current workload distribution across team members." />
          </div>
        </div>
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </BentoCardHeader>

      <BentoCardContent className="flex-1 flex flex-col justify-center gap-3">
        {/* Main Metric with Sparkline */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {availabilityRate}%
            </div>
            <p className="text-xs text-muted-foreground truncate">{total} team members</p>
          </div>
          <div className="shrink-0 hidden sm:block">
            <MiniSparkline data={mockTrendData} color="var(--success)" />
          </div>
        </div>

        {/* Segmented Bar */}
        <div
          className="h-2 w-full bg-muted/20 rounded-full overflow-hidden flex"
          role="img"
          aria-label={`Capacity: ${String(available)} available, ${String(atCapacity)} at capacity, ${String(overloaded)} overloaded`}
        >
          {segments.map((segment) => {
            const width = total > 0 ? (segment.count / total) * 100 : 0;
            const config = statusConfig[segment.status];
            return (
              <div
                key={segment.status}
                className={cn(
                  'h-full transition-all duration-500 motion-reduce:transition-none',
                  config.bgClass
                )}
                style={{ width: `${String(width)}%` }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {segments.map((segment) => {
            const config = statusConfig[segment.status];
            return (
              <div key={segment.status} className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', config.bgClass)} />
                <span className={cn('font-medium', config.colorClass)}>{segment.count}</span>
              </div>
            );
          })}
        </div>
      </BentoCardContent>

      <BentoCardFooter>
        <CardActionButton href="/dashboard/business-center/team-capacity" label="Inspect" />
      </BentoCardFooter>
    </BentoCard>
  );
}
