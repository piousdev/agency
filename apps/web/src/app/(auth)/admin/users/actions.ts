/**
 * Server Actions for user management
 * Handles all user mutations (create, update, delete, role assignment)
 *
 * Security: All actions validate authentication and internal team member status
 */

'use server';

import { revalidatePath } from 'next/cache';

import {
  assignRole,
  deleteUser,
  extendExpiration,
  removeRole,
  updateInternalStatus,
  updateUser,
} from '@/lib/api/users';
import { requireRole } from '@/lib/auth/session';
import {
  assignRoleSchema,
  extendExpirationSchema,
  updateInternalStatusSchema,
  updateUserSchema,
} from '@/lib/schemas/user';

/**
 * Action state type for forms
 */
export interface ActionState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Update user details
 */
export async function updateUserAction(
  userId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Validate auth and role
    await requireRole('internal');

    // Parse and validate form data
    const data = {
      name: formData.get('name') as string | undefined,
      email: formData.get('email') as string | undefined,
      isInternal: formData.get('isInternal') === 'true' || undefined,
      expiresAt: (formData.get('expiresAt') as string) || null,
    };

    const validation = updateUserSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Call API
    await updateUser(userId, validation.data);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

/**
 * Delete a user
 */
export async function deleteUserAction(userId: string): Promise<ActionState> {
  try {
    // Validate auth and role
    await requireRole('internal');

    // Call API
    await deleteUser(userId);

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}

/**
 * Toggle internal team member status
 */
export async function toggleInternalStatusAction(
  userId: string,
  isInternal: boolean
): Promise<ActionState> {
  try {
    // Validate auth and role
    await requireRole('internal');

    // Validate data
    const validation = updateInternalStatusSchema.safeParse({ isInternal });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Call API
    await updateInternalStatus(userId, validation.data);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: 'Internal status updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update internal status',
    };
  }
}

/**
 * Extend user expiration date
 */
export async function extendExpirationAction(
  userId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Validate auth and role
    await requireRole('internal');

    // Parse and validate form data
    const expiresAt = (formData.get('expiresAt') as string) || null;
    const validation = extendExpirationSchema.safeParse({ expiresAt });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Call API
    await extendExpiration(userId, validation.data);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: 'Expiration date updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update expiration date',
    };
  }
}

/**
 * Assign role to user
 */
export async function assignRoleAction(
  userId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Validate auth and role
    await requireRole('internal');

    // Parse and validate form data
    const roleId = formData.get('roleId') as string;
    const validation = assignRoleSchema.safeParse({ roleId });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    // Call API
    await assignRole(userId, validation.data);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: 'Role assigned successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to assign role',
    };
  }
}

/**
 * Remove role from user
 */
export async function removeRoleAction(userId: string, roleId: string): Promise<ActionState> {
  try {
    // Validate auth and role
    await requireRole('internal');

    // Call API
    await removeRole(userId, roleId);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: 'Role removed successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to remove role',
    };
  }
}
