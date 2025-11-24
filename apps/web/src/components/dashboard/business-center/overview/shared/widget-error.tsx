'use client';

import { Button } from '@/components/ui/button';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface WidgetErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error state component for dashboard widgets
 * Displays error message with optional retry action
 */
export function WidgetError({
  title = 'Failed to load',
  message = 'Something went wrong while loading this widget.',
  onRetry,
  className,
}: WidgetErrorProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center h-full text-center p-6', className)}
    >
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <IconAlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-2">
          <IconRefresh className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Empty state for widgets with no data
 */
export function WidgetEmpty({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center h-full text-center p-6', className)}
    >
      {icon && (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-sm">{title}</h3>
      {message && <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
