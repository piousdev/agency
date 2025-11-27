/**
 * Zod Schemas Validation Tests
 * Tests for project, ticket, and client schemas
 */

import { describe, it, expect } from 'vitest';

import {
  createClientSchema,
  updateClientSchema,
  updateClientStatusSchema,
  bulkClientOperationSchema,
  clientTypeValues,
} from '../client';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  updateProjectCompletionSchema,
  assignProjectSchema,
  projectStatusValues,
  projectPriorityValues,
} from '../project';
import {
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  updateTicketPrioritySchema,
  assignTicketSchema,
  bulkTicketOperationSchema,
  ticketTypeValues,
  ticketStatusValues,
  ticketPriorityValues,
} from '../ticket';

describe('Project Schemas', () => {
  describe('createProjectSchema', () => {
    it('should validate a valid project', () => {
      const validProject = {
        name: 'Test Project',
        clientId: 'client-123',
        description: 'A test project',
        status: 'proposal',
        priority: 'medium',
      };

      const result = createProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('should require name and clientId', () => {
      const result = createProjectSchema.safeParse({});
      expect(result.success).toBe(false);

      if (!result.success) {
        const nameError = result.error.issues.find((issue) => issue.path.includes('name'));
        const clientIdError = result.error.issues.find((issue) => issue.path.includes('clientId'));
        expect(nameError).toBeDefined();
        expect(clientIdError).toBeDefined();
      }
    });

    it('should reject empty name', () => {
      const result = createProjectSchema.safeParse({
        name: '',
        clientId: 'client-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 255 characters', () => {
      const result = createProjectSchema.safeParse({
        name: 'a'.repeat(256),
        clientId: 'client-123',
      });
      expect(result.success).toBe(false);
    });

    it('should use default values for status and priority', () => {
      const result = createProjectSchema.safeParse({
        name: 'Test Project',
        clientId: 'client-123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('proposal');
        expect(result.data.priority).toBe('medium');
      }
    });

    it('should validate URLs', () => {
      const validResult = createProjectSchema.safeParse({
        name: 'Test Project',
        clientId: 'client-123',
        repositoryUrl: 'https://github.com/test/repo',
        productionUrl: 'https://example.com',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = createProjectSchema.safeParse({
        name: 'Test Project',
        clientId: 'client-123',
        repositoryUrl: 'not-a-url',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should allow empty string for optional URLs', () => {
      const result = createProjectSchema.safeParse({
        name: 'Test Project',
        clientId: 'client-123',
        repositoryUrl: '',
        productionUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('should validate completionPercentage bounds (0-100)', () => {
      const validResult = createProjectSchema.safeParse({
        name: 'Test',
        clientId: 'client-123',
        completionPercentage: 50,
      });
      expect(validResult.success).toBe(true);

      const invalidResult = createProjectSchema.safeParse({
        name: 'Test',
        clientId: 'client-123',
        completionPercentage: 150,
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should accept all valid status values', () => {
      projectStatusValues.forEach((status) => {
        const result = createProjectSchema.safeParse({
          name: 'Test',
          clientId: 'client-123',
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid priority values', () => {
      projectPriorityValues.forEach((priority) => {
        const result = createProjectSchema.safeParse({
          name: 'Test',
          clientId: 'client-123',
          priority,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateProjectSchema', () => {
    it('should allow partial updates', () => {
      const result = updateProjectSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateProjectSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should still validate provided fields', () => {
      const result = updateProjectSchema.safeParse({
        completionPercentage: 200, // Invalid
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProjectStatusSchema', () => {
    it('should require status field', () => {
      const result = updateProjectStatusSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept valid status', () => {
      const result = updateProjectStatusSchema.safeParse({ status: 'in_review' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateProjectStatusSchema.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProjectCompletionSchema', () => {
    it('should validate completion percentage bounds', () => {
      expect(updateProjectCompletionSchema.safeParse({ completionPercentage: 0 }).success).toBe(
        true
      );
      expect(updateProjectCompletionSchema.safeParse({ completionPercentage: 100 }).success).toBe(
        true
      );
      expect(updateProjectCompletionSchema.safeParse({ completionPercentage: -1 }).success).toBe(
        false
      );
      expect(updateProjectCompletionSchema.safeParse({ completionPercentage: 101 }).success).toBe(
        false
      );
    });

    it('should coerce string to number', () => {
      const result = updateProjectCompletionSchema.safeParse({ completionPercentage: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completionPercentage).toBe(50);
      }
    });
  });

  describe('assignProjectSchema', () => {
    it('should require at least one user', () => {
      expect(assignProjectSchema.safeParse({ userIds: [] }).success).toBe(false);
      expect(assignProjectSchema.safeParse({ userIds: ['user-1'] }).success).toBe(true);
    });
  });
});

describe('Ticket Schemas', () => {
  describe('createTicketSchema', () => {
    it('should validate a valid ticket', () => {
      const validTicket = {
        title: 'Test Ticket',
        description: 'A test description',
        clientId: 'client-123',
      };

      const result = createTicketSchema.safeParse(validTicket);
      expect(result.success).toBe(true);
    });

    it('should require title, description, and clientId', () => {
      const result = createTicketSchema.safeParse({});
      expect(result.success).toBe(false);

      if (!result.success) {
        const titleError = result.error.issues.find((issue) => issue.path.includes('title'));
        const descriptionError = result.error.issues.find((issue) =>
          issue.path.includes('description')
        );
        const clientIdError = result.error.issues.find((issue) => issue.path.includes('clientId'));
        expect(titleError).toBeDefined();
        expect(descriptionError).toBeDefined();
        expect(clientIdError).toBeDefined();
      }
    });

    it('should reject title longer than 500 characters', () => {
      const result = createTicketSchema.safeParse({
        title: 'a'.repeat(501),
        description: 'Test',
        clientId: 'client-123',
      });
      expect(result.success).toBe(false);
    });

    it('should use default values', () => {
      const result = createTicketSchema.safeParse({
        title: 'Test',
        description: 'Test desc',
        clientId: 'client-123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('intake');
        expect(result.data.priority).toBe('medium');
        expect(result.data.source).toBe('web_form');
      }
    });

    it('should validate email format', () => {
      const validResult = createTicketSchema.safeParse({
        title: 'Test',
        description: 'Test',
        clientId: 'client-123',
        contactEmail: 'test@example.com',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = createTicketSchema.safeParse({
        title: 'Test',
        description: 'Test',
        clientId: 'client-123',
        contactEmail: 'not-an-email',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should allow empty string for optional email', () => {
      const result = createTicketSchema.safeParse({
        title: 'Test',
        description: 'Test',
        clientId: 'client-123',
        contactEmail: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept all valid type values', () => {
      ticketTypeValues.forEach((type) => {
        const result = createTicketSchema.safeParse({
          title: 'Test',
          description: 'Test',
          clientId: 'client-123',
          type,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid priority values', () => {
      ticketPriorityValues.forEach((priority) => {
        const result = createTicketSchema.safeParse({
          title: 'Test',
          description: 'Test',
          clientId: 'client-123',
          priority,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateTicketSchema', () => {
    it('should allow partial updates', () => {
      const result = updateTicketSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateTicketSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept all valid status values', () => {
      ticketStatusValues.forEach((status) => {
        const result = updateTicketSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should validate time tracking fields', () => {
      // estimatedTime must be positive
      expect(updateTicketSchema.safeParse({ estimatedTime: 0 }).success).toBe(false);
      expect(updateTicketSchema.safeParse({ estimatedTime: 60 }).success).toBe(true);

      // timeSpent can be 0
      expect(updateTicketSchema.safeParse({ timeSpent: 0 }).success).toBe(true);
      expect(updateTicketSchema.safeParse({ timeSpent: -1 }).success).toBe(false);
    });
  });

  describe('updateTicketStatusSchema', () => {
    it('should require status', () => {
      expect(updateTicketStatusSchema.safeParse({}).success).toBe(false);
    });

    it('should reject invalid status', () => {
      expect(updateTicketStatusSchema.safeParse({ status: 'invalid' }).success).toBe(false);
    });
  });

  describe('updateTicketPrioritySchema', () => {
    it('should require priority', () => {
      expect(updateTicketPrioritySchema.safeParse({}).success).toBe(false);
    });

    it('should accept valid priorities', () => {
      ticketPriorityValues.forEach((priority) => {
        expect(updateTicketPrioritySchema.safeParse({ priority }).success).toBe(true);
      });
    });
  });

  describe('assignTicketSchema', () => {
    it('should accept valid assignee or null', () => {
      expect(assignTicketSchema.safeParse({ assignedToId: 'user-123' }).success).toBe(true);
      expect(assignTicketSchema.safeParse({ assignedToId: null }).success).toBe(true);
    });
  });

  describe('bulkTicketOperationSchema', () => {
    it('should require ticketIds and operation', () => {
      const result = bulkTicketOperationSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should require at least one ticket', () => {
      const result = bulkTicketOperationSchema.safeParse({
        ticketIds: [],
        operation: 'update_status',
      });
      expect(result.success).toBe(false);
    });

    it('should limit to 100 tickets', () => {
      const result = bulkTicketOperationSchema.safeParse({
        ticketIds: Array.from({ length: 101 }, (_, i) => `ticket-${String(i)}`),
        operation: 'update_status',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid operations', () => {
      const operations = ['update_status', 'update_priority', 'assign', 'link_project', 'delete'];
      operations.forEach((operation) => {
        const result = bulkTicketOperationSchema.safeParse({
          ticketIds: ['ticket-1'],
          operation,
        });
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Client Schemas', () => {
  describe('createClientSchema', () => {
    it('should validate a valid client', () => {
      const validClient = {
        name: 'Test Client',
        email: 'client@example.com',
      };

      const result = createClientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('should require name and email', () => {
      const result = createClientSchema.safeParse({});
      expect(result.success).toBe(false);

      if (!result.success) {
        const nameError = result.error.issues.find((issue) => issue.path.includes('name'));
        const emailError = result.error.issues.find((issue) => issue.path.includes('email'));
        expect(nameError).toBeDefined();
        expect(emailError).toBeDefined();
      }
    });

    it('should validate email format', () => {
      const result = createClientSchema.safeParse({
        name: 'Test',
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should use default type value', () => {
      const result = createClientSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('creative');
      }
    });

    it('should accept all valid type values', () => {
      clientTypeValues.forEach((type) => {
        const result = createClientSchema.safeParse({
          name: 'Test',
          email: 'test@example.com',
          type,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate website URL', () => {
      const validResult = createClientSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        website: 'https://example.com',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = createClientSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        website: 'not-a-url',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should allow empty strings for optional fields', () => {
      const result = createClientSchema.safeParse({
        name: 'Test',
        email: 'test@example.com',
        phone: '',
        website: '',
        address: '',
        notes: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 255 characters', () => {
      const result = createClientSchema.safeParse({
        name: 'a'.repeat(256),
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateClientSchema', () => {
    it('should allow partial updates', () => {
      const result = updateClientSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateClientSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate provided email', () => {
      const result = updateClientSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept boolean for active field', () => {
      expect(updateClientSchema.safeParse({ active: true }).success).toBe(true);
      expect(updateClientSchema.safeParse({ active: false }).success).toBe(true);
    });
  });

  describe('updateClientStatusSchema', () => {
    it('should require active boolean', () => {
      expect(updateClientStatusSchema.safeParse({}).success).toBe(false);
      expect(updateClientStatusSchema.safeParse({ active: true }).success).toBe(true);
      expect(updateClientStatusSchema.safeParse({ active: false }).success).toBe(true);
    });
  });

  describe('bulkClientOperationSchema', () => {
    it('should require clientIds and operation', () => {
      const result = bulkClientOperationSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should require at least one client', () => {
      const result = bulkClientOperationSchema.safeParse({
        clientIds: [],
        operation: 'activate',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid operations', () => {
      const operations = ['activate', 'deactivate', 'update_type', 'delete'];
      operations.forEach((operation) => {
        const result = bulkClientOperationSchema.safeParse({
          clientIds: ['client-1'],
          operation,
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
