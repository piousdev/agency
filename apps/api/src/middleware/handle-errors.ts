import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logError } from '../lib/sentry.js';

/**
 * Global error handler for the API
 *
 * Security considerations:
 * - HTTPException messages are considered safe to expose (developer-controlled)
 * - Unexpected errors (500) do NOT expose internal details to clients
 * - All errors are logged server-side for debugging
 * - Error tracking via Sentry for production monitoring
 */
export const errorHandler = (err: Error, c: Context) => {
  // Log all errors server-side for debugging
  console.error('Error:', err);

  // Log to Sentry for production monitoring
  logError(err, {
    endpoint: c.req.path,
    method: c.req.method,
    ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    userAgent: c.req.header('user-agent'),
  });

  // HTTPException - these are intentionally thrown with safe messages
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  // Unexpected errors - do NOT expose internal error messages
  // This prevents leaking sensitive information about the system
  return c.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
    },
    500
  );
};
