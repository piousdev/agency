'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconArrowRight,
  IconMessage,
  IconFileUpload,
  IconCheck,
  IconEdit,
  IconUserPlus,
  IconFolder,
  IconPlus,
  IconTrash,
  IconUser,
  IconActivity,
  IconFilter,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import { useRealtimeActivity } from '@/lib/hooks/use-socket';
import { ConnectionDot } from '../shared/connection-status';

type FilterCategory = 'all' | 'tickets' | 'projects' | 'clients' | 'files' | 'comments';

type ActivityType =
  | 'comment_added'
  | 'file_uploaded'
  | 'task_completed'
  | 'task_updated'
  | 'member_joined'
  | 'project_created'
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_assigned'
  | 'ticket_deleted'
  | 'client_created'
  | 'client_updated'
  | 'project_updated'
  | string; // Allow any string to handle server-sent types

interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  user: {
    name: string;
    image?: string;
  };
  metadata?: {
    projectName?: string;
    ticketTitle?: string;
    fileName?: string;
  };
}

// Mock data - will be replaced with real data from server
// Using static timestamps to avoid hydration mismatches
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'comment_added',
    description: 'commented on "Homepage Design Review"',
    timestamp: '2025-11-23T13:50:00Z', // Static timestamp
    user: { name: 'Sarah Chen' },
    metadata: { projectName: 'Acme Website Redesign' },
  },
  {
    id: '2',
    type: 'task_completed',
    description: 'completed "Setup CI/CD pipeline"',
    timestamp: '2025-11-23T13:30:00Z', // Static timestamp
    user: { name: 'Mike Johnson' },
    metadata: { projectName: 'TechCorp Mobile App' },
  },
  {
    id: '3',
    type: 'file_uploaded',
    description: 'uploaded "final-mockups.fig"',
    timestamp: '2025-11-23T12:00:00Z', // Static timestamp
    user: { name: 'Emily Davis' },
    metadata: { fileName: 'final-mockups.fig' },
  },
  {
    id: '4',
    type: 'member_joined',
    description: 'joined the project',
    timestamp: '2025-11-23T10:00:00Z', // Static timestamp
    user: { name: 'Alex Kim' },
    metadata: { projectName: 'Internal Dashboard' },
  },
  {
    id: '5',
    type: 'project_created',
    description: 'created a new project',
    timestamp: '2025-11-22T14:00:00Z', // Static timestamp
    user: { name: 'Jordan Lee' },
    metadata: { projectName: 'New Client Onboarding' },
  },
];

export interface RecentActivityWidgetProps {
  activities?: ActivityItem[];
  className?: string;
}

export function RecentActivityWidget({
  activities: propActivities,
  className,
}: RecentActivityWidgetProps) {
  const overviewData = useOverviewData();
  const { activities: realtimeActivities, isConnected } = useRealtimeActivity();
  const [filterBy, setFilterBy] = useState<FilterCategory>('all');

  // Map context data to widget format, using ticket_updated as default type
  const serverActivities: ActivityItem[] =
    overviewData?.recentActivity.map((a) => ({
      id: a.id,
      type: (a.type as ActivityType) || 'task_updated',
      description: a.description,
      timestamp: a.timestamp,
      user: {
        name: a.actor.name,
        image: a.actor.image || undefined,
      },
      metadata: { projectName: a.entityName },
    })) ||
    propActivities ||
    MOCK_ACTIVITIES;

  // Map real-time activities to widget format
  const realtimeItems: ActivityItem[] = realtimeActivities.map((a) => ({
    id: a.id,
    type: a.type as ActivityType,
    description: a.description,
    timestamp: a.createdAt,
    user: {
      name: a.userName,
      image: a.userImage || undefined,
    },
    metadata: { projectName: a.entityName },
  }));

  // Combine real-time and server activities, dedupe by id, sort by timestamp
  const rawActivities = useMemo(() => {
    const combined = [...realtimeItems, ...serverActivities];
    const seen = new Set<string>();
    const deduped = combined.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    return deduped.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [realtimeItems, serverActivities]);

  // Filter categories mapping
  const categoryTypes: Record<FilterCategory, string[]> = {
    all: [],
    tickets: [
      'ticket_created',
      'ticket_updated',
      'ticket_assigned',
      'ticket_deleted',
      'task_completed',
      'task_updated',
    ],
    projects: ['project_created', 'project_updated', 'member_joined'],
    clients: ['client_created', 'client_updated'],
    files: ['file_uploaded'],
    comments: ['comment_added'],
  };

  // Apply filtering
  const activities = useMemo(() => {
    if (filterBy === 'all') return rawActivities;
    const allowedTypes = categoryTypes[filterBy];
    return rawActivities.filter((a) => allowedTypes.includes(a.type));
  }, [rawActivities, filterBy]);
  const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    comment_added: IconMessage,
    file_uploaded: IconFileUpload,
    task_completed: IconCheck,
    task_updated: IconEdit,
    member_joined: IconUserPlus,
    project_created: IconFolder,
    ticket_created: IconPlus,
    ticket_updated: IconEdit,
    ticket_assigned: IconUser,
    ticket_deleted: IconTrash,
    client_created: IconUserPlus,
    client_updated: IconEdit,
    project_updated: IconEdit,
  };

  const activityColors: Record<string, string> = {
    comment_added: 'bg-primary/10 text-primary',
    file_uploaded: 'bg-accent/10 text-accent-foreground',
    task_completed: 'bg-success/10 text-success',
    task_updated: 'bg-warning/10 text-warning',
    member_joined: 'bg-primary/10 text-primary',
    project_created: 'bg-accent/10 text-accent-foreground',
    ticket_created: 'bg-success/10 text-success',
    ticket_updated: 'bg-warning/10 text-warning',
    ticket_assigned: 'bg-primary/10 text-primary',
    ticket_deleted: 'bg-destructive/10 text-destructive',
    client_created: 'bg-success/10 text-success',
    client_updated: 'bg-warning/10 text-warning',
    project_updated: 'bg-warning/10 text-warning',
  };

  // Fallback for unknown activity types
  const getIcon = (type: string) => activityIcons[type] || IconActivity;
  const getColor = (type: string) => activityColors[type] || 'bg-muted text-muted-foreground';

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterCategory)}>
            <SelectTrigger className="h-7 w-[130px] text-xs">
              <IconFilter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="tickets">Tickets</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="files">Files</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
            </SelectContent>
          </Select>
          {filterBy !== 'all' && (
            <span className="text-xs text-muted-foreground">
              {activities.length} item{activities.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ConnectionDot />
          {isConnected && realtimeActivities.length > 0 && (
            <span>{realtimeActivities.length} new</span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No activity matching filter
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.image} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{' '}
                      <span className="text-muted-foreground">{activity.description}</span>
                    </p>
                    {activity.metadata?.projectName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        in {activity.metadata.projectName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn('p-1.5 rounded-md', getColor(activity.type))}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/collaboration/feed">
            View all activity
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
