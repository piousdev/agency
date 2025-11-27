'use server';
import { revalidatePath } from 'next/cache';

import { assignProject, updateProjectCompletion, updateProjectStatus } from '@/lib/api/projects';
import { assignTicket, createTicket } from '@/lib/api/tickets';
import { updateCapacity } from '@/lib/api/users';
import { updateCapacitySchema } from '@/lib/schemas/capacity';
import {
  assignProjectSchema,
  updateProjectCompletionSchema,
  updateProjectStatusSchema,
} from '@/lib/schemas/project';
import { assignTicketSchema, createTicketSchema } from '@/lib/schemas/ticket';

/**
 * Server Action: Create a new intake ticket
 */
export async function createIntakeAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    // Extract and validate form data
    const rawData = {
      clientId: formData.get('clientId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: 'intake' as const, // Intake tickets always have type "intake"
      priority: formData.get('priority') as string,
    };

    const validation = createTicketSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Create the ticket via API
    const result = await createTicket(validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate the business center page to show new ticket
    revalidatePath('/dashboard/business-center');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Create intake action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Assign a ticket to a user
 */
export async function assignTicketAction(
  ticketId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    // Extract and validate form data
    const assignedToIdValue = formData.get('assignedToId') as string;
    const rawData = {
      assignedToId: assignedToIdValue === '' ? null : assignedToIdValue,
    };

    const validation = assignTicketSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Assign the ticket via API
    const result = await assignTicket(ticketId, validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate the business center page
    revalidatePath('/dashboard/business-center');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Assign ticket action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Assign team members to a project
 */
export async function assignProjectAction(
  projectId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    // Extract and validate form data
    const userIds = formData.getAll('userIds').filter((v): v is string => typeof v === 'string');
    const rawData = { userIds };

    const validation = assignProjectSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Assign the project via API
    const result = await assignProject(projectId, validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate the business center page
    revalidatePath('/dashboard/business-center');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Assign project action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Update project status
 */
export async function updateProjectStatusAction(
  projectId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    // Extract and validate form data
    const rawData = {
      status: formData.get('status') as string,
    };

    const validation = updateProjectStatusSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Update project status via API
    const result = await updateProjectStatus(projectId, validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate the business center page
    revalidatePath('/dashboard/business-center');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Update project status action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Update project completion percentage
 */
export async function updateProjectCompletionAction(
  projectId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    // Extract and validate form data
    const value = formData.get('completionPercentage');
    const num = Number(value);
    if (typeof value !== 'string' || value.trim() === '' || isNaN(num)) {
      return {
        success: false,
        error: 'Invalid or missing completion percentage.',
      };
    }
    const rawData = {
      completionPercentage: num,
    };

    const validation = updateProjectCompletionSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Update project completion via API
    const result = await updateProjectCompletion(projectId, validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate the business center page
    revalidatePath('/dashboard/business-center');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Update project completion action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Update user capacity percentage
 */
export async function updateCapacityAction(
  userId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const value = formData.get('capacityPercentage');
    const num = Number(value);

    if (typeof value !== 'string' || value.trim() === '' || isNaN(num)) {
      return {
        success: false,
        error: 'Capacity percentage is required and must be a valid number.',
      };
    }

    const rawData = {
      capacityPercentage: num,
    };

    const validation = updateCapacitySchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Update capacity via API
    const result = await updateCapacity(userId, validation.data);
    if (!result.success) return { success: false, error: result.error };

    // Revalidate the business center page
    revalidatePath('/dashboard/business-center');

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Update capacity action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
