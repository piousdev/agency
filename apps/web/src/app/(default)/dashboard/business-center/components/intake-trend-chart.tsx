'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BentoCard, BentoCardContent, BentoCardHeader } from '@/components/ui/bento-grid';

// Mock data generator since we don't have historical data in the context
const generateTrendData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 2,
  }));
};

export function IntakeTrendChart() {
  const data = generateTrendData();

  return (
    <BentoCard className="h-full" aria-label="Intake volume trend chart showing the last 7 days">
      <BentoCardHeader>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Intake Volume (7 Days)
        </h3>
      </BentoCardHeader>
      <BentoCardContent className="flex-1 min-h-[180px]">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
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
                fill="url(#colorValue)"
                animationDuration={500}
                className="motion-reduce:animate-none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BentoCardContent>
    </BentoCard>
  );
}
