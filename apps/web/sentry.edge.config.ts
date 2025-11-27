import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Configuration (Edge Runtime)
 *
 * Captures errors and performance data from:
 * - Edge API Routes
 * - Middleware (proxy.ts)
 * - Edge Server Components
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? 'development',

  /**
   * Performance Monitoring
   *
   * Adjust this value in production, or use tracesSampler for fine-grained control
   */
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),

  /**
   * Before Send Hook
   *
   * Filter and modify events before sending
   */
  beforeSend(event, _hint) {
    // Don't send events in development unless explicitly enabled
    if (
      process.env.SENTRY_ENVIRONMENT === 'development' &&
      process.env.SENTRY_SEND_IN_DEV !== 'true'
    ) {
      console.log('🔍 [Sentry Dev Mode - Edge] Event would be sent:', event);
      return null;
    }

    return event;
  },

  /**
   * Debug Mode
   *
   * Enable debug logging in development
   */
  debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true',

  /**
   * Ignore Specific Errors
   */
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'NetworkError',
    'AbortError',
  ],
});
