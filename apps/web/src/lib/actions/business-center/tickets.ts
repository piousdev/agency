'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, Permissions } from '@/lib/auth/permissions';
import { createTicket, updateTicket, assignTicket } from '@/lib/api/tickets';
import { withErrorHandling, type ActionResult } from './errors';
import { createTicketSchema, updateTicketSchema } from '@/lib/schemas';

type TicketStatus = 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';

/**
 * Create a new ticket
 */
export async function createTicketAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; ticketId?: string }> {
  try {
    await requirePermission(Permissions.TICKET_CREATE);
  } catch {
    return { success: false, error: "You don't have permission to create tickets" };
  }

  // Parse form data
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    type: (formData.get('type') as string) || 'intake',
    priority: (formData.get('priority') as string) || 'medium',
    clientId: formData.get('clientId') as string,
    projectId: (formData.get('projectId') as string) || undefined,
    assignedToId: (formData.get('assignedToId') as string) || undefined,
    dueAt: (formData.get('dueAt') as string) || undefined,
    contactEmail: (formData.get('contactEmail') as string) || undefined,
    contactPhone: (formData.get('contactPhone') as string) || undefined,
    contactName: (formData.get('contactName') as string) || undefined,
    environment: (formData.get('environment') as string) || undefined,
    affectedUrl: (formData.get('affectedUrl') as string) || undefined,
  };

  // Validate with Zod
  const parsed = createTicketSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  // Create ticket via API
  const result = await createTicket(parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/intake-queue');

  return { success: true, ticketId: result.data.id };
}

/**
 * Update an existing ticket
 */
export async function updateTicketFullAction(
  ticketId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; ticketId?: string }> {
  try {
    await requirePermission(Permissions.TICKET_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit tickets" };
  }

  // Parse form data
  const rawData: Record<string, unknown> = {};

  const title = formData.get('title');
  if (title) rawData.title = title;

  const description = formData.get('description');
  if (description) rawData.description = description;

  const type = formData.get('type');
  if (type) rawData.type = type;

  const status = formData.get('status');
  if (status) rawData.status = status;

  const priority = formData.get('priority');
  if (priority) rawData.priority = priority;

  const projectId = formData.get('projectId');
  if (projectId) rawData.projectId = projectId;

  const dueAt = formData.get('dueAt');
  if (dueAt) rawData.dueAt = dueAt;

  const environment = formData.get('environment');
  if (environment) rawData.environment = environment;

  const affectedUrl = formData.get('affectedUrl');
  if (affectedUrl) rawData.affectedUrl = affectedUrl;

  // Validate with Zod
  const parsed = updateTicketSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  // Update ticket via API
  const result = await updateTicket(ticketId, parsed.data);
  if (!result.success) {
    return { success: false, error: result.message || 'Failed to update ticket' };
  }

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/intake-queue');
  revalidatePath(`/dashboard/business-center/intake-queue/${ticketId}`);

  return { success: true, ticketId };
}

/**
 * Delete (soft delete) a ticket
 */
export async function deleteTicketAction(ticketId: string): Promise<ActionResult> {
  return withErrorHandling(async () => {
    await requirePermission(Permissions.TICKET_DELETE);

    // Soft delete by setting status to closed
    const result = await updateTicket(ticketId, { status: 'closed' });

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete ticket');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/intake-queue');
  });
}

export async function assignTicketAction(ticketId: string, userId: string): Promise<ActionResult> {
  return withErrorHandling(async () => {
    await requirePermission(Permissions.TICKET_ASSIGN);

    // Assign ticket to user
    const assignResult = await assignTicket(ticketId, { assignedToId: userId });
    if (!assignResult.success) {
      throw new Error(assignResult.error || 'Failed to assign ticket');
    }

    // Update status to in_progress
    const statusResult = await updateTicket(ticketId, { status: 'in_progress' });
    if (!statusResult.success) {
      throw new Error(statusResult.message || 'Failed to update ticket status');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/intake-queue');
  });
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: TicketStatus
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    await requirePermission(Permissions.TICKET_EDIT);

    const result = await updateTicket(ticketId, { status });

    if (!result.success) {
      throw new Error(result.message || 'Failed to update ticket status');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/intake-queue');
  });
}

type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export async function updateTicketPriorityAction(
  ticketId: string,
  priority: TicketPriority
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    await requirePermission(Permissions.TICKET_EDIT);

    const result = await updateTicket(ticketId, { priority });

    if (!result.success) {
      throw new Error(result.message || 'Failed to update ticket priority');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/intake-queue');
  });
}

export async function addTicketCommentAction(
  ticketId: string,
  content: string,
  isInternal: boolean = false
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    await requirePermission(Permissions.TICKET_EDIT);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/tickets/${ticketId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: (await import('next/headers')).cookies().toString(),
        },
        body: JSON.stringify({ content, isInternal }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add comment');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/intake-queue');
    revalidatePath(`/dashboard/business-center/intake-queue/${ticketId}`);
  });
}
