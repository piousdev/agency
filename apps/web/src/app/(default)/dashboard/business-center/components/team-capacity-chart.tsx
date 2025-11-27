'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { BentoCard, BentoCardContent, BentoCardHeader } from '@/components/ui/bento-grid';

interface TeamCapacityChartProps {
  available: number;
  overloaded: number;
  total: number;
}

export function TeamCapacityChart({ available, overloaded, total }: TeamCapacityChartProps) {
  const busy = total - available - overloaded;

  const data = [
    { name: 'Available', value: available, color: 'var(--success)' },
    { name: 'Busy', value: busy, color: 'var(--muted)' },
    { name: 'Overloaded', value: overloaded, color: 'var(--error)' },
  ].filter((item) => item.value > 0);

  return (
    <BentoCard
      className="h-full"
      aria-label={`Team capacity: ${String(available)} available, ${String(busy)} busy, ${String(overloaded)} overloaded out of ${String(total)} total`}
    >
      <BentoCardHeader>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Team Capacity
        </h3>
      </BentoCardHeader>
      <BentoCardContent className="flex-1 flex flex-col justify-center">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationDuration={500}
                className="motion-reduce:animate-none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${String(index)}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--popover-foreground)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '12px',
                }}
                itemStyle={{ color: 'var(--popover-foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2 text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </BentoCardContent>
    </BentoCard>
  );
}
