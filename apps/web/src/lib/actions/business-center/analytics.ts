'use server';

import { getAuthHeaders, getApiUrl } from '@/lib/api/requests/api-utils';

export interface IntakeAnalytics {
  stageDistribution: Array<{ stage: string; count: number }>;
  requestsByType: Array<{ type: string; count: number }>;
  agingRequests: Record<string, number>;
  throughput: Array<{ week: string; count: number }>;
  avgTimeInStage: Record<string, number>;
  estimationConfidence: Array<{ confidence: string; count: number }>;
  storyPointsDistribution: Array<{ storyPoints: number; count: number }>;
  weeklyNewRequests: Array<{ week: string; count: number }>;
  summary: {
    totalActive: number;
    totalAging: number;
    convertedLast30Days: number;
    avgThroughputPerWeek: number;
  };
}

export interface AnalyticsResult {
  success: boolean;
  data?: IntakeAnalytics;
  error?: string;
}

/**
 * Fetch intake pipeline analytics
 */
export async function getIntakeAnalytics(): Promise<AnalyticsResult> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Failed to fetch analytics: ${response.status}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
}
