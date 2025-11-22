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

    const validatedData = createTicketSchema.parse(rawData);

    // Create the ticket via API
    const result = await createTicket(validatedData);

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
    const rawData = {
      assignedToId: formData.get('assignedToId') as string,
    };

    const validatedData = assignTicketSchema.parse(rawData);

    // Assign the ticket via API
    const result = await assignTicket(ticketId, validatedData);

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
    const userIds = formData.getAll('userIds') as string[];
    const rawData = { userIds };

    const validatedData = assignProjectSchema.parse(rawData);

    // Assign the project via API
    const result = await assignProject(projectId, validatedData);

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

    const validatedData = updateProjectStatusSchema.parse(rawData);

    // Update project status via API
    const result = await updateProjectStatus(projectId, validatedData);

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
    const rawData = {
      completionPercentage: Number(formData.get('completionPercentage')),
    };

    const validatedData = updateProjectCompletionSchema.parse(rawData);

    // Update project completion via API
    const result = await updateProjectCompletion(projectId, validatedData);

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
    // Extract and validate form data
    const rawData = {
      capacityPercentage: Number(formData.get('capacityPercentage')),
    };

    const validatedData = updateCapacitySchema.parse(rawData);

    // Update capacity via API
    const result = await updateCapacity(userId, validatedData);

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
    console.error('Update capacity action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
