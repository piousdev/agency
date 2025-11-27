/**
 * Activity API client for project management
 * Handles activity feed operations for projects
 * Client-safe - can be used in both Server and Client Components
 */

import { buildApiUrl, clientFetch } from '../client-utils';

export interface ActivityActor {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'status_changed'
  | 'assignee_added'
  | 'assignee_removed'
  | 'comment_added'
  | 'file_uploaded'
  | 'file_deleted'
  | 'priority_changed'
  | 'due_date_changed'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'archived'
  | 'restored'
  | 'field_changed';

export interface Activity {
  id: string;
  projectId?: string;
  entityType?: 'ticket' | 'project' | 'client';
  entityId?: string;
  actorId: string;
  type: ActivityType;
  metadata: Record<string, unknown> | null;
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
 * Get activity feed for a project
 */
export async function getProjectActivity(
  projectId: string,
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
    `/api/projects/${projectId}/activity`,
    Object.keys(queryParams).length > 0 ? queryParams : undefined
  );

  const response = await clientFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activity: ${response.statusText}`);
  }

  return (await response.json()) as ActivityResponse;
}
