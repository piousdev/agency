'use client';

import { useCallback } from 'react';
import {
  ActivityFeed,
  useActivityFeed,
  type Activity,
} from '@/components/business-center/activity-feed';
import { getClientActivity } from '@/lib/api/clients/activity';

interface ClientActivityProps {
  clientId: string;
}

export function ClientActivity({ clientId }: ClientActivityProps) {
  const fetchFn = useCallback(async (id: string, params: { limit?: number; offset?: number }) => {
    const response = await getClientActivity(id, {
      limit: params.limit,
      offset: params.offset,
    });
    // Transform the response to match the Activity type
    const activities: Activity[] = response.data.map((item) => ({
      id: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      actorId: item.actorId,
      type: item.type,
      metadata: item.metadata as Activity['metadata'],
      createdAt: item.createdAt,
      actor: item.actor,
    }));
    return {
      data: activities,
      pagination: {
        hasMore: response.pagination?.hasMore ?? false,
      },
    };
  }, []);

  const { activities, loading, hasMore, loadMore, loadingMore } = useActivityFeed({
    entityType: 'client',
    entityId: clientId,
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
