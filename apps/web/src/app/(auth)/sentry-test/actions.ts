'use server';

import * as Sentry from '@sentry/nextjs';

/**
 * Server Action: Success Case
 *
 * This action completes successfully and can be used to verify
 * that server actions work correctly without errors.
 */
export async function testServerAction() {
  console.log('✅ Server Action: Success case executed');

  // Capture a successful event as a message
  Sentry.captureMessage('Test Server Action: Success', {
    level: 'info',
    tags: {
      test_type: 'server_action_success',
    },
    extra: {
      description: 'This server action completed successfully',
    },
  });
}

/**
 * Server Action: Error Case
 *
 * This action intentionally throws an error to test
 * Sentry's server-side error tracking.
 */
export async function testServerActionWithError() {
  console.log('❌ Server Action: About to throw error');

  // Simulate some processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Throw an error that Sentry should capture
  throw new Error('Test Server Action Error: Intentionally thrown from server action');
}

/**
 * Server Action: Manual Error Capture
 *
 * This action demonstrates manual error capture with additional context
 */
export async function testServerActionManualCapture() {
  try {
    // Simulate an operation that might fail
    throw new Error('Test Server Action: Manually captured error');
  } catch (error) {
    // Manually capture with rich context
    Sentry.captureException(error, {
      tags: {
        test_type: 'server_action_manual',
        action: 'testServerActionManualCapture',
      },
      extra: {
        description: 'This error was manually captured in a server action',
        timestamp: new Date().toISOString(),
      },
      level: 'error',
    });

    // Return error info to client
    return {
      success: false,
      message: 'Error captured manually',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
