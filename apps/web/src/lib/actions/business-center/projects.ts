'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { updateProjectStatus, assignProject, removeProjectAssignment } from '@/lib/api/projects';
import { withErrorHandling, type ActionResult } from './errors';

type ProjectStatus =
  | 'intake'
  | 'proposal'
  | 'in_development'
  | 'in_review'
  | 'delivered'
  | 'on_hold';

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
