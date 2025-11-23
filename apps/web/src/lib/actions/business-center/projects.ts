'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import {
  createProject,
  updateProject,
  updateProjectStatus,
  assignProject,
  removeProjectAssignment,
} from '@/lib/api/projects';
import { withErrorHandling, type ActionResult } from './errors';
import { createProjectSchema, updateProjectSchema } from '@/lib/schemas';

type ProjectStatus =
  | 'proposal'
  | 'in_development'
  | 'in_review'
  | 'delivered'
  | 'on_hold'
  | 'maintenance'
  | 'archived';

export async function updateProjectStatusAction(
  projectId: string,
  status: ProjectStatus
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

    const result = await updateProjectStatus(projectId, { status });

    if (!result.success) {
      throw new Error(result.error);
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');
  });
}

export async function assignProjectMemberAction(
  projectId: string,
  userId: string
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

    const result = await assignProject(projectId, { userIds: [userId] });

    if (!result.success) {
      throw new Error(result.error);
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');
    revalidatePath('/dashboard/business-center/team-capacity');
  });
}

export async function removeProjectMemberAction(
  projectId: string,
  userId: string
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

    const result = await removeProjectAssignment(projectId, { userId });

    if (!result.success) {
      throw new Error(result.message || 'Failed to remove project assignment');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');
    revalidatePath('/dashboard/business-center/team-capacity');
  });
}

/**
 * Create a new project
 */
export async function createProjectAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; projectId?: string }> {
  const user = await requireUser();
  if (!user.isInternal) {
    return { success: false, error: 'Access denied: Internal team only' };
  }

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    clientId: formData.get('clientId') as string,
    status: (formData.get('status') as string) || 'proposal',
    priority: (formData.get('priority') as string) || 'medium',
    completionPercentage: parseInt((formData.get('completionPercentage') as string) || '0', 10),
    repositoryUrl: (formData.get('repositoryUrl') as string) || undefined,
    productionUrl: (formData.get('productionUrl') as string) || undefined,
    stagingUrl: (formData.get('stagingUrl') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    startedAt: (formData.get('startedAt') as string) || undefined,
  };

  // Validate with Zod
  const parsed = createProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  try {
    // Create project via API
    const result = await createProject(parsed.data);
    if (!result.success) {
      return { success: false, error: 'Failed to create project' };
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');

    return { success: true, projectId: result.data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

/**
 * Update an existing project
 */
export async function updateProjectFullAction(
  projectId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; projectId?: string }> {
  const user = await requireUser();
  if (!user.isInternal) {
    return { success: false, error: 'Access denied: Internal team only' };
  }

  // Parse form data - only include fields that are present
  const rawData: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) rawData.name = name;

  const description = formData.get('description');
  if (description) rawData.description = description;

  const clientId = formData.get('clientId');
  if (clientId) rawData.clientId = clientId;

  const status = formData.get('status');
  if (status) rawData.status = status;

  const priority = formData.get('priority');
  if (priority) rawData.priority = priority;

  const completionPercentage = formData.get('completionPercentage');
  if (completionPercentage)
    rawData.completionPercentage = parseInt(completionPercentage as string, 10);

  const repositoryUrl = formData.get('repositoryUrl');
  if (repositoryUrl) rawData.repositoryUrl = repositoryUrl;

  const productionUrl = formData.get('productionUrl');
  if (productionUrl) rawData.productionUrl = productionUrl;

  const stagingUrl = formData.get('stagingUrl');
  if (stagingUrl) rawData.stagingUrl = stagingUrl;

  const notes = formData.get('notes');
  if (notes) rawData.notes = notes;

  // Validate with Zod
  const parsed = updateProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  try {
    // Update project via API
    const result = await updateProject(projectId, parsed.data);
    if (!result.success) {
      return { success: false, error: 'Failed to update project' };
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');
    revalidatePath(`/dashboard/business-center/projects/${projectId}`);

    return { success: true, projectId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project',
    };
  }
}

/**
 * Delete (archive) a project
 */
export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

    // Soft delete by setting status to archived
    const result = await updateProjectStatus(projectId, { status: 'archived' });

    if (!result.success) {
      throw new Error(result.error || 'Failed to archive project');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');
  });
}
