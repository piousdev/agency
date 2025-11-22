'use server';

import { revalidatePath } from 'next/cache';
import { updateProjectDelivery } from '@/lib/api/projects';

export async function updateDeliveryDateAction(
  projectId: string,
  deliveredAt: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const result = await updateProjectDelivery(projectId, { deliveredAt });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Revalidate all business center pages
  revalidatePath('/dashboard/business-center');
  revalidatePath('/dashboard/business-center/projects');

  return { success: true };
}
