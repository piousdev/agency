'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconArrowRight, IconCalendar, IconAlertTriangle, IconDownload } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import { toast } from 'sonner';

interface DeadlineItem {
  id: string;
  title: string;
  type: 'project' | 'milestone' | 'ticket' | 'deliverable';
  dueAt: string;
  projectName?: string;
  clientName?: string;
  isOverdue?: boolean;
}

// Mock data - will be replaced with real data from server
const MOCK_DEADLINES: DeadlineItem[] = [
  {
    id: '1',
    title: 'Homepage Design Review',
    type: 'milestone',
    dueAt: new Date().toISOString(),
    projectName: 'Acme Website Redesign',
    clientName: 'Acme Corp',
    isOverdue: false,
  },
  {
    id: '2',
    title: 'Phase 1 Delivery',
    type: 'deliverable',
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    projectName: 'TechCorp Mobile App',
    clientName: 'TechCorp',
  },
  {
    id: '3',
    title: 'Sprint 3 End',
    type: 'milestone',
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    projectName: 'Internal Dashboard',
  },
  {
    id: '4',
    title: 'Final Presentation',
    type: 'project',
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    projectName: 'Acme Website Redesign',
    clientName: 'Acme Corp',
  },
];

export interface UpcomingDeadlinesWidgetProps {
  deadlines?: DeadlineItem[];
  className?: string;
}

export function UpcomingDeadlinesWidget({
  deadlines: propDeadlines,
  className,
}: UpcomingDeadlinesWidgetProps) {
  const overviewData = useOverviewData();

  // Transform server data to widget format if available
  const deadlines: DeadlineItem[] = overviewData?.deadlines
    ? overviewData.deadlines.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type === 'task' ? 'ticket' : d.type, // Map 'task' to 'ticket'
        dueAt: d.dueDate,
        projectName: d.projectName || undefined,
        clientName: undefined,
        isOverdue: new Date(d.dueDate) < new Date(),
      }))
    : propDeadlines || MOCK_DEADLINES;

  const typeColors: Record<string, string> = {
    project: 'bg-accent/10 text-accent-foreground border-accent/20',
    milestone: 'bg-primary/10 text-primary border-primary/20',
    ticket: 'bg-success/10 text-success border-success/20',
    deliverable: 'bg-warning/10 text-warning border-warning/20',
  };

  const formatDueDate = (dueAt: string) => {
    const date = new Date(dueAt);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueAt: string) => new Date(dueAt) < new Date();

  // Generate iCal format for a single event
  const generateICalEvent = (deadline: DeadlineItem) => {
    const date = new Date(deadline.dueAt);
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour duration

    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(date)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${deadline.title}`,
      `DESCRIPTION:${deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}${deadline.projectName ? ` - ${deadline.projectName}` : ''}`,
      `UID:${deadline.id}@skyll.app`,
      'END:VEVENT',
    ].join('\r\n');
  };

  // Export all deadlines to iCal
  const handleExportCalendar = () => {
    if (deadlines.length === 0) {
      toast.error('No deadlines to export');
      return;
    }

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skyll//Deadlines//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...deadlines.map(generateICalEvent),
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skyll-deadlines.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      `Exported ${deadlines.length} deadline${deadlines.length > 1 ? 's' : ''} to calendar`
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div
                className={cn(
                  'mt-1 p-2 rounded-lg',
                  isOverdue(deadline.dueAt) ? 'bg-destructive/10' : 'bg-muted'
                )}
              >
                {isOverdue(deadline.dueAt) ? (
                  <IconAlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{deadline.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn('text-xs', typeColors[deadline.type])}>
                    {deadline.type}
                  </Badge>
                  {deadline.projectName && (
                    <span className="text-xs text-muted-foreground truncate">
                      {deadline.projectName}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isOverdue(deadline.dueAt) ? 'text-destructive' : 'text-foreground'
                  )}
                >
                  {formatDueDate(deadline.dueAt)}
                </span>
                {deadline.clientName && (
                  <p className="text-xs text-muted-foreground mt-1">{deadline.clientName}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="pt-3 mt-auto border-t flex items-center gap-2">
        <Button variant="ghost" size="sm" className="flex-1 justify-between" asChild>
          <Link href="/dashboard/projects/views/calendar">
            View calendar
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCalendar}
          title="Export to calendar"
        >
          <IconDownload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
