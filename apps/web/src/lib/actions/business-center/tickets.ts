'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { updateTicket, assignTicket } from '@/lib/api/tickets';
import { withErrorHandling, type ActionResult } from './errors';

type TicketStatus = 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';

export async function assignTicketAction(ticketId: string, userId: string): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

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
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

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
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

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
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

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
