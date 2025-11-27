/**
 * Business Center Server Actions Tests for all server actions used in the Business Center
 */

import { revalidatePath } from 'next/cache';

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import mocked functions for assertions
import { assignProject, updateProjectStatus, updateProjectCompletion } from '@/lib/api/projects';
import { createTicket, assignTicket } from '@/lib/api/tickets';
import { updateCapacity } from '@/lib/api/users';
import { assignTicketSchema } from '@/lib/schemas/ticket';

/**
 * Note:
 * 1. This test doesn't verify that revalidatePath is NOT called when the API fails. In error scenarios, you may not want to revalidate the cache. Add an assertion: expect(revalidatePath).not.toHaveBeenCalled();
 * 2. The test name mentions 'null assignedToId' but the test uses an empty string ''. This is inconsistent. Either update the test name to 'should handle empty assignedToId (unassign)' or actually test with null/undefined if that's the expected behavior.
 * 3. This test should verify that assignProject is NOT called when validation fails. Add: expect(assignProject).not.toHaveBeenCalled(); to ensure the action properly validates before calling the API.
 * 4. This test should verify that updateProjectStatus is NOT called when validation fails. Add: expect(updateProjectStatus).not.toHaveBeenCalled(); to ensure invalid input doesn't reach the API.
 * 5. This test should verify that updateProjectCompletion is NOT called when validation fails. Add: expect(updateProjectCompletion).not.toHaveBeenCalled(); to ensure invalid percentages don't reach the API.
 *
 */

import {
  createIntakeAction,
  assignTicketAction,
  assignProjectAction,
  updateProjectStatusAction,
  updateProjectCompletionAction,
  updateCapacityAction,
} from '../actions';

// Mock Next.js dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock API functions
vi.mock('@/lib/api/tickets', () => ({
  createTicket: vi.fn(),
  assignTicket: vi.fn(),
}));

vi.mock('@/lib/api/projects', () => ({
  assignProject: vi.fn(),
  updateProjectStatus: vi.fn(),
  updateProjectCompletion: vi.fn(),
}));

vi.mock('@/lib/api/users', () => ({
  updateCapacity: vi.fn(),
}));

describe('Business Center Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIntakeAction', () => {
    it('should create an intake ticket successfully', async () => {
      const mockTicket = {
        id: 'ticket-1',
        title: 'Test Ticket',
        ticketNumber: 'TKT-001',
        description: 'Test Description',
        type: 'intake' as const,
        priority: 'high' as const,
        status: 'open' as const,
        source: 'web_form' as const,
        clientId: 'client-1',
        createdById: 'user-1',
        assignedToId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        client: {} as any,
        createdBy: {} as any,
        assignedTo: null,
        attachments: [],
        activities: [],
        tags: [],
        metadata: null,
        projectId: null,
        project: null,
        estimatedHours: null,
        actualHours: null,
        dueDate: null,
        resolvedAt: null,
        closedAt: null,
        resolution: null,
        internalNotes: null,
        customFields: {},
        slaStatus: null,
        dueAt: null,
        firstResponseAt: null,
        firstResponseDueAt: null,
        resolutionDueAt: null,
        slaViolated: false,
        slaPaused: false,
        slaPausedAt: null,
        slaResumedAt: null,
        slaTotalPausedTime: 0,
        estimatedTime: null,
        timeSpent: null,
        contactEmail: null,
        contactPhone: null,
        externalId: null,
        parentTicketId: null,
        parentTicket: null,
        subTickets: [],
        linkedTickets: [],
        contactName: null,
        environment: null,
        affectedUrl: null,
        affectedUrls: [],
        browserInfo: null,
        osInfo: null,
        deviceInfo: null,
        priorityLevel: null,
      };
      vi.mocked(createTicket).mockResolvedValue({ success: true, data: mockTicket });

      const formData = new FormData();
      formData.append('clientId', 'client-1');
      formData.append('title', 'Test Ticket');
      formData.append('description', 'Test Description');
      formData.append('priority', 'high');

      const result = await createIntakeAction(null, formData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTicket);
      expect(createTicket).toHaveBeenCalledWith({
        clientId: 'client-1',
        title: 'Test Ticket',
        description: 'Test Description',
        type: 'intake',
        priority: 'high',
        source: 'web_form',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle validation errors', async () => {
      const formData = new FormData();
      formData.append('clientId', '');
      formData.append('title', '');
      formData.append('description', '');
      formData.append('priority', 'invalid');

      const result = await createIntakeAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(createTicket).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      vi.mocked(createTicket).mockResolvedValue({
        success: false,
        error: 'Failed to create ticket',
      });

      const formData = new FormData();
      formData.append('clientId', 'client-1');
      formData.append('title', 'Test Ticket');
      formData.append('description', 'Test Description');
      formData.append('priority', 'high');

      const result = await createIntakeAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create ticket');
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('assignTicketAction', () => {
    it('should assign a ticket to a user successfully', async () => {
      const mockTicket = {
        id: 'ticket-1',
        title: 'Test Ticket',
        ticketNumber: 'TKT-001',
        description: 'Test Description',
        type: 'intake' as const,
        priority: 'high' as const,
        status: 'open' as const,
        source: 'web_form' as const,
        clientId: 'client-1',
        createdById: 'user-1',
        assignedToId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        client: {} as any,
        createdBy: {} as any,
        assignedTo: {} as any,
        attachments: [],
        activities: [],
        tags: [],
        metadata: null,
        projectId: null,
        project: null,
        estimatedHours: null,
        actualHours: null,
        dueDate: null,
        resolvedAt: null,
        closedAt: null,
        resolution: null,
        internalNotes: null,
        customFields: {},
        slaStatus: null,
        dueAt: null,
        firstResponseAt: null,
        firstResponseDueAt: null,
        resolutionDueAt: null,
        slaViolated: false,
        slaPaused: false,
        slaPausedAt: null,
        slaResumedAt: null,
        slaTotalPausedTime: 0,
        estimatedTime: null,
        timeSpent: null,
        contactEmail: null,
        contactPhone: null,
        externalId: null,
        parentTicketId: null,
        parentTicket: null,
        subTickets: [],
        linkedTickets: [],
        contactName: null,
        environment: null,
        affectedUrl: null,
        affectedUrls: [],
        browserInfo: null,
        osInfo: null,
        deviceInfo: null,
        priorityLevel: null,
      };
      vi.mocked(assignTicket).mockResolvedValue({ success: true, data: mockTicket });

      const formData = new FormData();
      formData.append('assignedToId', 'user-1');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(true);
      expect(assignTicket).toHaveBeenCalledWith('ticket-1', { assignedToId: 'user-1' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });
    it('should handle empty assignedToId (interpreted as unassign/null)', async () => {
      const mockTicket = { id: 'ticket-1', assignedToId: null } as any;
      vi.mocked(assignTicket).mockResolvedValue({ success: true, data: mockTicket });

      const formData = new FormData();
      // Empty assignedToId is interpreted as unassign (converted to null)
      formData.append('assignedToId', '');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(true);
      expect(assignTicket).toHaveBeenCalledWith('ticket-1', { assignedToId: null });
    });

    it('should handle null assignedToId (explicitly unassign)', async () => {
      const mockTicket = { id: 'ticket-1', assignedToId: null } as any;
      vi.mocked(assignTicket).mockResolvedValue({ success: true, data: mockTicket });

      const formData = new FormData();
      // Simulate null assignedToId by not appending the field at all
      // or you can explicitly set it to null if your implementation supports it
      // Here, we simulate by not appending
      // formData.append('assignedToId', null); // Not valid for FormData, so skip append

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(true);
      expect(assignTicket).toHaveBeenCalledWith('ticket-1', { assignedToId: null });
    });
  });

  describe('assignProjectAction', () => {
    it('should assign multiple users to a project successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test Description',
        status: 'in_development' as const,
        priority: 'medium' as const,
        startDate: new Date().toISOString(),
        endDate: null,
        clientId: 'client-1',
        createdById: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teamMembers: [],
        client: {} as any,
        tickets: [],
        estimatedHours: null,
        actualHours: null,
        budget: null,
        completionPercentage: 0,
        assignees: [],
        deliveredAt: null,
      };
      vi.mocked(assignProject).mockResolvedValue({ success: true, data: mockProject });

      const formData = new FormData();
      formData.append('userIds', 'user-1');
      formData.append('userIds', 'user-2');

      const result = await assignProjectAction('project-1', null, formData);

      expect(result.success).toBe(true);
      expect(assignProject).toHaveBeenCalledWith('project-1', { userIds: ['user-1', 'user-2'] });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle empty user list', async () => {
      const formData = new FormData();

      const result = await assignProjectAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(assignProject).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should not call assignProject when userIds is missing or invalid', async () => {
      const formData = new FormData();
      // userIds not appended at all

      const result = await assignProjectAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(assignProject).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updateProjectStatusAction', () => {
    it('should update project status successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test Description',
        status: 'in_review' as const,
        priority: 'medium' as const,
        startDate: new Date().toISOString(),
        endDate: null,
        clientId: 'client-1',
        createdById: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teamMembers: [],
        client: {} as any,
        tickets: [],
        estimatedHours: null,
        actualHours: null,
        budget: null,
        completionPercentage: 0,
        assignees: [],
        deliveredAt: null,
      };
      vi.mocked(updateProjectStatus).mockResolvedValue({ success: true, data: mockProject });

      const formData = new FormData();
      formData.append('status', 'in_review');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(true);
      expect(updateProjectStatus).toHaveBeenCalledWith('project-1', { status: 'in_review' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle missing status', async () => {
      const formData = new FormData();
      // No status appended

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateProjectStatus).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle invalid status', async () => {
      const formData = new FormData();
      formData.append('status', 'invalid_status');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateProjectStatus).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updateProjectCompletionAction', () => {
    it('should update project completion percentage successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test Description',
        status: 'in_development' as const,
        priority: 'medium' as const,
        startDate: new Date().toISOString(),
        endDate: null,
        clientId: 'client-1',
        createdById: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teamMembers: [],
        client: {} as any,
        tickets: [],
        estimatedHours: null,
        actualHours: null,
        budget: null,
        completionPercentage: 75,
        assignees: [],
        deliveredAt: null,
      };
      vi.mocked(updateProjectCompletion).mockResolvedValue({ success: true, data: mockProject });

      const formData = new FormData();
      formData.append('completionPercentage', '75');

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(true);
      expect(updateProjectCompletion).toHaveBeenCalledWith('project-1', {
        completionPercentage: 75,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle completion percentage above 100', async () => {
      const formData = new FormData();
      formData.append('completionPercentage', '150'); // Invalid: > 100

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateProjectCompletion).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle negative completion percentage', async () => {
      const formData = new FormData();
      formData.append('completionPercentage', '-10'); // Invalid: < 0

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateProjectCompletion).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle non-numeric completion percentage', async () => {
      const formData = new FormData();
      formData.append('completionPercentage', 'not_a_number'); // Invalid: not a number

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(updateProjectCompletion).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updateCapacityAction', () => {
    it('should update user capacity successfully', async () => {
      const mockUser = {
        id: 'user-1',
        capacityPercentage: 80,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
      } as any;
      vi.mocked(updateCapacity).mockResolvedValue({ success: true, data: mockUser });

      const formData = new FormData();
      formData.append('capacityPercentage', '80');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(true);
      expect(updateCapacity).toHaveBeenCalledWith('user-1', { capacityPercentage: 80 });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle capacity above 200%', async () => {
      const formData = new FormData();
      formData.append('capacityPercentage', '250'); // Invalid: > 200

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle negative capacity', async () => {
      const formData = new FormData();
      formData.append('capacityPercentage', '-10');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing capacity percentage', async () => {
      const formData = new FormData();
      // No capacityPercentage added

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Capacity percentage is required and must be a valid number.');
      expect(updateCapacity).not.toHaveBeenCalled();
    });

    it('should handle empty string capacity percentage', async () => {
      const formData = new FormData();
      formData.append('capacityPercentage', '');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Capacity percentage is required and must be a valid number.');
      expect(updateCapacity).not.toHaveBeenCalled();
    });

    it('should handle non-numeric capacity percentage', async () => {
      const formData = new FormData();
      formData.append('capacityPercentage', 'invalid');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Capacity percentage is required and must be a valid number.');
      expect(updateCapacity).not.toHaveBeenCalled();
    });

    it('should handle API errors when updating capacity', async () => {
      vi.mocked(updateCapacity).mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const formData = new FormData();
      formData.append('capacityPercentage', '80');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions when updating capacity', async () => {
      vi.mocked(updateCapacity).mockRejectedValue('String error');

      const formData = new FormData();
      formData.append('capacityPercentage', '80');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Error handling for Error instances', () => {
    it('should handle Error exception in createIntakeAction', async () => {
      vi.mocked(createTicket).mockRejectedValue(new Error('Custom error message'));

      const formData = new FormData();
      formData.append('clientId', 'client-1');
      formData.append('title', 'Test Ticket');
      formData.append('description', 'Test Description');
      formData.append('priority', 'high');

      const result = await createIntakeAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Custom error message');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle Error exception in assignTicketAction', async () => {
      vi.mocked(assignTicket).mockRejectedValue(new Error('Ticket assignment failed'));

      const formData = new FormData();
      formData.append('assignedToId', 'user-1');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ticket assignment failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle Error exception in assignProjectAction', async () => {
      vi.mocked(assignProject).mockRejectedValue(new Error('Project assignment failed'));

      const formData = new FormData();
      formData.append('userIds', 'user-1');

      const result = await assignProjectAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project assignment failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle Error exception in updateProjectStatusAction', async () => {
      vi.mocked(updateProjectStatus).mockRejectedValue(new Error('Status update failed'));

      const formData = new FormData();
      formData.append('status', 'in_review');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Status update failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle Error exception in updateProjectCompletionAction', async () => {
      vi.mocked(updateProjectCompletion).mockRejectedValue(new Error('Completion update failed'));

      const formData = new FormData();
      formData.append('completionPercentage', '75');

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Completion update failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle Error exception in updateCapacityAction', async () => {
      vi.mocked(updateCapacity).mockRejectedValue(new Error('Capacity update failed'));

      const formData = new FormData();
      formData.append('capacityPercentage', '80');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Capacity update failed');
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Error handling for non-Error exceptions', () => {
    it('should handle non-Error exception in createIntakeAction', async () => {
      vi.mocked(createTicket).mockRejectedValue('String error');

      const formData = new FormData();
      formData.append('clientId', 'client-1');
      formData.append('title', 'Test Ticket');
      formData.append('description', 'Test Description');
      formData.append('priority', 'high');

      const result = await createIntakeAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle non-Error exception in assignTicketAction', async () => {
      vi.mocked(assignTicket).mockRejectedValue('String error');

      const formData = new FormData();
      formData.append('assignedToId', 'user-1');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle non-Error exception in assignProjectAction', async () => {
      vi.mocked(assignProject).mockRejectedValue('String error');

      const formData = new FormData();
      formData.append('userIds', 'user-1');

      const result = await assignProjectAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle non-Error exception in updateProjectStatusAction', async () => {
      vi.mocked(updateProjectStatus).mockRejectedValue('String error');

      const formData = new FormData();
      formData.append('status', 'in_review');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle non-Error exception in updateProjectCompletionAction', async () => {
      vi.mocked(updateProjectCompletion).mockRejectedValue('String error');

      const formData = new FormData();
      formData.append('completionPercentage', '75');

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('Validation error fallback messages', () => {
    it('should use fallback message when createTicketSchema validation has no issues', async () => {
      const { createTicketSchema } = await import('@/lib/schemas/ticket');
      const spy = vi.spyOn(createTicketSchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          issues: [],
          format: vi.fn(),
          flatten: vi.fn(),
          formErrors: { formErrors: [], fieldErrors: {} },
          name: 'ZodError',
          message: '',
          errors: [],
          isEmpty: true,
          addIssue: vi.fn(),
          addIssues: vi.fn(),
          toString: vi.fn(),
        } as any,
      });

      const formData = new FormData();
      formData.append('clientId', 'client-1');
      formData.append('title', 'Test');
      formData.append('description', 'Test');
      formData.append('priority', 'high');

      const result = await createIntakeAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');

      spy.mockRestore();
    });

    it('should use fallback message when validation error has no message in assignTicketAction', async () => {
      // Mock safeParse to return error with no message
      const spy = vi.spyOn(assignTicketSchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          issues: [],
          format: vi.fn(),
          flatten: vi.fn(),
          formErrors: { formErrors: [], fieldErrors: {} },
          name: 'ZodError',
          message: '',
          errors: [],
          isEmpty: true,
          addIssue: vi.fn(),
          addIssues: vi.fn(),
          toString: vi.fn(),
        } as any,
      });

      const formData = new FormData();
      formData.append('assignedToId', 'user-1');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');

      // Restore the spy
      spy.mockRestore();
    });

    it('should use fallback message when assignProjectSchema validation has no issues', async () => {
      const { assignProjectSchema } = await import('@/lib/schemas/project');
      const spy = vi.spyOn(assignProjectSchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          issues: [],
          format: vi.fn(),
          flatten: vi.fn(),
          name: 'ZodError',
          message: '',
          errors: [],
          isEmpty: true,
          addIssue: vi.fn(),
          addIssues: vi.fn(),
          toString: vi.fn(),
        } as any,
      });

      const formData = new FormData();
      formData.append('userIds', 'user-1');

      const result = await assignProjectAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');

      spy.mockRestore();
    });

    it('should use fallback message when updateProjectStatusSchema validation has no issues', async () => {
      const { updateProjectStatusSchema } = await import('@/lib/schemas/project');
      const spy = vi.spyOn(updateProjectStatusSchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          issues: [],
          format: vi.fn(),
          flatten: vi.fn(),
          name: 'ZodError',
          message: '',
          errors: [],
          isEmpty: true,
          addIssue: vi.fn(),
          addIssues: vi.fn(),
          toString: vi.fn(),
        } as any,
      });

      const formData = new FormData();
      formData.append('status', 'in_review');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');

      spy.mockRestore();
    });

    it('should use fallback message when updateProjectCompletionSchema validation has no issues', async () => {
      const { updateProjectCompletionSchema } = await import('@/lib/schemas/project');
      const spy = vi.spyOn(updateProjectCompletionSchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          issues: [],
          format: vi.fn(),
          flatten: vi.fn(),
          name: 'ZodError',
          message: '',
          errors: [],
          isEmpty: true,
          addIssue: vi.fn(),
          addIssues: vi.fn(),
          toString: vi.fn(),
        } as any,
      });

      const formData = new FormData();
      formData.append('completionPercentage', '75');

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');

      spy.mockRestore();
    });

    it('should use fallback message when updateCapacitySchema validation has no issues', async () => {
      const { updateCapacitySchema } = await import('@/lib/schemas/capacity');
      const spy = vi.spyOn(updateCapacitySchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          issues: [],
          format: vi.fn(),
          flatten: vi.fn(),
          name: 'ZodError',
          message: '',
          errors: [],
          isEmpty: true,
          addIssue: vi.fn(),
          addIssues: vi.fn(),
          toString: vi.fn(),
        } as any,
      });

      const formData = new FormData();
      formData.append('capacityPercentage', '80');

      const result = await updateCapacityAction('user-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');

      spy.mockRestore();
    });
  });

  describe('API error return statements coverage', () => {
    it('should return API error directly in assignTicketAction', async () => {
      vi.mocked(assignTicket).mockResolvedValue({ success: false, error: 'API Error' });

      const formData = new FormData();
      formData.append('assignedToId', 'user-1');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result).toEqual({ success: false, error: 'API Error' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should return API error directly in assignProjectAction', async () => {
      vi.mocked(assignProject).mockResolvedValue({ success: false, error: 'API Error' });

      const formData = new FormData();
      formData.append('userIds', 'user-1');

      const result = await assignProjectAction('project-1', null, formData);

      expect(result).toEqual({ success: false, error: 'API Error' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should return API error directly in updateProjectStatusAction', async () => {
      vi.mocked(updateProjectStatus).mockResolvedValue({ success: false, error: 'API Error' });

      const formData = new FormData();
      formData.append('status', 'in_review');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result).toEqual({ success: false, error: 'API Error' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should return API error directly in updateProjectCompletionAction', async () => {
      vi.mocked(updateProjectCompletion).mockResolvedValue({ success: false, error: 'API Error' });

      const formData = new FormData();
      formData.append('completionPercentage', '75');

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result).toEqual({ success: false, error: 'API Error' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });
  });
});
