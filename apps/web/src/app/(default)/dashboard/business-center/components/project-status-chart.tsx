'use client';

import { cn } from '@/lib/utils';
import { BentoCard, BentoCardContent, BentoCardHeader } from '@/components/ui/bento-grid';

interface ProjectStatusChartProps {
  contentCount: number;
  softwareCount: number;
}

export function ProjectStatusChart({ contentCount, softwareCount }: ProjectStatusChartProps) {
  // Use a minimum scale of 10 to prevent small numbers from looking like 100% capacity
  const maxValue = Math.max(contentCount, softwareCount, 10);

  const items = [
    {
      label: 'Content',
      value: contentCount,
      color: 'bg-chart-1',
      width: `${(contentCount / maxValue) * 100}%`,
    },
    {
      label: 'Software',
      value: softwareCount,
      color: 'bg-chart-2',
      width: `${(softwareCount / maxValue) * 100}%`,
    },
  ];

  return (
    <BentoCard
      className="h-full"
      aria-label={`Active projects: ${contentCount} content, ${softwareCount} software`}
    >
      <BentoCardHeader>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Active Projects
        </h3>
      </BentoCardHeader>
      <BentoCardContent className="flex-1 flex flex-col justify-center gap-8">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">{item.label}</span>
              <span className="font-bold text-foreground">{item.value}</span>
            </div>
            <div
              className="h-4 w-full bg-muted/20 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={maxValue}
              aria-label={`${item.label} projects: ${item.value}`}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 motion-reduce:transition-none',
                  item.color
                )}
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
      </BentoCardContent>
    </BentoCard>
  );
}
