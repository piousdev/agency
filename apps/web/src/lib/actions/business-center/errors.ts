/**
 * Error handling utilities for Business Center Server Actions
 */

import { isPermissionError } from '@/lib/auth/permissions';

export class ActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ActionError';
  }
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Formats permission errors into user-friendly messages
 */
function formatPermissionError(error: Error): string {
  // Extract the permission from error message like "Permission denied: ticket:create"
  const match = error.message.match(/Permission denied: (.+)/);
  if (match && match[1]) {
    const permission = match[1];
    const permissionLabels: Record<string, string> = {
      'ticket:create': 'create tickets',
      'ticket:edit': 'edit tickets',
      'ticket:delete': 'delete tickets',
      'ticket:assign': 'assign tickets',
      'project:create': 'create projects',
      'project:edit': 'edit projects',
      'project:delete': 'delete projects',
      'project:assign': 'manage project team',
      'client:create': 'create clients',
      'client:edit': 'edit clients',
      'client:delete': 'delete clients',
      'bulk:operations': 'perform bulk operations',
    };
    const label = permissionLabels[permission] ?? permission;
    return `You don't have permission to ${label}. Please contact an administrator if you need access.`;
  }
  return 'You do not have permission to perform this action.';
}

/**
 * Wraps a Server Action with error handling
 */
export async function withErrorHandling<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error('Action error:', error);

    // Handle permission errors specially
    if (isPermissionError(error)) {
      return {
        success: false,
        error: formatPermissionError(error as Error),
        code: 'PERMISSION_DENIED',
      };
    }

    if (error instanceof ActionError) {
      return { success: false, error: error.message, code: error.code };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Formats API errors for user display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Business Center specific error class
 */
export class BusinessCenterError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'BusinessCenterError';
  }
}

/**
 * Standard ActionResponse type for server actions
 */
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Handle API errors and return a standardized error response
 */
export function handleApiError(error: unknown, context: string): ActionResponse<never> {
  console.error(`${context} error:`, error);

  if (isPermissionError(error)) {
    return {
      success: false,
      error: 'You do not have permission to perform this action.',
      code: 'PERMISSION_DENIED',
    };
  }

  if (error instanceof BusinessCenterError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
  };
}
