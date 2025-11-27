/**
 * Intake Pipeline Server Actions Integration Tests
 * Tests for request CRUD operations, transitions, estimation, and conversion flows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  createRequest,
  updateRequest,
  getRequest,
  listRequests,
  getStageCounts,
  transitionRequest,
  holdRequest,
  resumeRequest,
  estimateRequest,
  convertRequest,
  assignPm,
  bulkTransitionRequests,
  bulkAssignPm,
} from '../requests';

import type { Request } from '@/lib/api/requests/types';

// Import server actions after mocks

// Mock dependencies
const mockGetAuthHeaders = vi.fn();
const mockGetApiUrl = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock('@/lib/api/requests/api-utils', () => ({
  getAuthHeaders: async (): Promise<Record<string, string>> => mockGetAuthHeaders() as Promise<Record<string, string>>,
  getApiUrl: (): string => mockGetApiUrl() as string,
}));

vi.mock('next/cache', () => ({
  revalidatePath: (path: string): void => {
    mockRevalidatePath(path);
  },
}));

// Test fixtures
const mockRequest: Request = {
  id: 'req-123',
  requestNumber: 'REQ-001',
  title: 'Test Feature Request',
  description: 'A test description',
  type: 'feature',
  stage: 'in_treatment',
  priority: 'high',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stageEnteredAt: new Date().toISOString(),
  requesterId: 'user-1',
  storyPoints: null,
  confidence: null,
  clientId: null,
  client: null,
  assignedPmId: null,
  assignedPm: null,
  tags: ['frontend'],
};

const mockEstimatedRequest: Request = {
  ...mockRequest,
  stage: 'ready',
  storyPoints: 8,
  confidence: 'high',
};

describe('Request Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthHeaders.mockResolvedValue({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    });
    mockGetApiUrl.mockReturnValue('http://localhost:3001');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // CREATE REQUEST FLOW
  // ============================================
  describe('createRequest', () => {
    const mockInput = {
      title: 'New Feature Request',
      description: 'Description for the feature',
      type: 'feature' as const,
      priority: 'high' as const,
      tags: ['frontend', 'urgent'],
    };

    it('should create a request successfully', async () => {
      const mockResponse = { data: mockRequest };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createRequest(mockInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockRequest);
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockInput),
        })
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/business-center/intake');
    });

    it('should handle API error on create', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Validation error: title is required' }),
      });

      const result = await createRequest(mockInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('title is required');
      }
    });

    it('should handle network error on create', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await createRequest(mockInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle JSON parse error on failure response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await createRequest(mockInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to create request');
      }
    });
  });

  // ============================================
  // UPDATE REQUEST FLOW
  // ============================================
  describe('updateRequest', () => {
    const mockUpdateInput = {
      title: 'Updated Title',
      priority: 'critical' as const,
    };

    it('should update a request successfully', async () => {
      const updatedRequest = { ...mockRequest, ...mockUpdateInput };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: updatedRequest }),
      });

      const result = await updateRequest('req-123', mockUpdateInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Updated Title');
        expect(result.data.priority).toBe('critical');
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/req-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(mockUpdateInput),
        })
      );
    });

    it('should handle not found error on update', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Request not found' }),
      });

      const result = await updateRequest('nonexistent-id', mockUpdateInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });
  });

  // ============================================
  // GET REQUEST FLOW
  // ============================================
  describe('getRequest', () => {
    it('should fetch a single request successfully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockRequest }),
      });

      const result = await getRequest('req-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('req-123');
        expect(result.data.title).toBe('Test Feature Request');
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/req-123',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle not found error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Request not found' }),
      });

      const result = await getRequest('nonexistent-id');

      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // LIST REQUESTS FLOW
  // ============================================
  describe('listRequests', () => {
    const mockListResponse = {
      data: [mockRequest],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    it('should list requests with no filters', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponse),
      });

      const result = await listRequests();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.requests).toHaveLength(1);
        expect(result.data.pagination.total).toBe(1);
      }
    });

    it('should list requests with stage filter', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponse),
      });

      const result = await listRequests({ stage: 'in_treatment' });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('stage=in_treatment'),
        expect.any(Object)
      );
    });

    it('should list requests with multiple filters', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponse),
      });

      const result = await listRequests({
        stage: 'estimation',
        priority: 'high',
        type: 'feature',
        search: 'test',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(fetchCall).toContain('stage=estimation');
      expect(fetchCall).toContain('priority=high');
      expect(fetchCall).toContain('type=feature');
      expect(fetchCall).toContain('search=test');
    });
  });

  // ============================================
  // STAGE COUNTS FLOW
  // ============================================
  describe('getStageCounts', () => {
    const mockCounts = {
      in_treatment: 5,
      on_hold: 2,
      estimation: 3,
      ready: 8,
    };

    it('should fetch stage counts successfully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockCounts }),
      });

      const result = await getStageCounts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.in_treatment).toBe(5);
        expect(result.data.ready).toBe(8);
      }
    });
  });

  // ============================================
  // STAGE TRANSITION FLOW
  // ============================================
  describe('transitionRequest', () => {
    it('should transition request to new stage', async () => {
      const transitionedRequest = { ...mockRequest, stage: 'estimation' as const };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: transitionedRequest }),
      });

      const result = await transitionRequest('req-123', 'estimation');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('estimation');
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/req-123/transition',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ toStage: 'estimation', reason: undefined }),
        })
      );
    });

    it('should transition with reason', async () => {
      const transitionedRequest = { ...mockRequest, stage: 'on_hold' as const };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: transitionedRequest }),
      });

      const result = await transitionRequest('req-123', 'on_hold', 'Waiting for client feedback');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ toStage: 'on_hold', reason: 'Waiting for client feedback' }),
        })
      );
    });

    it('should handle invalid transition error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid stage transition' }),
      });

      const result = await transitionRequest('req-123', 'ready');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid stage transition');
      }
    });
  });

  // ============================================
  // HOLD REQUEST FLOW
  // ============================================
  describe('holdRequest', () => {
    it('should put request on hold with reason', async () => {
      const heldRequest = { ...mockRequest, stage: 'on_hold' as const };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: heldRequest }),
      });

      const result = await holdRequest('req-123', {
        reason: 'Waiting for budget approval',
        expectedResumeDate: '2024-02-01',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('on_hold');
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/req-123/hold',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // ============================================
  // RESUME REQUEST FLOW
  // ============================================
  describe('resumeRequest', () => {
    it('should resume request from on_hold', async () => {
      const resumedRequest = { ...mockRequest, stage: 'in_treatment' as const };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: resumedRequest }),
      });

      const result = await resumeRequest('req-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('in_treatment');
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/req-123/resume',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // ============================================
  // ESTIMATION FLOW
  // ============================================
  describe('estimateRequest', () => {
    const estimationInput = {
      storyPoints: 8,
      confidence: 'high' as const,
      estimatorNotes: 'Standard feature implementation',
    };

    it('should submit estimation and transition to ready', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockEstimatedRequest }),
      });

      const result = await estimateRequest('req-123', estimationInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('ready');
        expect(result.data.storyPoints).toBe(8);
        expect(result.data.confidence).toBe('high');
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/req-123/estimate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(estimationInput),
        })
      );
    });

    it('should handle estimation error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Request must be in estimation stage' }),
      });

      const result = await estimateRequest('req-123', estimationInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('estimation stage');
      }
    });
  });

  // ============================================
  // CONVERSION FLOW
  // ============================================
  describe('convertRequest', () => {
    it('should convert request to ticket', async () => {
      const convertResponse = {
        type: 'ticket',
        entityId: 'ticket-456',
        request: { ...mockEstimatedRequest, isConverted: true },
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: convertResponse }),
      });

      const result = await convertRequest('req-123', { type: 'ticket' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('ticket');
        expect(result.data.entityId).toBe('ticket-456');
      }
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/business-center/intake');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/business-center/projects');
    });

    it('should convert request to project', async () => {
      const convertResponse = {
        type: 'project',
        entityId: 'project-789',
        request: { ...mockEstimatedRequest, isConverted: true },
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: convertResponse }),
      });

      const result = await convertRequest('req-123', { type: 'project' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('project');
        expect(result.data.entityId).toBe('project-789');
      }
    });

    it('should handle conversion with custom title', async () => {
      const convertResponse = {
        type: 'ticket',
        entityId: 'ticket-456',
        request: { ...mockEstimatedRequest, isConverted: true },
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: convertResponse }),
      });

      const result = await convertRequest('req-123', {
        type: 'ticket',
        title: 'Custom Ticket Title',
        clientId: 'client-1',
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            type: 'ticket',
            title: 'Custom Ticket Title',
            clientId: 'client-1',
          }),
        })
      );
    });

    it('should handle conversion error for non-ready request', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Request must be in ready stage to convert' }),
      });

      const result = await convertRequest('req-123', { type: 'ticket' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ready stage');
      }
    });
  });

  // ============================================
  // ASSIGN PM FLOW
  // ============================================
  describe('assignPm', () => {
    it('should assign PM to request', async () => {
      const assignedRequest = {
        ...mockRequest,
        assignedPmId: 'pm-1',
        assignedPm: { id: 'pm-1', name: 'John Doe', email: 'john@example.com', image: null },
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: assignedRequest }),
      });

      const result = await assignPm('req-123', 'pm-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.assignedPmId).toBe('pm-1');
        expect(result.data.assignedPm?.name).toBe('John Doe');
      }
    });
  });

  // ============================================
  // BULK OPERATIONS FLOW
  // ============================================
  describe('bulkTransitionRequests', () => {
    it('should transition multiple requests', async () => {
      const bulkResponse = {
        succeeded: ['req-1', 'req-2'],
        failed: [],
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: bulkResponse }),
      });

      const result = await bulkTransitionRequests(['req-1', 'req-2'], 'estimation');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.succeeded).toHaveLength(2);
        expect(result.data.failed).toHaveLength(0);
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/bulk/transition',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ requestIds: ['req-1', 'req-2'], toStage: 'estimation' }),
        })
      );
    });

    it('should handle partial failures in bulk transition', async () => {
      const bulkResponse = {
        succeeded: ['req-1'],
        failed: [{ id: 'req-2', error: 'Invalid stage transition' }],
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: bulkResponse }),
      });

      const result = await bulkTransitionRequests(['req-1', 'req-2'], 'ready');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.succeeded).toHaveLength(1);
        expect(result.data.failed).toHaveLength(1);
        const firstFailed = result.data.failed[0];
        expect(firstFailed?.error).toContain('Invalid stage transition');
      }
    });
  });

  describe('bulkAssignPm', () => {
    it('should assign PM to multiple requests', async () => {
      const bulkResponse = {
        succeeded: ['req-1', 'req-2', 'req-3'],
        failed: [],
      };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: bulkResponse }),
      });

      const result = await bulkAssignPm(['req-1', 'req-2', 'req-3'], 'pm-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.succeeded).toHaveLength(3);
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/requests/bulk/assign',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ requestIds: ['req-1', 'req-2', 'req-3'], assignedPmId: 'pm-1' }),
        })
      );
    });
  });

  // ============================================
  // AUTH INTEGRATION
  // ============================================
  describe('Auth Integration', () => {
    it('should include auth headers in all requests', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockRequest }),
      });

      await getRequest('req-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        })
      );
    });

    it('should handle auth error', async () => {
      mockGetAuthHeaders.mockRejectedValueOnce(new Error('Not authenticated'));

      const result = await getRequest('req-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  // ============================================
  // CACHE INVALIDATION
  // ============================================
  describe('Cache Invalidation', () => {
    it('should revalidate intake path after create', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockRequest }),
      });

      await createRequest({ title: 'Test', type: 'feature', priority: 'medium' });

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/business-center/intake');
    });

    it('should revalidate multiple paths after convert', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { type: 'project', entityId: 'proj-1', request: mockRequest } }),
      });

      await convertRequest('req-123', { type: 'project' });

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/business-center/intake');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/business-center/projects');
    });
  });
});
