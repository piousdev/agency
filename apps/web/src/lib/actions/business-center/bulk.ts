'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { updateTicket, assignTicket } from '@/lib/api/tickets';
import { updateProject, assignProject } from '@/lib/api/projects';
import { updateClient } from '@/lib/api/clients';

// ============================================================================
// Types
// ============================================================================

type TicketStatus = 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
type ProjectStatus =
  | 'proposal'
  | 'in_development'
  | 'in_review'
  | 'delivered'
  | 'on_hold'
  | 'maintenance'
  | 'archived';

export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  failedIds: string[];
  error?: string;
}

// ============================================================================
// Ticket Bulk Operations
// ============================================================================

/**
 * Bulk update status for multiple tickets
 */
export async function bulkUpdateTicketStatusAction(
  ticketIds: string[],
  status: TicketStatus
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: ticketIds.length,
      failedIds: ticketIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (ticketIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No tickets selected',
    };
  }

  const results = await Promise.allSettled(ticketIds.map((id) => updateTicket(id, { status })));

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(ticketIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/intake-queue');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to update ${failedIds.length} ticket(s)` : undefined,
  };
}

/**
 * Bulk update priority for multiple tickets
 */
export async function bulkUpdateTicketPriorityAction(
  ticketIds: string[],
  priority: TicketPriority
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: ticketIds.length,
      failedIds: ticketIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (ticketIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No tickets selected',
    };
  }

  const results = await Promise.allSettled(ticketIds.map((id) => updateTicket(id, { priority })));

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(ticketIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/intake-queue');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to update ${failedIds.length} ticket(s)` : undefined,
  };
}

/**
 * Bulk assign tickets to a user
 */
export async function bulkAssignTicketsAction(
  ticketIds: string[],
  assignedToId: string | null
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: ticketIds.length,
      failedIds: ticketIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (ticketIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No tickets selected',
    };
  }

  const results = await Promise.allSettled(
    ticketIds.map((id) => assignTicket(id, { assignedToId }))
  );

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(ticketIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/intake-queue');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to assign ${failedIds.length} ticket(s)` : undefined,
  };
}

/**
 * Bulk delete (soft-delete) tickets by setting status to closed
 */
export async function bulkDeleteTicketsAction(ticketIds: string[]): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: ticketIds.length,
      failedIds: ticketIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (ticketIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No tickets selected',
    };
  }

  // Soft delete: set status to closed
  const results = await Promise.allSettled(
    ticketIds.map((id) => updateTicket(id, { status: 'closed' }))
  );

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(ticketIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/intake-queue');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to delete ${failedIds.length} ticket(s)` : undefined,
  };
}

// ============================================================================
// Project Bulk Operations
// ============================================================================

/**
 * Bulk update status for multiple projects
 */
export async function bulkUpdateProjectStatusAction(
  projectIds: string[],
  status: ProjectStatus
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: projectIds.length,
      failedIds: projectIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (projectIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No projects selected',
    };
  }

  const results = await Promise.allSettled(projectIds.map((id) => updateProject(id, { status })));

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(projectIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/projects');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to update ${failedIds.length} project(s)` : undefined,
  };
}

/**
 * Bulk assign a member to multiple projects
 */
export async function bulkAssignProjectMemberAction(
  projectIds: string[],
  userId: string
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: projectIds.length,
      failedIds: projectIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (projectIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No projects selected',
    };
  }

  const results = await Promise.allSettled(
    projectIds.map((id) => assignProject(id, { userIds: [userId] }))
  );

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(projectIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/projects');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error:
      failedIds.length > 0
        ? `Failed to assign member to ${failedIds.length} project(s)`
        : undefined,
  };
}

/**
 * Bulk archive (soft-delete) projects
 */
export async function bulkArchiveProjectsAction(
  projectIds: string[]
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: projectIds.length,
      failedIds: projectIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (projectIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No projects selected',
    };
  }

  // Soft delete: set status to archived
  const results = await Promise.allSettled(
    projectIds.map((id) => updateProject(id, { status: 'archived' }))
  );

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(projectIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/projects');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to archive ${failedIds.length} project(s)` : undefined,
  };
}

// ============================================================================
// Client Bulk Operations
// ============================================================================

/**
 * Bulk deactivate clients
 */
export async function bulkDeactivateClientsAction(
  clientIds: string[]
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: clientIds.length,
      failedIds: clientIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (clientIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No clients selected',
    };
  }

  const results = await Promise.allSettled(
    clientIds.map((id) => updateClient(id, { active: false }))
  );

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(clientIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/clients');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to deactivate ${failedIds.length} client(s)` : undefined,
  };
}

/**
 * Bulk activate clients
 */
export async function bulkActivateClientsAction(clientIds: string[]): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: clientIds.length,
      failedIds: clientIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (clientIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No clients selected',
    };
  }

  const results = await Promise.allSettled(
    clientIds.map((id) => updateClient(id, { active: true }))
  );

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(clientIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/clients');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to activate ${failedIds.length} client(s)` : undefined,
  };
}

/**
 * Bulk update client type
 */
export async function bulkUpdateClientTypeAction(
  clientIds: string[],
  type: 'software' | 'creative' | 'full_service'
): Promise<BulkOperationResult> {
  const user = await requireUser();
  if (!user.isInternal) {
    return {
      success: false,
      successCount: 0,
      failedCount: clientIds.length,
      failedIds: clientIds,
      error: 'Access denied: Internal team only',
    };
  }

  if (clientIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      failedIds: [],
      error: 'No clients selected',
    };
  }

  const results = await Promise.allSettled(clientIds.map((id) => updateClient(id, { type })));

  const failedIds: string[] = [];
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedIds.push(clientIds[index]!);
    }
  });

  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/clients');

  return {
    success: failedIds.length === 0,
    successCount,
    failedCount: failedIds.length,
    failedIds,
    error: failedIds.length > 0 ? `Failed to update ${failedIds.length} client(s)` : undefined,
  };
}
