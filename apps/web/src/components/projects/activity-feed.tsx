'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  IconActivity,
  IconPlus,
  IconEdit,
  IconArrowRight,
  IconUserPlus,
  IconUserMinus,
  IconMessage,
  IconUpload,
  IconTrash,
  IconAlertTriangle,
  IconCalendar,
} from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Activity, ActivityType } from '@/lib/api/projects';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: Activity[];
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ActivityConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  getMessage: (metadata: Record<string, unknown> | null) => string;
}

const activityConfig: Record<ActivityType, ActivityConfig> = {
  project_created: {
    icon: IconPlus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    getMessage: () => 'created this project',
  },
  project_updated: {
    icon: IconEdit,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    getMessage: () => 'updated project details',
  },
  status_changed: {
    icon: IconArrowRight,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    getMessage: (metadata) => {
      const from = (metadata?.oldStatus as string) || 'unknown';
      const to = (metadata?.newStatus as string) || 'unknown';
      return `changed status from ${formatStatus(from)} to ${formatStatus(to)}`;
    },
  },
  assignee_added: {
    icon: IconUserPlus,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    getMessage: (metadata) => {
      const name = (metadata?.userName as string) || 'a team member';
      return `added ${name} to the project`;
    },
  },
  assignee_removed: {
    icon: IconUserMinus,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    getMessage: (metadata) => {
      const name = (metadata?.userName as string) || 'a team member';
      return `removed ${name} from the project`;
    },
  },
  comment_added: {
    icon: IconMessage,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    getMessage: (metadata) => {
      const isInternal = metadata?.isInternal as boolean;
      return isInternal ? 'added an internal comment' : 'added a comment';
    },
  },
  file_uploaded: {
    icon: IconUpload,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    getMessage: (metadata) => {
      const fileName = (metadata?.fileName as string) || 'a file';
      return `uploaded ${fileName}`;
    },
  },
  file_deleted: {
    icon: IconTrash,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    getMessage: (metadata) => {
      const fileName = (metadata?.fileName as string) || 'a file';
      return `deleted ${fileName}`;
    },
  },
  priority_changed: {
    icon: IconAlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    getMessage: (metadata) => {
      const from = (metadata?.oldPriority as string) || 'unknown';
      const to = (metadata?.newPriority as string) || 'unknown';
      return `changed priority from ${from} to ${to}`;
    },
  },
  due_date_changed: {
    icon: IconCalendar,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    getMessage: (metadata) => {
      const newDate = metadata?.newDueDate as string;
      if (newDate) {
        return `set due date to ${new Date(newDate).toLocaleDateString()}`;
      }
      return 'removed the due date';
    },
  },
};

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconActivity className="h-10 w-10 text-muted-foreground/30" />
        <p className="mt-3 text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70">Activity will be tracked here</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border/60" />

      <div className="space-y-6">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const message = config.getMessage(activity.metadata);

          return (
            <div key={activity.id} className="relative flex gap-4 pl-1">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  config.bgColor
                )}
              >
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start gap-2">
                  <Avatar className="h-5 w-5 shrink-0 border border-border/40">
                    <AvatarImage src={activity.actor.image ?? undefined} />
                    <AvatarFallback className="text-[8px] font-medium bg-muted">
                      {getInitials(activity.actor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.actor.name}</span>{' '}
                      <span className="text-muted-foreground">{message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
