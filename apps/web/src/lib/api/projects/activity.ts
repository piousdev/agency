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
  | 'due_date_changed';

export interface Activity {
  id: string;
  projectId: string;
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
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ActivityParams {
  page?: number;
  pageSize?: number;
}

/**
 * Get activity feed for a project
 */
export async function getProjectActivity(
  projectId: string,
  params?: ActivityParams
): Promise<ActivityResponse> {
  const url = buildApiUrl(
    `/api/projects/${projectId}/activity`,
    params as Record<string, unknown> | undefined
  );

  const response = await clientFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activity: ${response.statusText}`);
  }

  return response.json();
}
