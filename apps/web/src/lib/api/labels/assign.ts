/**
 * Label assignment API operations
 */

import { getAuthHeaders } from './api-utils';

import type { AssignLabelsResponse, RemoveLabelsResponse, LabelsListResponse } from './types';

/**
 * Assign labels to a ticket
 */
export async function assignLabelsToTicket(
  ticketId: string,
  labelIds: string[]
): Promise<AssignLabelsResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/tickets/${ticketId}/assign`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ labelIds }),
    cache: 'no-store',
  });

  const result = (await response.json()) as AssignLabelsResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as AssignLabelsResponse;
}

/**
 * Remove labels from a ticket
 */
export async function removeLabelsFromTicket(
  ticketId: string,
  labelIds: string[]
): Promise<RemoveLabelsResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/tickets/${ticketId}/remove`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ labelIds }),
    cache: 'no-store',
  });

  const result = (await response.json()) as RemoveLabelsResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as RemoveLabelsResponse;
}

/**
 * Get labels for a ticket
 */
export async function getTicketLabels(ticketId: string): Promise<LabelsListResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/tickets/${ticketId}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = (await response.json()) as LabelsListResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as LabelsListResponse;
}

/**
 * Assign labels to a project
 */
export async function assignLabelsToProject(
  projectId: string,
  labelIds: string[]
): Promise<AssignLabelsResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/projects/${projectId}/assign`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ labelIds }),
    cache: 'no-store',
  });

  const result = (await response.json()) as AssignLabelsResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as AssignLabelsResponse;
}

/**
 * Remove labels from a project
 */
export async function removeLabelsFromProject(
  projectId: string,
  labelIds: string[]
): Promise<RemoveLabelsResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/projects/${projectId}/remove`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ labelIds }),
    cache: 'no-store',
  });

  const result = (await response.json()) as RemoveLabelsResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as RemoveLabelsResponse;
}

/**
 * Get labels for a project
 */
export async function getProjectLabels(projectId: string): Promise<LabelsListResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/projects/${projectId}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = (await response.json()) as LabelsListResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as LabelsListResponse;
}
