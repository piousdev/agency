'use client';

import { useCallback } from 'react';
import {
  ActivityFeed,
  useActivityFeed,
  type Activity,
} from '@/components/business-center/activity-feed';
import { getTicketActivity } from '@/lib/api/tickets/activity';

interface TicketActivityProps {
  ticketId: string;
}

export function TicketActivity({ ticketId }: TicketActivityProps) {
  const fetchFn = useCallback(async (id: string, params: { limit?: number; offset?: number }) => {
    const response = await getTicketActivity(id, {
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
    entityType: 'ticket',
    entityId: ticketId,
    fetchFn,
    limit: 20,
  });

  return (
    <ActivityFeed
      activities={activities}
      loading={loading}
      hasMore={hasMore}
      onLoadMore={loadMore}
      loadingMore={loadingMore}
      emptyMessage="No activity recorded yet"
      showCard={true}
    />
  );
}
