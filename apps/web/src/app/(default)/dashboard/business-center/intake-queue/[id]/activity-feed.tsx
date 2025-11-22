'use client';

import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Tag,
  User,
  AlertTriangle,
  Paperclip,
  Trash2,
  Link2,
  RotateCcw,
} from 'lucide-react';
import type { TicketActivity, TicketActivityType } from '@/lib/api/tickets/types';

interface ActivityFeedProps {
  activities: TicketActivity[];
}

const activityConfig: Record<
  TicketActivityType,
  {
    icon: typeof Clock;
    label: string;
    color: string;
  }
> = {
  ticket_created: {
    icon: FileText,
    label: 'created this ticket',
    color: 'text-green-600',
  },
  status_changed: {
    icon: CheckCircle,
    label: 'changed status',
    color: 'text-blue-600',
  },
  priority_changed: {
    icon: AlertTriangle,
    label: 'changed priority',
    color: 'text-orange-600',
  },
  assignee_changed: {
    icon: User,
    label: 'changed assignee',
    color: 'text-purple-600',
  },
  type_changed: {
    icon: Tag,
    label: 'changed type',
    color: 'text-indigo-600',
  },
  comment_added: {
    icon: MessageSquare,
    label: 'added a comment',
    color: 'text-blue-600',
  },
  comment_edited: {
    icon: MessageSquare,
    label: 'edited a comment',
    color: 'text-gray-600',
  },
  comment_deleted: {
    icon: Trash2,
    label: 'deleted a comment',
    color: 'text-red-600',
  },
  file_uploaded: {
    icon: Paperclip,
    label: 'uploaded a file',
    color: 'text-green-600',
  },
  file_deleted: {
    icon: Trash2,
    label: 'deleted a file',
    color: 'text-red-600',
  },
  sla_updated: {
    icon: Clock,
    label: 'updated SLA',
    color: 'text-yellow-600',
  },
  due_date_changed: {
    icon: Clock,
    label: 'changed due date',
    color: 'text-yellow-600',
  },
  tags_updated: {
    icon: Tag,
    label: 'updated tags',
    color: 'text-indigo-600',
  },
  linked_to_project: {
    icon: Link2,
    label: 'linked to project',
    color: 'text-purple-600',
  },
  merged: {
    icon: Link2,
    label: 'merged tickets',
    color: 'text-purple-600',
  },
  reopened: {
    icon: RotateCcw,
    label: 'reopened this ticket',
    color: 'text-orange-600',
  },
};

function formatStatusLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ActivityItem({ activity }: { activity: TicketActivity }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const renderChangeDetail = () => {
    if (!activity.metadata) return null;

    const { oldValue, newValue, field, fileName } = activity.metadata;

    if (activity.type === 'file_uploaded' || activity.type === 'file_deleted') {
      return fileName ? (
        <span className="text-muted-foreground"> &ldquo;{fileName}&rdquo;</span>
      ) : null;
    }

    if (oldValue !== undefined && newValue !== undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-sm">
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {formatStatusLabel(String(oldValue))}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
            {formatStatusLabel(String(newValue))}
          </span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className={`p-1.5 rounded-full bg-muted ${config.color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={activity.actor.image || undefined} />
            <AvatarFallback className="text-xs">{activity.actor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.actor.name}</span>
              <span className="text-muted-foreground"> {config.label}</span>
            </p>
            {renderChangeDetail()}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
