'use server';

/**
 * Dashboard Preferences Server Actions
 * Manages user dashboard layout and widget preferences
 */

import {
  getDashboardPreferences,
  saveDashboardPreferences,
  resetDashboardPreferences,
} from '@/lib/api/dashboard-preferences';
import { requireAuth } from '@/lib/auth/session';

import { withErrorHandling, type ActionResult } from './errors';

import type {
  DashboardPreferences,
  SavePreferencesInput,
  WidgetLayout,
} from '@/lib/api/dashboard-preferences';

// Re-export types for consumers
export type { DashboardPreferences, WidgetLayout };

/**
 * Fetch the current user's dashboard preferences
 * Returns role-based defaults if user hasn't customized
 */
export async function fetchDashboardPreferences(): Promise<ActionResult<DashboardPreferences>> {
  return withErrorHandling(async () => {
    await requireAuth();

    const response = await getDashboardPreferences();

    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to fetch preferences');
    }

    return response.data;
  });
}

/**
 * Save the user's dashboard preferences
 */
export async function updateDashboardPreferences(
  input: SavePreferencesInput
): Promise<ActionResult<DashboardPreferences>> {
  return withErrorHandling(async () => {
    await requireAuth();

    const response = await saveDashboardPreferences(input);

    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to save preferences');
    }

    return response.data;
  });
}

/**
 * Reset dashboard preferences to role defaults
 */
export async function resetToDefaultPreferences(): Promise<ActionResult<DashboardPreferences>> {
  return withErrorHandling(async () => {
    await requireAuth();

    const response = await resetDashboardPreferences();

    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to reset preferences');
    }

    return response.data;
  });
}
