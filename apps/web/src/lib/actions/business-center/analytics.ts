'use server';

import { getAuthHeaders, getApiUrl } from '@/lib/api/requests/api-utils';

export interface IntakeAnalytics {
  stageDistribution: { stage: string; count: number }[];
  requestsByType: { type: string; count: number }[];
  agingRequests: Record<string, number>;
  throughput: { week: string; count: number }[];
  avgTimeInStage: Record<string, number>;
  estimationConfidence: { confidence: string; count: number }[];
  storyPointsDistribution: { storyPoints: number; count: number }[];
  weeklyNewRequests: { week: string; count: number }[];
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
      headers: Object.assign({}, { 'Content-Type': 'application/json' }, authHeaders),
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData: { error?: string } = {};
      try {
        errorData = (await response.json()) as { error?: string };
      } catch {
        // Ignore JSON parse errors
      }
      return {
        success: false,
        error: errorData.error ?? `Failed to fetch analytics: ${String(response.status)}`,
      };
    }

    const data = (await response.json()) as AnalyticsResult;
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching analytics:', errorMessage);
    return {
      success: false,
      error: `Failed to fetch analytics: ${errorMessage}`,
    };
  }
}
