'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconBell,
  IconBellOff,
  IconX,
  IconClock,
  IconExternalLink,
  IconDotsVertical,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useRealtimeAlerts } from '@/lib/hooks/use-socket';
import { ConnectionDot } from '../shared/connection-status';
import type { AlertPayload } from '@/lib/socket';

// Snooze duration options in milliseconds
const SNOOZE_OPTIONS = [
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '4 hours', value: 4 * 60 * 60 * 1000 },
  { label: 'Until tomorrow', value: 24 * 60 * 60 * 1000 },
];

export interface CriticalAlertsWidgetProps {
  className?: string;
}

export function CriticalAlertsWidget({ className }: CriticalAlertsWidgetProps) {
  const { alerts, criticalAlerts, warningAlerts, infoAlerts, isConnected, dismiss, snooze } =
    useRealtimeAlerts();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // Get filtered alerts
  const filteredAlerts =
    filter === 'all'
      ? alerts
      : filter === 'critical'
        ? criticalAlerts
        : filter === 'warning'
          ? warningAlerts
          : infoAlerts;

  // Alert type config
  const alertTypeConfig: Record<
    AlertPayload['type'],
    {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bgColor: string;
      borderColor: string;
    }
  > = {
    critical: {
      icon: IconAlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-l-destructive',
    },
    warning: {
      icon: IconAlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-l-warning',
    },
    info: {
      icon: IconInfoCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-l-primary',
    },
  };

  // Entity type icons
  const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    project: IconExternalLink,
    ticket: IconExternalLink,
    client: IconExternalLink,
    sprint: IconExternalLink,
    system: IconAlertCircle,
  };

  if (!isConnected && alerts.length === 0) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconBellOff className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-medium">Real-time Alerts</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isConnected ? 'No alerts at this time' : 'Connecting to real-time updates...'}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <ConnectionDot />
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconCheck className="h-8 w-8 text-success mb-2" />
        <p className="font-medium">All Clear</p>
        <p className="text-sm text-muted-foreground mt-1">No active alerts</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <ConnectionDot />
          <span>Monitoring for new alerts</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with counts and filter */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconBell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{alerts.length} Active</span>
          <ConnectionDot className="ml-1" />
        </div>
        <div className="flex items-center gap-1">
          {criticalAlerts.length > 0 && (
            <Badge
              variant={filter === 'critical' ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs',
                filter !== 'critical' && 'text-destructive border-destructive/50'
              )}
              onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
            >
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge
              variant={filter === 'warning' ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs',
                filter !== 'warning' && 'text-warning border-warning/50'
              )}
              onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
            >
              {warningAlerts.length} Warning
            </Badge>
          )}
        </div>
      </div>

      {/* Alert list */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const config = alertTypeConfig[alert.type];
            const Icon = config.icon;
            const EntityIcon = entityIcons[alert.entityType] || IconExternalLink;

            return (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 animate-in fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none',
                  config.bgColor,
                  config.borderColor
                )}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                        <IconDotsVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">Alert actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => dismiss(alert.id)}>
                        <IconX className="h-4 w-4 mr-2" />
                        Dismiss
                      </DropdownMenuItem>
                      {SNOOZE_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => snooze(alert.id, option.value)}
                        >
                          <IconClock className="h-4 w-4 mr-2" />
                          Snooze {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {alert.entityName && (
                      <span className="flex items-center gap-1">
                        <EntityIcon className="h-3 w-3" />
                        {alert.entityName}
                      </span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {alert.actionUrl && (
                    <Link
                      href={alert.actionUrl}
                      className="text-xs text-primary hover:underline flex items-center gap-0.5"
                    >
                      View
                      <IconExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick dismiss all */}
      {alerts.length > 1 && (
        <div className="pt-3 mt-auto border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => alerts.forEach((a) => dismiss(a.id))}
          >
            <IconX className="h-4 w-4 mr-2" />
            Dismiss all alerts
          </Button>
        </div>
      )}
    </div>
  );
}
