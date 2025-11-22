/**
 * Error handling utilities for Business Center Server Actions
 */

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

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

/**
 * Wraps a Server Action with error handling
 */
export async function withErrorHandling<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error('Action error:', error);

    if (error instanceof ActionError) {
      return { success: false, error: error.message };
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
