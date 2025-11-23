/**
 * Activity API client for tickets
 * Handles activity feed operations for tickets
 * Client-safe - can be used in both Server and Client Components
 */

import { buildApiUrl, clientFetch } from '../client-utils';

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
  entityType: 'ticket' | 'project' | 'client';
  entityId: string;
  actorId: string;
  type: ActivityType;
  metadata: ActivityMetadata | null;
  createdAt: string;
  actor: ActivityActor;
}

export interface ActivityResponse {
  success: boolean;
  data: Activity[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ActivityParams {
  limit?: number;
  offset?: number;
  types?: ActivityType[];
}

/**
 * Get activity feed for a ticket
 */
export async function getTicketActivity(
  ticketId: string,
  params?: ActivityParams
): Promise<ActivityResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.limit) {
    queryParams.limit = String(params.limit);
  }
  if (params?.offset) {
    queryParams.offset = String(params.offset);
  }
  if (params?.types?.length) {
    queryParams.types = params.types.join(',');
  }

  const url = buildApiUrl(
    `/api/tickets/${ticketId}/activity`,
    Object.keys(queryParams).length > 0 ? queryParams : undefined
  );

  const response = await clientFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ticket activity: ${response.statusText}`);
  }

  return response.json();
}
