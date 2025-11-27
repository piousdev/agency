/**
 * Save dashboard preferences API
 */

import { getAuthHeaders, buildApiUrl } from './api-utils';

import type {
  ApiResponse,
  DashboardPreferences,
  SavePreferencesInput,
  ResetPreferencesInput,
} from './types';

/**
 * Save user's dashboard preferences
 */
export async function saveDashboardPreferences(
  input: SavePreferencesInput
): Promise<ApiResponse<DashboardPreferences>> {
  try {
    const response = await fetch(buildApiUrl(''), {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as ApiResponse<DashboardPreferences> & { error?: string };

    if (!response.ok) {
      return {
        success: false,
        error: data.error ?? 'Failed to save preferences',
      };
    }

    return data as ApiResponse<DashboardPreferences>;
  } catch (error) {
    console.error('Error saving dashboard preferences:', error);
    return {
      success: false,
      error: 'Failed to save preferences',
    };
  }
}

/**
 * Reset user's dashboard preferences to role defaults
 */
export async function resetDashboardPreferences(
  input?: ResetPreferencesInput
): Promise<ApiResponse<DashboardPreferences>> {
  try {
    const response = await fetch(buildApiUrl('/reset'), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as ApiResponse<DashboardPreferences> & { error?: string };

    if (!response.ok) {
      return {
        success: false,
        error: data.error ?? 'Failed to reset preferences',
      };
    }

    return data as ApiResponse<DashboardPreferences>;
  } catch (error) {
    console.error('Error resetting dashboard preferences:', error);
    return {
      success: false,
      error: 'Failed to reset preferences',
    };
  }
}
