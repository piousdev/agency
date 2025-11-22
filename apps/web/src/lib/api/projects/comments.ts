/**
 * Comments API client for project management
 * Handles CRUD operations for project comments
 */

import { getAuthHeaders, buildApiUrl } from './api-utils';

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
  message?: string;
}

export interface CreateCommentInput {
  content: string;
  isInternal?: boolean;
}

export interface UpdateCommentInput {
  content: string;
}

/**
 * Get all comments for a project
 */
export async function getProjectComments(projectId: string): Promise<CommentsResponse> {
  const url = buildApiUrl(`/api/projects/${projectId}/comments`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new comment on a project
 */
export async function createComment(
  projectId: string,
  input: CreateCommentInput
): Promise<CommentResponse> {
  const url = buildApiUrl(`/api/projects/${projectId}/comments`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', response.status, errorText);
    throw new Error(`Failed to create comment: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Update a comment
 */
export async function updateComment(
  projectId: string,
  commentId: string,
  input: UpdateCommentInput
): Promise<CommentResponse> {
  const url = buildApiUrl(`/api/projects/${projectId}/comments/${commentId}`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update comment: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a comment
 */
export async function deleteComment(
  projectId: string,
  commentId: string
): Promise<{ success: boolean; message: string }> {
  const url = buildApiUrl(`/api/projects/${projectId}/comments/${commentId}`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete comment: ${response.statusText}`);
  }

  return response.json();
}
