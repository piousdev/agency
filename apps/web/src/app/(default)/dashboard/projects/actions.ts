'use server';

import { revalidatePath } from 'next/cache';

import { createProject, updateProject } from '@/lib/api/projects';
import { requireUser } from '@/lib/auth/session';
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectFormInput,
  type UpdateProjectFormInput,
} from '@/lib/schemas/project';

export interface ProjectActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  projectId?: string;
}

/**
 * Server Action: Create a new project
 */
export async function createProjectAction(
  prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireUser();

  if (!user.isInternal) {
    return {
      success: false,
      message: 'Access denied: Internal team only',
    };
  }

  // Parse form data
  const rawData: CreateProjectFormInput = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    clientId: formData.get('clientId') as string,
    status: (formData.get('status') as CreateProjectFormInput['status']) ?? 'proposal',
    completionPercentage: parseInt(formData.get('completionPercentage') as string),
    repositoryUrl: (formData.get('repositoryUrl') as string) || undefined,
    productionUrl: (formData.get('productionUrl') as string) || undefined,
    stagingUrl: (formData.get('stagingUrl') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    startedAt: (formData.get('startedAt') as string) || null,
    deliveredAt: (formData.get('deliveredAt') as string) || null,
  };

  // Validate
  const parsed = createProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  try {
    const result = await createProject(parsed.data);

    revalidatePath('/dashboard/projects');
    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');

    return {
      success: true,
      message: 'Project created successfully',
      projectId: result.data.id,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

/**
 * Server Action: Update an existing project
 */
export async function updateProjectAction(
  projectId: string,
  prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireUser();

  if (!user.isInternal) {
    return {
      success: false,
      message: 'Access denied: Internal team only',
    };
  }

  // Parse form data
  const rawData: UpdateProjectFormInput = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    clientId: formData.get('clientId') as string,
    status: (formData.get('status') as UpdateProjectFormInput['status']) ?? undefined,
    completionPercentage: parseInt(formData.get('completionPercentage') as string),
    repositoryUrl: (formData.get('repositoryUrl') as string) || undefined,
    productionUrl: (formData.get('productionUrl') as string) || undefined,
    stagingUrl: (formData.get('stagingUrl') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    startedAt: (formData.get('startedAt') as string) || null,
    deliveredAt: (formData.get('deliveredAt') as string) || null,
  };

  // Validate
  const parsed = updateProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Validation failed',
    };
  }

  try {
    await updateProject(projectId, parsed.data);

    revalidatePath('/dashboard/projects');
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/projects');
    revalidatePath(`/dashboard/business-center/projects/${projectId}`);

    return {
      success: true,
      message: 'Project updated successfully',
      projectId,
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update project',
    };
  }
}
