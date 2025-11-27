'use server';

import { revalidatePath } from 'next/cache';

import { createMilestone, updateMilestone, deleteMilestone } from '@/lib/api/milestones';
import { requirePermission, Permissions } from '@/lib/auth/permissions';
import { createMilestoneSchema, updateMilestoneSchema } from '@/lib/schemas/milestone';

/**
 * Create a new milestone
 */
export async function createMilestoneAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; milestoneId?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to create milestones" };
  }

  // Parse form data
  const rawData = {
    projectId: formData.get('projectId') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    status: (formData.get('status') as string) || 'pending',
    dueDate: (formData.get('dueDate') as string) || undefined,
    sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string, 10) : 0,
  };

  // Validate with Zod
  const parsed = createMilestoneSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    const errorMessage = firstError;
    return { success: false, error: errorMessage };
  }

  try {
    const result = await createMilestone(parsed.data);
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to create milestone' };
    }

    revalidatePath(`/dashboard/business-center/projects/${parsed.data.projectId}`);

    return { success: true, milestoneId: result.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create milestone',
    };
  }
}

/**
 * Update an existing milestone
 */
export async function updateMilestoneAction(
  milestoneId: string,
  projectId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit milestones" };
  }

  // Parse form data - only include fields that are present
  const rawData: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) rawData.name = name;

  const description = formData.get('description');
  if (description !== null) rawData.description = description || null;

  const status = formData.get('status');
  if (status) rawData.status = status;

  const dueDate = formData.get('dueDate');
  if (dueDate !== null) rawData.dueDate = dueDate || null;

  const sortOrder = formData.get('sortOrder');
  if (sortOrder) rawData.sortOrder = parseInt(sortOrder as string, 10);

  // Validate with Zod
  const parsed = updateMilestoneSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    const errorMessage = firstError;
    return { success: false, error: errorMessage };
  }

  try {
    const result = await updateMilestone(milestoneId, parsed.data);
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to update milestone' };
    }

    revalidatePath(`/dashboard/business-center/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update milestone',
    };
  }
}

/**
 * Delete a milestone
 */
export async function deleteMilestoneAction(
  milestoneId: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to delete milestones" };
  }

  try {
    const result = await deleteMilestone(milestoneId);
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to delete milestone' };
    }

    revalidatePath(`/dashboard/business-center/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete milestone',
    };
  }
}
