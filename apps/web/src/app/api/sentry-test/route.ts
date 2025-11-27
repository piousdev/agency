import { type NextRequest, NextResponse } from 'next/server';

import * as Sentry from '@sentry/nextjs';

/**
 * GET /api/sentry-test
 *
 * Test API route for Sentry integration
 *
 * Query params:
 * - error=true : Trigger an error
 * - message=true : Send a message to Sentry
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shouldError = searchParams.get('error') === 'true';
  const shouldMessage = searchParams.get('message') === 'true';

  // Test case: Throw an error
  if (shouldError) {
    console.log('❌ API Route: About to throw error');
    throw new Error('Test API Route Error: Intentionally thrown from API route');
  }

  // Test case: Send a message
  if (shouldMessage) {
    Sentry.captureMessage('Test API Route: Custom message', {
      level: 'info',
      tags: {
        test_type: 'api_route_message',
        route: '/api/sentry-test',
      },
      extra: {
        description: 'This is a test message from an API route',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Success response
  return NextResponse.json({
    success: true,
    message: 'API route test successful',
    timestamp: new Date().toISOString(),
    sentry: {
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      dsn_configured: !!process.env.SENTRY_DSN,
    },
  });
}

/**
 * POST /api/sentry-test
 *
 * Test POST request with optional error
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { triggerError?: boolean };

    if (body.triggerError) {
      throw new Error('Test API Route Error: Triggered via POST request');
    }

    // Capture a successful POST event
    Sentry.captureMessage('Test API Route: POST request received', {
      level: 'info',
      tags: {
        test_type: 'api_route_post',
      },
      extra: {
        body,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'POST request processed successfully',
      received: body,
    });
  } catch (error: unknown) {
    // Capture the error with Sentry
    Sentry.captureException(error, {
      tags: {
        test_type: 'api_route_post_error',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
