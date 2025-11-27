'use server';

import { revalidatePath } from 'next/cache';

import { createSprint, updateSprint, deleteSprint } from '@/lib/api/sprints';
import { requirePermission, Permissions } from '@/lib/auth/permissions';
import { createSprintSchema, updateSprintSchema } from '@/lib/schemas/sprint';

/**
 * Create a new sprint
 */
export async function createSprintAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; sprintId?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to create sprints" };
  }

  // Parse form data
  const rawData = {
    projectId: formData.get('projectId') as string,
    name: formData.get('name') as string,
    goal: (formData.get('goal') as string) || undefined,
    status: (formData.get('status') as string) || 'planning',
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
    plannedPoints: formData.get('plannedPoints')
      ? parseInt(formData.get('plannedPoints') as string, 10)
      : 0,
    sprintNumber: formData.get('sprintNumber')
      ? parseInt(formData.get('sprintNumber') as string, 10)
      : undefined,
  };

  // Validate with Zod
  const parsed = createSprintSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    const errorMessage = firstError;
    return { success: false, error: errorMessage };
  }

  try {
    const result = await createSprint(parsed.data);
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to create sprint' };
    }

    revalidatePath(`/dashboard/business-center/projects/${parsed.data.projectId}`);
    revalidatePath('/dashboard/business-center/sprints');

    return { success: true, sprintId: result.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create sprint',
    };
  }
}

/**
 * Update an existing sprint
 */
export async function updateSprintAction(
  sprintId: string,
  projectId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to edit sprints" };
  }

  // Parse form data - only include fields that are present
  const rawData: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) rawData.name = name;

  const goal = formData.get('goal');
  if (goal !== null) rawData.goal = goal || null;

  const status = formData.get('status');
  if (status) rawData.status = status;

  const startDate = formData.get('startDate');
  if (startDate !== null) rawData.startDate = startDate || null;

  const endDate = formData.get('endDate');
  if (endDate !== null) rawData.endDate = endDate || null;

  const plannedPoints = formData.get('plannedPoints');
  if (plannedPoints) rawData.plannedPoints = parseInt(plannedPoints as string, 10);

  const completedPoints = formData.get('completedPoints');
  if (completedPoints) rawData.completedPoints = parseInt(completedPoints as string, 10);

  const sprintNumber = formData.get('sprintNumber');
  if (sprintNumber) rawData.sprintNumber = parseInt(sprintNumber as string, 10);

  // Validate with Zod
  const parsed = updateSprintSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    const errorMessage = firstError;
    return { success: false, error: errorMessage };
  }

  try {
    const result = await updateSprint(sprintId, parsed.data);
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to update sprint' };
    }

    revalidatePath(`/dashboard/business-center/projects/${projectId}`);
    revalidatePath('/dashboard/business-center/sprints');
    revalidatePath(`/dashboard/business-center/sprints/${sprintId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update sprint',
    };
  }
}

/**
 * Start a sprint (change status to active)
 */
export async function startSprintAction(
  sprintId: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to start sprints" };
  }

  try {
    const result = await updateSprint(sprintId, {
      status: 'active',
      startDate: new Date().toISOString(),
    });
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to start sprint' };
    }

    revalidatePath(`/dashboard/business-center/projects/${projectId}`);
    revalidatePath('/dashboard/business-center/sprints');
    revalidatePath(`/dashboard/business-center/sprints/${sprintId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start sprint',
    };
  }
}

/**
 * Complete a sprint
 */
export async function completeSprintAction(
  sprintId: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to complete sprints" };
  }

  try {
    const result = await updateSprint(sprintId, {
      status: 'completed',
      endDate: new Date().toISOString(),
    });
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to complete sprint' };
    }

    revalidatePath(`/dashboard/business-center/projects/${projectId}`);
    revalidatePath('/dashboard/business-center/sprints');
    revalidatePath(`/dashboard/business-center/sprints/${sprintId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete sprint',
    };
  }
}

/**
 * Delete a sprint
 */
export async function deleteSprintAction(
  sprintId: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission(Permissions.PROJECT_EDIT);
  } catch {
    return { success: false, error: "You don't have permission to delete sprints" };
  }

  try {
    const result = await deleteSprint(sprintId);
    if (!result.success) {
      return { success: false, error: result.message ?? 'Failed to delete sprint' };
    }

    revalidatePath(`/dashboard/business-center/projects/${projectId}`);
    revalidatePath('/dashboard/business-center/sprints');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete sprint',
    };
  }
}
