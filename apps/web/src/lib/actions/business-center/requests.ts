'use server';

import { revalidatePath } from 'next/cache';

import { getAuthHeaders, getApiUrl } from '@/lib/api/requests/api-utils';

import { handleApiError, BusinessCenterError, type ActionResponse } from './errors';

import type {
  Request,
  RequestWithRelations,
  ListRequestsFilters,
  StageCounts,
  ListRequestsResponse,
  RequestResponse,
  StageCountsResponse,
  ConvertResponse,
} from '@/lib/api/requests/types';
import type {
  CreateRequestInput,
  UpdateRequestInput,
  EstimateRequestInput,
  ConvertRequestInput,
  HoldRequestInput,
} from '@/lib/schemas/request';



// Helper to safely parse JSON with error fallback
async function safeJsonParse<T>(response: Response, fallback: T): Promise<T> {
  try {
    return await response.json() as T;
  } catch {
    return fallback;
  }
}

// ============================================
// Query Actions (Read)
// ============================================

/**
 * List requests with filtering and pagination
 */
export async function listRequests(
  filters: ListRequestsFilters = {}
): Promise<
  ActionResponse<{ requests: Request[]; pagination: ListRequestsResponse['pagination'] }>
> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const params = new URLSearchParams();
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.type) params.set('type', filters.type);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.assignedPmId) params.set('assignedPmId', filters.assignedPmId);
    if (filters.clientId) params.set('clientId', filters.clientId);
    if (filters.isConverted !== undefined) params.set('isConverted', String(filters.isConverted));
    if (filters.isCancelled !== undefined) params.set('isCancelled', String(filters.isCancelled));
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const response = await fetch(`${apiUrl}/api/requests?${params.toString()}`, {
      method: 'GET',
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to fetch requests' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to fetch requests',
        'FETCH_ERROR'
      );
    }

    const data = await response.json() as ListRequestsResponse;
    return { success: true, data: { requests: data.data, pagination: data.pagination } };
  } catch (error) {
    return handleApiError(error, 'List requests');
  }
}

/**
 * Get a single request by ID
 */
export async function getRequest(id: string): Promise<ActionResponse<RequestWithRelations>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}`, {
      method: 'GET',
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to fetch request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to fetch request',
        'FETCH_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Get request');
  }
}

/**
 * Get stage counts
 */
export async function getStageCounts(): Promise<ActionResponse<StageCounts>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/stage-counts`, {
      method: 'GET',
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to fetch stage counts' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to fetch stage counts',
        'FETCH_ERROR'
      );
    }

    const data = await response.json() as StageCountsResponse;
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Get stage counts');
  }
}

// ============================================
// Mutation Actions (Create/Update/Delete)
// ============================================

/**
 * Create a new request
 */
export async function createRequest(input: CreateRequestInput): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to create request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to create request',
        'CREATE_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Create request');
  }
}

/**
 * Update a request
 */
export async function updateRequest(
  id: string,
  input: UpdateRequestInput
): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to update request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to update request',
        'UPDATE_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    revalidatePath(`/dashboard/business-center/intake/${id}`);
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Update request');
  }
}

/**
 * Cancel (soft delete) a request
 */
export async function cancelRequest(id: string): Promise<ActionResponse> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to cancel request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to cancel request',
        'DELETE_ERROR'
      );
    }

    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: undefined };
  } catch (error) {
    return handleApiError(error, 'Cancel request');
  }
}

// ============================================
// Stage Transition Actions
// ============================================

/**
 * Transition a request to a different stage
 */
export async function transitionRequest(
  id: string,
  toStage: string,
  reason?: string
): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/transition`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ toStage, reason }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to transition request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to transition request',
        'TRANSITION_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Transition request');
  }
}

/**
 * Put a request on hold
 */
export async function holdRequest(
  id: string,
  input: HoldRequestInput
): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/hold`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to put request on hold' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to put request on hold',
        'HOLD_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Hold request');
  }
}

/**
 * Resume a request from hold
 */
export async function resumeRequest(id: string): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/resume`, {
      method: 'POST',
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to resume request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to resume request',
        'RESUME_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Resume request');
  }
}

/**
 * Submit estimation for a request
 */
export async function estimateRequest(
  id: string,
  input: EstimateRequestInput
): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/estimate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to submit estimation' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to submit estimation',
        'ESTIMATE_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Estimate request');
  }
}

/**
 * Convert a request to a project or ticket
 */
export async function convertRequest(
  id: string,
  input: ConvertRequestInput
): Promise<ActionResponse<ConvertResponse['data']>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/convert`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to convert request' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to convert request',
        'CONVERT_ERROR'
      );
    }

    const data = await response.json() as ConvertResponse;
    revalidatePath('/dashboard/business-center/intake');
    revalidatePath('/dashboard/business-center/projects');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Convert request');
  }
}

// ============================================
// Assignment Actions
// ============================================

/**
 * Assign a PM to a request
 */
export async function assignPm(id: string, assignedPmId: string): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/assign-pm`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ assignedPmId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to assign PM' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to assign PM',
        'ASSIGN_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Assign PM');
  }
}

/**
 * Assign an estimator to a request
 */
export async function assignEstimator(
  id: string,
  estimatorId: string
): Promise<ActionResponse<Request>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/${id}/assign-estimator`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ estimatorId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to assign estimator' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to assign estimator',
        'ASSIGN_ERROR'
      );
    }

    const data = await response.json() as RequestResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Assign estimator');
  }
}

// ============================================
// Bulk Operations
// ============================================

export interface BulkOperationResult {
  successIds: string[];
  failedIds: { id: string; error: string }[];
}

interface BulkOperationResponse {
  success: boolean;
  data: BulkOperationResult;
  message: string;
}

/**
 * Bulk transition requests to a different stage
 */
export async function bulkTransitionRequests(
  requestIds: string[],
  toStage: string,
  reason?: string
): Promise<ActionResponse<BulkOperationResult>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/bulk/transition`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ requestIds, toStage, reason }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to bulk transition requests' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to bulk transition requests',
        'BULK_TRANSITION_ERROR'
      );
    }

    const data = await response.json() as BulkOperationResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Bulk transition requests');
  }
}

/**
 * Bulk assign PM to requests
 */
export async function bulkAssignPm(
  requestIds: string[],
  assignedPmId: string
): Promise<ActionResponse<BulkOperationResult>> {
  try {
    const authHeaders = await getAuthHeaders();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/requests/bulk/assign`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ requestIds, assignedPmId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await safeJsonParse<{ error?: string; message?: string }>(response, { error: 'Failed to bulk assign PM' });
      throw new BusinessCenterError(
        error.error ?? error.message ?? 'Failed to bulk assign PM',
        'BULK_ASSIGN_ERROR'
      );
    }

    const data = await response.json() as BulkOperationResponse;
    revalidatePath('/dashboard/business-center/intake');
    return { success: true, data: data.data };
  } catch (error) {
    return handleApiError(error, 'Bulk assign PM');
  }
}
