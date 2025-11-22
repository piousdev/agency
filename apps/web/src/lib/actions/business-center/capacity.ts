'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { updateCapacity } from '@/lib/api/users';
import { withErrorHandling, type ActionResult } from './errors';

export async function updateCapacityAction(
  userId: string,
  capacityPercentage: number
): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

    // Validate capacity percentage
    if (capacityPercentage < 0 || capacityPercentage > 150) {
      throw new Error('Capacity must be between 0% and 150%');
    }

    const result = await updateCapacity(userId, { capacityPercentage });

    if (!result.success) {
      throw new Error(result.error);
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/team-capacity');
  });
}
