'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, Permissions } from '@/lib/auth/permissions';
import {
  createLabel,
  updateLabel,
  deleteLabel,
  assignLabelsToTicket,
  removeLabelsFromTicket,
  assignLabelsToProject,
  removeLabelsFromProject,
} from '@/lib/api/labels';
import { createLabelSchema, updateLabelSchema } from '@/lib/schemas/label';

/**
 * Create a new label
 */
export async function createLabelAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; labelId?: string }> {
  try {
    await requirePermission(Permissions.LABEL_CREATE);
  } catch {
    return { success: false, error: "You don't have permission to create labels" };
  }

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    color: (formData.get('color') as string) || '#6B7280',
    description: (formData.get('description') as string) || undefined,
    scope: (formData.get('scope') as string) || 'global',
  };

  // Validate with Zod
  const parsed = createLabelSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  try {
    const result = await createLabel(parsed.data);
    if (!result.success) {
      return { success: false, error: 'Failed to create label' };
    }

    revalidatePath('/dashboard/business-center/settings/labels');

    return { success: true, labelId: result.data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create label',
    };
  }
}

/**
 * Update an existing label
 */
export async function updateLabelAction(
  labelId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.LABEL_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit labels" };
  }

  // Parse form data - only include fields that are present
  const rawData: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) rawData.name = name;

  const color = formData.get('color');
  if (color) rawData.color = color;

  const description = formData.get('description');
  if (description !== null) rawData.description = description || null;

  const scope = formData.get('scope');
  if (scope) rawData.scope = scope;

  // Validate with Zod
  const parsed = updateLabelSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  try {
    const result = await updateLabel(labelId, parsed.data);
    if (!result.success) {
      return { success: false, error: 'Failed to update label' };
    }

    revalidatePath('/dashboard/business-center/settings/labels');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update label',
    };
  }
}

/**
 * Delete a label
 */
export async function deleteLabelAction(
  labelId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.LABEL_DELETE);
  } catch {
    return { success: false, error: "You don't have permission to delete labels" };
  }

  try {
    await deleteLabel(labelId);

    revalidatePath('/dashboard/business-center/settings/labels');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete label',
    };
  }
}

/**
 * Assign labels to a ticket
 */
export async function assignLabelsToTicketAction(
  ticketId: string,
  labelIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.TICKET_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit tickets" };
  }

  try {
    await assignLabelsToTicket(ticketId, labelIds);

    revalidatePath('/dashboard/business-center/intake-queue');
    revalidatePath(`/dashboard/business-center/intake-queue/${ticketId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign labels',
    };
  }
}

/**
 * Remove labels from a ticket
 */
export async function removeLabelsFromTicketAction(
  ticketId: string,
  labelIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.TICKET_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit tickets" };
  }

  try {
    await removeLabelsFromTicket(ticketId, labelIds);

    revalidatePath('/dashboard/business-center/intake-queue');
    revalidatePath(`/dashboard/business-center/intake-queue/${ticketId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove labels',
    };
  }
}

/**
 * Assign labels to a project
 */
export async function assignLabelsToProjectAction(
  projectId: string,
  labelIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit projects" };
  }

  try {
    await assignLabelsToProject(projectId, labelIds);

    revalidatePath('/dashboard/business-center/projects');
    revalidatePath(`/dashboard/business-center/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign labels',
    };
  }
}

/**
 * Remove labels from a project
 */
export async function removeLabelsFromProjectAction(
  projectId: string,
  labelIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit projects" };
  }

  try {
    await removeLabelsFromProject(projectId, labelIds);

    revalidatePath('/dashboard/business-center/projects');
    revalidatePath(`/dashboard/business-center/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove labels',
    };
  }
}
