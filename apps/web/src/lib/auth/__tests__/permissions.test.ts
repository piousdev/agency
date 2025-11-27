/**
 * Permission Utilities Tests
 * Tests for permission constants, role permissions, and error handling
 */

import { describe, it, expect } from 'vitest';

import { PermissionError, isPermissionError } from '../permissions';
import { Permissions, DefaultRolePermissions, type Permission } from '../permissions-constants';

describe('Permission Constants', () => {
  describe('Permissions object', () => {
    it('should have all ticket permissions defined', () => {
      expect(Permissions.TICKET_CREATE).toBe('ticket:create');
      expect(Permissions.TICKET_EDIT).toBe('ticket:edit');
      expect(Permissions.TICKET_DELETE).toBe('ticket:delete');
      expect(Permissions.TICKET_ASSIGN).toBe('ticket:assign');
      expect(Permissions.TICKET_VIEW).toBe('ticket:view');
    });

    it('should have all project permissions defined', () => {
      expect(Permissions.PROJECT_CREATE).toBe('project:create');
      expect(Permissions.PROJECT_EDIT).toBe('project:edit');
      expect(Permissions.PROJECT_DELETE).toBe('project:delete');
      expect(Permissions.PROJECT_ASSIGN).toBe('project:assign');
      expect(Permissions.PROJECT_VIEW).toBe('project:view');
    });

    it('should have all client permissions defined', () => {
      expect(Permissions.CLIENT_CREATE).toBe('client:create');
      expect(Permissions.CLIENT_EDIT).toBe('client:edit');
      expect(Permissions.CLIENT_DELETE).toBe('client:delete');
      expect(Permissions.CLIENT_VIEW).toBe('client:view');
    });

    it('should have bulk operations permission', () => {
      expect(Permissions.BULK_OPERATIONS).toBe('bulk:operations');
    });

    it('should have admin permissions', () => {
      expect(Permissions.ADMIN_USERS).toBe('admin:users');
      expect(Permissions.ADMIN_ROLES).toBe('admin:roles');
    });

    it('should follow entity:action format for all permissions', () => {
      Object.values(Permissions).forEach((permission) => {
        expect(permission).toMatch(/^[a-z]+:[a-z_]+$/);
      });
    });
  });

  describe('DefaultRolePermissions', () => {
    it('should have admin role with all permissions', () => {
      const adminPermissions = DefaultRolePermissions.admin;
      const allPermissions = Object.values(Permissions);

      expect(adminPermissions).toHaveLength(allPermissions.length);
      allPermissions.forEach((permission) => {
        expect(adminPermissions).toContain(permission);
      });
    });

    it('should have editor role with appropriate permissions', () => {
      const editorPermissions = DefaultRolePermissions.editor;

      // Editor should have CRUD on tickets, projects, clients (except delete)
      expect(editorPermissions).toContain(Permissions.TICKET_CREATE);
      expect(editorPermissions).toContain(Permissions.TICKET_EDIT);
      expect(editorPermissions).toContain(Permissions.TICKET_ASSIGN);
      expect(editorPermissions).toContain(Permissions.TICKET_VIEW);
      expect(editorPermissions).toContain(Permissions.PROJECT_CREATE);
      expect(editorPermissions).toContain(Permissions.PROJECT_EDIT);
      expect(editorPermissions).toContain(Permissions.PROJECT_ASSIGN);
      expect(editorPermissions).toContain(Permissions.PROJECT_VIEW);
      expect(editorPermissions).toContain(Permissions.CLIENT_CREATE);
      expect(editorPermissions).toContain(Permissions.CLIENT_EDIT);
      expect(editorPermissions).toContain(Permissions.CLIENT_VIEW);
      expect(editorPermissions).toContain(Permissions.BULK_OPERATIONS);

      // Editor should NOT have delete or admin permissions
      expect(editorPermissions).not.toContain(Permissions.TICKET_DELETE);
      expect(editorPermissions).not.toContain(Permissions.PROJECT_DELETE);
      expect(editorPermissions).not.toContain(Permissions.CLIENT_DELETE);
      expect(editorPermissions).not.toContain(Permissions.ADMIN_USERS);
      expect(editorPermissions).not.toContain(Permissions.ADMIN_ROLES);
    });

    it('should have viewer role with view-only permissions', () => {
      const viewerPermissions = DefaultRolePermissions.viewer;

      // Viewer should only have view permissions
      expect(viewerPermissions).toContain(Permissions.TICKET_VIEW);
      expect(viewerPermissions).toContain(Permissions.PROJECT_VIEW);
      expect(viewerPermissions).toContain(Permissions.CLIENT_VIEW);

      // Viewer should NOT have create, edit, delete, assign permissions
      expect(viewerPermissions).not.toContain(Permissions.TICKET_CREATE);
      expect(viewerPermissions).not.toContain(Permissions.TICKET_EDIT);
      expect(viewerPermissions).not.toContain(Permissions.TICKET_DELETE);
      expect(viewerPermissions).not.toContain(Permissions.PROJECT_CREATE);
      expect(viewerPermissions).not.toContain(Permissions.CLIENT_CREATE);
      expect(viewerPermissions).not.toContain(Permissions.BULK_OPERATIONS);
    });

    it('should have client role with limited permissions', () => {
      const clientPermissions = DefaultRolePermissions.client;

      // Client should be able to create tickets and view
      expect(clientPermissions).toContain(Permissions.TICKET_CREATE);
      expect(clientPermissions).toContain(Permissions.TICKET_VIEW);
      expect(clientPermissions).toContain(Permissions.PROJECT_VIEW);

      // Client should NOT have edit, delete, assign, or admin permissions
      expect(clientPermissions).not.toContain(Permissions.TICKET_EDIT);
      expect(clientPermissions).not.toContain(Permissions.TICKET_DELETE);
      expect(clientPermissions).not.toContain(Permissions.PROJECT_CREATE);
      expect(clientPermissions).not.toContain(Permissions.CLIENT_CREATE);
      expect(clientPermissions).not.toContain(Permissions.BULK_OPERATIONS);
    });

    it('should have unique permissions per role (no duplicates)', () => {
      Object.entries(DefaultRolePermissions).forEach(([_role, permissions]) => {
        const uniquePermissions = new Set(permissions);
        expect(uniquePermissions.size).toBe(permissions.length);
      });
    });
  });
});

describe('Permission Error Handling', () => {
  describe('PermissionError class', () => {
    it('should create error with permission property', () => {
      const error = new PermissionError(Permissions.TICKET_CREATE);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PermissionError);
      expect(error.permission).toBe(Permissions.TICKET_CREATE);
      expect(error.message).toBe('Permission denied: ticket:create');
      expect(error.name).toBe('PermissionError');
    });

    it('should allow custom message', () => {
      const error = new PermissionError(Permissions.PROJECT_DELETE, 'Custom error message');

      expect(error.permission).toBe(Permissions.PROJECT_DELETE);
      expect(error.message).toBe('Custom error message');
    });
  });

  describe('isPermissionError function', () => {
    it('should return true for PermissionError instances', () => {
      const error = new PermissionError(Permissions.TICKET_EDIT);
      expect(isPermissionError(error)).toBe(true);
    });

    it('should return true for Error with "Permission denied:" message', () => {
      const error = new Error('Permission denied: ticket:create');
      expect(isPermissionError(error)).toBe(true);
    });

    it('should return false for regular Error without permission message', () => {
      const error = new Error('Something went wrong');
      expect(isPermissionError(error)).toBe(false);
    });

    it('should return false for non-Error values', () => {
      expect(isPermissionError(null)).toBe(false);
      expect(isPermissionError(undefined)).toBe(false);
      expect(isPermissionError('string')).toBe(false);
      expect(isPermissionError(123)).toBe(false);
      expect(isPermissionError({ message: 'Permission denied:' })).toBe(false);
    });

    it('should return true for nested permission denied messages', () => {
      const error = new Error('Permission denied: requires one of ticket:edit, ticket:assign');
      expect(isPermissionError(error)).toBe(true);
    });
  });
});

describe('Permission Type Safety', () => {
  it('should type Permission as union of all permission strings', () => {
    // TypeScript compile-time check - these should be valid
    const validPermissions: Permission[] = [
      'ticket:create',
      'ticket:edit',
      'ticket:delete',
      'ticket:assign',
      'ticket:view',
      'project:create',
      'project:edit',
      'project:delete',
      'project:assign',
      'project:view',
      'client:create',
      'client:edit',
      'client:delete',
      'client:view',
      'bulk:operations',
      'admin:users',
      'admin:roles',
    ];

    // Runtime check that all are in Permissions object
    validPermissions.forEach((p) => {
      expect(Object.values(Permissions)).toContain(p);
    });
  });
});
