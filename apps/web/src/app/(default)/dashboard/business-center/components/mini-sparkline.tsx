'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  type?: 'area' | 'line';
}

export function MiniSparkline({
  data,
  color = 'var(--primary)',
  type = 'area',
}: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className="w-16 h-8" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient
              id={`sparkGradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fillOpacity={type === 'area' ? 1 : 0}
            fill={`url(#sparkGradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
