'use client';

import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IconInbox, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  BentoCard,
  BentoCardContent,
  BentoCardFooter,
  BentoCardHeader,
} from '@/components/ui/bento-grid';
import { TimePeriodSelector, type TimePeriod } from './time-period-selector';
import { InfoTooltip } from './info-tooltip';
import { CardActionButton } from './card-action-button';

interface IntakeQueueHeroProps {
  count: number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

// Generate mock trend data for sparkline
const generateTrendData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 2,
  }));
};

export function IntakeQueueHero({ count, trend }: IntakeQueueHeroProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1W');
  const data = generateTrendData();

  return (
    <BentoCard colSpan="2" isHero aria-label={`Intake Queue: ${count} pending requests`}>
      {/* Watermark Icon */}
      <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
        <IconInbox className="w-56 h-56" />
      </div>

      <BentoCardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <IconInbox className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Intake Queue
            </h3>
            <InfoTooltip content="New project requests awaiting review and assignment to team members." />
          </div>
        </div>
        <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
      </BentoCardHeader>

      <BentoCardContent className="flex items-center gap-4">
        {/* Left side - Main Metric (30%) */}
        <div className="w-[30%] shrink-0">
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            {count}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                  trend.direction === 'up' && 'bg-warning/10 text-warning',
                  trend.direction === 'down' && 'bg-success/10 text-success',
                  trend.direction === 'neutral' && 'bg-muted text-muted-foreground'
                )}
              >
                {trend.direction === 'up' ? (
                  <IconTrendingUp className="h-3 w-3" />
                ) : trend.direction === 'down' ? (
                  <IconTrendingDown className="h-3 w-3" />
                ) : null}
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        </div>

        {/* Right side - Sparkline Chart (70%) */}
        <div className="flex-1 h-20" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id="intakeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--popover-foreground)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '12px',
                }}
                cursor={{
                  stroke: 'var(--muted-foreground)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#intakeGradient)"
                animationDuration={500}
                className="motion-reduce:animate-none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BentoCardContent>

      <BentoCardFooter>
        <CardActionButton href="/dashboard/business-center/intake-queue" label="Process Queue" />
      </BentoCardFooter>
    </BentoCard>
  );
}
