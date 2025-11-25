/**
 * Get dashboard preferences API
 */

import { getAuthHeaders, buildApiUrl } from './api-utils';
import type { ApiResponse, DashboardPreferences } from './types';

/**
 * Get current user's dashboard preferences
 */
export async function getDashboardPreferences(): Promise<ApiResponse<DashboardPreferences>> {
  try {
    const response = await fetch(buildApiUrl(''), {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch preferences',
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching dashboard preferences:', error);
    return {
      success: false,
      error: 'Failed to fetch preferences',
    };
  }
}
