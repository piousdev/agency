'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { createClient, updateClient } from '@/lib/api/clients';
import { withErrorHandling, type ActionResult } from './errors';
import { createClientSchema, updateClientSchema } from '@/lib/schemas';

/**
 * Create a new client
 */
export async function createClientAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; clientId?: string }> {
  const user = await requireUser();
  if (!user.isInternal) {
    return { success: false, error: 'Access denied: Internal team only' };
  }

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    type: (formData.get('type') as string) || 'creative',
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    website: (formData.get('website') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  };

  // Validate with Zod
  const parsed = createClientSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  try {
    // Create client via API
    const result = await createClient(parsed.data);
    if (!result.success) {
      return { success: false, error: 'Failed to create client' };
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/clients');

    return { success: true, clientId: result.data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client',
    };
  }
}

/**
 * Update an existing client
 */
export async function updateClientFullAction(
  clientId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; clientId?: string }> {
  const user = await requireUser();
  if (!user.isInternal) {
    return { success: false, error: 'Access denied: Internal team only' };
  }

  // Parse form data - only include fields that are present
  const rawData: Record<string, unknown> = {};

  const name = formData.get('name');
  if (name) rawData.name = name;

  const type = formData.get('type');
  if (type) rawData.type = type;

  const email = formData.get('email');
  if (email) rawData.email = email;

  const phone = formData.get('phone');
  if (phone !== null) rawData.phone = phone || null;

  const website = formData.get('website');
  if (website !== null) rawData.website = website || null;

  const address = formData.get('address');
  if (address !== null) rawData.address = address || null;

  const notes = formData.get('notes');
  if (notes !== null) rawData.notes = notes || null;

  const active = formData.get('active');
  if (active !== null) rawData.active = active === 'true';

  // Validate with Zod
  const parsed = updateClientSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
    return { success: false, error: firstError };
  }

  try {
    // Update client via API
    const result = await updateClient(clientId, parsed.data);
    if (!result.success) {
      return { success: false, error: 'Failed to update client' };
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/clients');
    revalidatePath(`/dashboard/business-center/clients/${clientId}`);

    return { success: true, clientId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client',
    };
  }
}

/**
 * Deactivate (soft delete) a client
 */
export async function deactivateClientAction(clientId: string): Promise<ActionResult> {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user.isInternal) {
      throw new Error('Access denied: Internal team only');
    }

    // Soft delete by setting active to false
    const result = await updateClient(clientId, { active: false });

    if (!result.success) {
      throw new Error('Failed to deactivate client');
    }

    revalidatePath('/dashboard/business-center');
    revalidatePath('/dashboard/business-center/clients');
  });
}
