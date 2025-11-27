/**
 * Server Action Error Handling Tests
 * Tests for error utilities used in Business Center Server Actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ActionError, withErrorHandling, formatApiError, type ActionResult } from '../errors';

// Mock the permissions module
vi.mock('@/lib/auth/permissions', () => ({
  isPermissionError: vi.fn((error: unknown) => {
    return error instanceof Error && error.message.startsWith('Permission denied:');
  }),
}));

describe('ActionError', () => {
  it('should create error with message', () => {
    const error = new ActionError('Something went wrong');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ActionError);
    expect(error.message).toBe('Something went wrong');
    expect(error.name).toBe('ActionError');
  });

  it('should create error with code', () => {
    const error = new ActionError('Not found', 'NOT_FOUND');

    expect(error.message).toBe('Not found');
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create error with status code', () => {
    const error = new ActionError('Not found', 'NOT_FOUND', 404);

    expect(error.message).toBe('Not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });
});

describe('withErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success result on successful action', async () => {
    const mockData = { id: '123', name: 'Test' };
    const action = vi.fn().mockResolvedValue(mockData);

    const result = await withErrorHandling(action);

    expect(result.success).toBe(true);
    expect((result as { success: true; data: typeof mockData }).data).toEqual(mockData);
    expect(action).toHaveBeenCalledOnce();
  });

  it('should return success result for void actions', async () => {
    const action = vi.fn().mockResolvedValue(undefined);

    const result = await withErrorHandling(action);

    expect(result.success).toBe(true);
    expect((result as { success: true; data: undefined }).data).toBeUndefined();
  });

  it('should handle permission errors with formatted message', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Permission denied: ticket:create'));

    const result = await withErrorHandling(action);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.error).toContain("You don't have permission to");
      expect(result.error).toContain('create tickets');
    }
  });

  it('should handle permission errors for various permissions', async () => {
    const testCases = [
      { permission: 'ticket:edit', label: 'edit tickets' },
      { permission: 'ticket:delete', label: 'delete tickets' },
      { permission: 'ticket:assign', label: 'assign tickets' },
      { permission: 'project:create', label: 'create projects' },
      { permission: 'project:edit', label: 'edit projects' },
      { permission: 'project:delete', label: 'delete projects' },
      { permission: 'project:assign', label: 'manage project team' },
      { permission: 'client:create', label: 'create clients' },
      { permission: 'client:edit', label: 'edit clients' },
      { permission: 'client:delete', label: 'delete clients' },
      { permission: 'bulk:operations', label: 'perform bulk operations' },
    ];

    for (const { permission, label } of testCases) {
      const action = vi.fn().mockRejectedValue(new Error(`Permission denied: ${permission}`));
      const result = await withErrorHandling(action);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain(label);
      }
    }
  });

  it('should handle unknown permission with raw permission string', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Permission denied: unknown:permission'));

    const result = await withErrorHandling(action);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.error).toContain('unknown:permission');
    }
  });

  it('should handle ActionError with code', async () => {
    const action = vi.fn().mockRejectedValue(new ActionError('Custom error', 'CUSTOM_CODE'));

    const result = await withErrorHandling(action);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Custom error');
      expect(result.code).toBe('CUSTOM_CODE');
    }
  });

  it('should handle regular Error', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Something went wrong'));

    const result = await withErrorHandling(action);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Something went wrong');
      expect(result.code).toBeUndefined();
    }
  });

  it('should handle non-Error thrown values', async () => {
    const action = vi.fn().mockRejectedValue('string error');

    const result = await withErrorHandling(action);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('An unexpected error occurred');
    }
  });

  it('should handle null thrown value', async () => {
    const action = vi.fn().mockRejectedValue(null);

    const result = await withErrorHandling(action);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('An unexpected error occurred');
    }
  });
});

describe('formatApiError', () => {
  it('should extract message from Error', () => {
    const error = new Error('API error message');
    expect(formatApiError(error)).toBe('API error message');
  });

  it('should return string directly', () => {
    expect(formatApiError('String error')).toBe('String error');
  });

  it('should return default message for unknown types', () => {
    expect(formatApiError(null)).toBe('An unexpected error occurred. Please try again.');
    expect(formatApiError(undefined)).toBe('An unexpected error occurred. Please try again.');
    expect(formatApiError(123)).toBe('An unexpected error occurred. Please try again.');
    expect(formatApiError({ custom: 'object' })).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});

describe('ActionResult type', () => {
  it('should support success result with data', () => {
    const result: ActionResult<{ id: string }> = {
      success: true,
      data: { id: '123' },
    };

    expect(result.success).toBe(true);
    expect((result as { success: true; data: { id: string } }).data.id).toBe('123');
  });

  it('should support failure result with error', () => {
    const result: ActionResult = {
      success: false,
      error: 'Something went wrong',
    };

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe('Something went wrong');
  });

  it('should support failure result with code', () => {
    const result: ActionResult = {
      success: false,
      error: 'Permission denied',
      code: 'PERMISSION_DENIED',
    };

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string; code?: string }).error).toBe(
      'Permission denied'
    );
    expect((result as { success: false; error: string; code?: string }).code).toBe(
      'PERMISSION_DENIED'
    );
  });

  it('should support void ActionResult', () => {
    const result: ActionResult = {
      success: true,
      data: undefined,
    };

    expect(result.success).toBe(true);
  });
});
