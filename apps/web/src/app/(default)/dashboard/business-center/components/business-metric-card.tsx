import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Icon as TablerIcon } from '@tabler/icons-react';

interface BusinessMetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: TablerIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  action?: React.ReactNode;
}

export function BusinessMetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  action,
}: BusinessMetricCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-md h-full flex flex-col justify-between',
        className
      )}
    >
      {/* Watermark Icon */}
      <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] pointer-events-none">
        <Icon className="w-48 h-48" />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {title}
          </h3>
          <div className="p-2 bg-secondary/50 rounded-full">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Body */}
        <div className="space-y-1">
          <div className="text-4xl font-bold tracking-tight text-foreground">{value}</div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        {/* Trend */}
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                trend.direction === 'up' &&
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
                trend.direction === 'down' &&
                  'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
                trend.direction === 'neutral' &&
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>

      {/* Footer Action */}
      {action && (
        <div className="relative z-10 p-4 mt-auto border-t border-border/40 bg-muted/5">
          {action}
        </div>
      )}
    </Card>
  );
}
