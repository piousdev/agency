'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IconArrowRight,
  IconAlertTriangle,
  IconExclamationCircle,
  IconArrowUp,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import { toast } from 'sonner';

type BlockerSeverity = 'critical' | 'high' | 'medium';

interface BlockerItem {
  id: string;
  title: string;
  severity: BlockerSeverity;
  projectName: string;
  daysBlocked: number;
  assignee?: string;
  reason?: string;
}

// Mock data
const MOCK_BLOCKERS: BlockerItem[] = [
  {
    id: '1',
    title: 'Waiting for client API credentials',
    severity: 'critical',
    projectName: 'TechCorp Mobile App',
    daysBlocked: 3,
    reason: 'External dependency',
  },
  {
    id: '2',
    title: 'Design approval pending',
    severity: 'high',
    projectName: 'Acme Website Redesign',
    daysBlocked: 2,
    assignee: 'Sarah Chen',
    reason: 'Client review',
  },
  {
    id: '3',
    title: 'Database migration conflict',
    severity: 'medium',
    projectName: 'Internal Dashboard',
    daysBlocked: 1,
    assignee: 'Mike Johnson',
    reason: 'Technical issue',
  },
];

export interface BlockersWidgetProps {
  blockers?: BlockerItem[];
  className?: string;
}

export function BlockersWidget({ blockers: propBlockers, className }: BlockersWidgetProps) {
  const overviewData = useOverviewData();

  // Use context data if available
  const blockers = overviewData?.blockers || propBlockers || MOCK_BLOCKERS;

  // Blocker escalation action
  const handleEscalate = (blocker: BlockerItem) => {
    toast.warning(`Escalated: "${blocker.title}"`, {
      description: `This blocker has been escalated to management. Project: ${blocker.projectName}`,
      action: {
        label: 'Undo',
        onClick: () => toast.info('Escalation cancelled'),
      },
    });
  };

  // Blocker resolution action
  const handleResolve = (blocker: BlockerItem) => {
    toast.success(`Resolved: "${blocker.title}"`, {
      description: `Blocker marked as resolved after ${blocker.daysBlocked} days`,
    });
  };
  const severityColors: Record<BlockerSeverity, string> = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-warning/10 text-warning border-warning/20',
    medium: 'bg-primary/10 text-primary border-primary/20',
  };

  const severityIcons: Record<BlockerSeverity, React.ComponentType<{ className?: string }>> = {
    critical: IconExclamationCircle,
    high: IconAlertTriangle,
    medium: IconAlertTriangle,
  };

  if (blockers.length === 0) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
          <IconAlertTriangle className="h-6 w-6 text-success" />
        </div>
        <p className="font-medium">No blockers!</p>
        <p className="text-sm text-muted-foreground mt-1">All tasks are progressing smoothly</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Summary */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <IconExclamationCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="text-2xl font-bold">{blockers.length}</p>
          <p className="text-xs text-muted-foreground">Active blockers</p>
        </div>
      </div>

      {/* Blockers List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {blockers.map((blocker) => {
            const Icon = severityIcons[blocker.severity];
            return (
              <div
                key={blocker.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 p-1.5 rounded-md',
                      severityColors[blocker.severity].split(' ')[0]
                    )}
                  >
                    <Icon
                      className={cn('h-3.5 w-3.5', severityColors[blocker.severity].split(' ')[1])}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{blocker.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{blocker.projectName}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', severityColors[blocker.severity])}
                  >
                    {blocker.daysBlocked}d
                  </Badge>
                </div>
                {blocker.reason && (
                  <p className="text-xs text-muted-foreground mt-2 ml-10">{blocker.reason}</p>
                )}
                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-2 ml-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleEscalate(blocker)}
                  >
                    <IconArrowUp className="h-3 w-3 mr-1" />
                    Escalate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-success hover:text-success hover:bg-success/10"
                    onClick={() => handleResolve(blocker)}
                  >
                    <IconCheck className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/issues?filter=blocked">
            View all blockers
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
