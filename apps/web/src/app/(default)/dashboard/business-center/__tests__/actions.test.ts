/**
 * Business Center Server Actions Tests
 * Tests for all server actions used in the Business Center
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// Import mocked functions for assertions
import { createTicket, assignTicket } from '@/lib/api/tickets';
import { assignProject, updateProjectStatus, updateProjectCompletion } from '@/lib/api/projects';
import { updateCapacity } from '@/lib/api/users';
import { revalidatePath } from 'next/cache';

describe('Business Center Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIntakeAction', () => {
    it('should create an intake ticket successfully', async () => {
      const mockTicket = { id: 'ticket-1', title: 'Test Ticket' };
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
    });
  });

  describe('assignTicketAction', () => {
    it('should assign a ticket to a user successfully', async () => {
      const mockTicket = { id: 'ticket-1', assignedToId: 'user-1' };
      vi.mocked(assignTicket).mockResolvedValue({ success: true, data: mockTicket });

      const formData = new FormData();
      formData.append('assignedToId', 'user-1');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(true);
      expect(assignTicket).toHaveBeenCalledWith('ticket-1', { assignedToId: 'user-1' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle null assignedToId (unassign)', async () => {
      const mockTicket = { id: 'ticket-1', assignedToId: null };
      vi.mocked(assignTicket).mockResolvedValue({ success: true, data: mockTicket });

      const formData = new FormData();
      // Empty assignedToId means unassign (null is valid)
      formData.append('assignedToId', '');

      const result = await assignTicketAction('ticket-1', null, formData);

      expect(result.success).toBe(true);
      expect(assignTicket).toHaveBeenCalledWith('ticket-1', { assignedToId: '' });
    });
  });

  describe('assignProjectAction', () => {
    it('should assign multiple users to a project successfully', async () => {
      const mockProject = { id: 'project-1', assignees: ['user-1', 'user-2'] };
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
    });
  });

  describe('updateProjectStatusAction', () => {
    it('should update project status successfully', async () => {
      const mockProject = { id: 'project-1', status: 'in_review' };
      vi.mocked(updateProjectStatus).mockResolvedValue({ success: true, data: mockProject });

      const formData = new FormData();
      formData.append('status', 'in_review');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(true);
      expect(updateProjectStatus).toHaveBeenCalledWith('project-1', { status: 'in_review' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/business-center');
    });

    it('should handle invalid status', async () => {
      const formData = new FormData();
      formData.append('status', 'invalid_status');

      const result = await updateProjectStatusAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProjectCompletionAction', () => {
    it('should update project completion percentage successfully', async () => {
      const mockProject = { id: 'project-1', completionPercentage: 75 };
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

    it('should handle invalid completion percentage', async () => {
      const formData = new FormData();
      formData.append('completionPercentage', '150'); // Invalid: > 100

      const result = await updateProjectCompletionAction('project-1', null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateCapacityAction', () => {
    it('should update user capacity successfully', async () => {
      const mockUser = { id: 'user-1', capacityPercentage: 80 };
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
  });
});
