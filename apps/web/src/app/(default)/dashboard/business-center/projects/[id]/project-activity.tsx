'use client';

import { useCallback } from 'react';

import {
  ActivityFeed,
  useActivityFeed,
  type Activity,
} from '@/components/business-center/activity-feed';
import { getProjectActivity } from '@/lib/api/projects/activity';

interface ProjectActivityProps {
  projectId: string;
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const fetchFn = useCallback(async (id: string, params: { limit?: number; offset?: number }) => {
    const response = await getProjectActivity(id, {
      limit: params.limit,
      offset: params.offset,
    });
    // Transform the response to match the Activity type
    const activities: Activity[] = response.data.map((item) => ({
      id: item.id,
      entityType: 'project' as const,
      entityId: item.projectId,
      projectId: item.projectId,
      actorId: item.actorId,
      type: item.type,
      metadata: item.metadata as Activity['metadata'],
      createdAt: item.createdAt,
      actor: item.actor,
    }));
    return {
      data: activities,
      pagination: {
        hasMore: response.pagination.hasMore,
      },
    };
  }, []);

  const { activities, loading, hasMore, loadMore, loadingMore } = useActivityFeed({
    entityType: 'project',
    entityId: projectId,
    fetchFn,
    limit: 20,
  });

  return (
    <ActivityFeed
      activities={activities}
      title="Recent Activity"
      loading={loading}
      hasMore={hasMore}
      onLoadMore={loadMore}
      loadingMore={loadingMore}
      emptyMessage="No activity recorded yet"
    />
  );
}
