/**
 * Comments API client for ticket management
 * Handles creating and fetching comments on tickets
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
  ticketId: string;
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
}

export interface CreateCommentInput {
  content: string;
  isInternal?: boolean;
}

/**
 * Get all comments for a ticket
 */
export async function getTicketComments(ticketId: string): Promise<CommentsResponse> {
  const url = buildApiUrl(`/api/tickets/${ticketId}/comments`);
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
 * Create a new comment on a ticket
 */
export async function createTicketComment(
  ticketId: string,
  input: CreateCommentInput
): Promise<CommentResponse> {
  const url = buildApiUrl(`/api/tickets/${ticketId}/comments`);
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
