'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconArchive,
  IconArrowRight,
  IconCircleCheck,
  IconClock,
  IconFileText,
  IconLoader2,
  IconMessage,
  IconPaperclip,
  IconPlus,
  IconRefresh,
  IconTag,
  IconTrash,
  IconUser,
  IconUsers,
  IconAlertTriangle,
  IconEdit,
} from '@tabler/icons-react';

// ============================================================================
// Types
// ============================================================================

export interface ActivityActor {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ActivityMetadata {
  field?: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  assigneeId?: string;
  assigneeName?: string;
  commentId?: string;
  fileId?: string;
  fileName?: string;
  affectedIds?: string[];
  affectedCount?: number;
  description?: string;
  reason?: string;
  [key: string]: unknown;
}

export type ActivityType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'archived'
  | 'project_created'
  | 'project_updated'
  | 'status_changed'
  | 'priority_changed'
  | 'due_date_changed'
  | 'assigned'
  | 'unassigned'
  | 'assignee_added'
  | 'assignee_removed'
  | 'comment_added'
  | 'file_uploaded'
  | 'file_deleted'
  | 'bulk_status_changed'
  | 'bulk_assigned'
  | 'bulk_deleted'
  | 'field_changed';

export interface Activity {
  id: string;
  entityType?: 'ticket' | 'project' | 'client';
  entityId?: string;
  projectId?: string;
  actorId: string;
  type: ActivityType;
  metadata: ActivityMetadata | null;
  createdAt: string;
  actor: ActivityActor;
}

export interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  showCard?: boolean;
  emptyMessage?: string;
}

// ============================================================================
// Activity Configuration
// ============================================================================

const activityConfig: Record<
  ActivityType,
  {
    icon: typeof IconClock;
    label: string;
    color: string;
  }
> = {
  created: {
    icon: IconPlus,
    label: 'created',
    color: 'text-green-600',
  },
  project_created: {
    icon: IconPlus,
    label: 'created this project',
    color: 'text-green-600',
  },
  project_updated: {
    icon: IconEdit,
    label: 'updated this project',
    color: 'text-blue-600',
  },
  updated: {
    icon: IconEdit,
    label: 'updated',
    color: 'text-blue-600',
  },
  deleted: {
    icon: IconTrash,
    label: 'deleted',
    color: 'text-red-600',
  },
  restored: {
    icon: IconRefresh,
    label: 'restored',
    color: 'text-green-600',
  },
  archived: {
    icon: IconArchive,
    label: 'archived',
    color: 'text-gray-600',
  },
  status_changed: {
    icon: IconCircleCheck,
    label: 'changed status',
    color: 'text-blue-600',
  },
  priority_changed: {
    icon: IconAlertTriangle,
    label: 'changed priority',
    color: 'text-orange-600',
  },
  due_date_changed: {
    icon: IconClock,
    label: 'changed due date',
    color: 'text-yellow-600',
  },
  assigned: {
    icon: IconUser,
    label: 'assigned',
    color: 'text-purple-600',
  },
  unassigned: {
    icon: IconUser,
    label: 'unassigned',
    color: 'text-gray-600',
  },
  assignee_added: {
    icon: IconUsers,
    label: 'added assignee',
    color: 'text-purple-600',
  },
  assignee_removed: {
    icon: IconUsers,
    label: 'removed assignee',
    color: 'text-gray-600',
  },
  comment_added: {
    icon: IconMessage,
    label: 'added a comment',
    color: 'text-blue-600',
  },
  file_uploaded: {
    icon: IconPaperclip,
    label: 'uploaded a file',
    color: 'text-green-600',
  },
  file_deleted: {
    icon: IconTrash,
    label: 'deleted a file',
    color: 'text-red-600',
  },
  bulk_status_changed: {
    icon: IconCircleCheck,
    label: 'bulk updated status',
    color: 'text-blue-600',
  },
  bulk_assigned: {
    icon: IconUsers,
    label: 'bulk assigned',
    color: 'text-purple-600',
  },
  bulk_deleted: {
    icon: IconTrash,
    label: 'bulk deleted',
    color: 'text-red-600',
  },
  field_changed: {
    icon: IconTag,
    label: 'changed field',
    color: 'text-indigo-600',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatStatusLabel(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActivityConfig(type: ActivityType) {
  return (
    activityConfig[type] || {
      icon: IconFileText,
      label: type.replace(/_/g, ' '),
      color: 'text-gray-600',
    }
  );
}

// ============================================================================
// Activity Item Component
// ============================================================================

function ActivityItem({ activity }: { activity: Activity }) {
  const config = getActivityConfig(activity.type);
  const Icon = config.icon;

  const renderChangeDetail = () => {
    if (!activity.metadata) return null;

    const { oldValue, newValue, field, fileName, changes, affectedCount, assigneeName } =
      activity.metadata;

    // File operations
    if (activity.type === 'file_uploaded' || activity.type === 'file_deleted') {
      return fileName ? (
        <span className="text-muted-foreground"> &ldquo;{fileName}&rdquo;</span>
      ) : null;
    }

    // Bulk operations
    if (activity.type.startsWith('bulk_') && affectedCount) {
      return <span className="text-muted-foreground text-sm"> ({affectedCount} items)</span>;
    }

    // Assignment with name
    if ((activity.type === 'assigned' || activity.type === 'assignee_added') && assigneeName) {
      return (
        <span className="text-muted-foreground">
          {' '}
          to <span className="font-medium">{assigneeName}</span>
        </span>
      );
    }

    // Single field change with old/new values
    if (oldValue !== undefined && newValue !== undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-sm mt-1">
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">
            {formatStatusLabel(oldValue)}
          </span>
          <IconArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium text-xs">
            {formatStatusLabel(newValue)}
          </span>
        </span>
      );
    }

    // Multiple field changes
    if (changes && changes.length > 0) {
      if (changes.length === 1) {
        const change = changes[0];
        return (
          <span className="inline-flex items-center gap-1 text-sm mt-1">
            <span className="text-muted-foreground text-xs">{change?.field}:</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">
              {formatStatusLabel(change?.oldValue)}
            </span>
            <IconArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium text-xs">
              {formatStatusLabel(change?.newValue)}
            </span>
          </span>
        );
      }
      return <span className="text-muted-foreground text-sm"> ({changes.length} fields)</span>;
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
            <AvatarFallback className="text-xs">
              {activity.actor.name?.charAt(0) || '?'}
            </AvatarFallback>
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

// ============================================================================
// Loading Skeleton
// ============================================================================

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center text-muted-foreground py-8">
      <IconClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>{message}</p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ActivityFeed({
  activities,
  title = 'Activity',
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  showCard = true,
  emptyMessage = 'No activity yet',
}: ActivityFeedProps) {
  const content = (
    <>
      {loading ? (
        <ActivitySkeleton />
      ) : activities.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <div className="space-y-0">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
          {hasMore && onLoadMore && (
            <div className="pt-4 text-center">
              <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// ============================================================================
// Hook for fetching activity with pagination
// ============================================================================

interface UseActivityFeedOptions {
  entityType: 'ticket' | 'project' | 'client';
  entityId: string;
  fetchFn: (
    id: string,
    params: { limit?: number; offset?: number }
  ) => Promise<{ data: Activity[]; pagination: { hasMore: boolean } }>;
  limit?: number;
}

export function useActivityFeed({
  entityType,
  entityId,
  fetchFn,
  limit = 20,
}: UseActivityFeedOptions) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(entityId, { limit, offset: 0 });
      setActivities(result.data);
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [entityId, fetchFn, limit]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchFn(entityId, { limit, offset: activities.length });
      setActivities((prev) => [...prev, ...result.data]);
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more activity');
    } finally {
      setLoadingMore(false);
    }
  }, [entityId, fetchFn, limit, activities.length, loadingMore, hasMore]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    activities,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh: loadInitial,
  };
}
