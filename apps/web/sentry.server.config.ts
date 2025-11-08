import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Server Configuration (Node.js Runtime)
 *
 * Captures errors and performance data from:
 * - Server Components
 * - API Routes
 * - Server Actions
 * - getServerSideProps
 * - getStaticProps
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  /**
   * Performance Monitoring
   *
   * Adjust this value in production, or use tracesSampler for fine-grained control
   */
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

  /**
   * Session Replay (optional)
   *
   * Capture session replays for error analysis
   * - Only works on client-side, but configured here for consistency
   */
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  /**
   * Before Send Hook
   *
   * Filter and modify events before sending
   */
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (
      process.env.SENTRY_ENVIRONMENT === 'development' &&
      process.env.SENTRY_SEND_IN_DEV !== 'true'
    ) {
      console.log('🔍 [Sentry Dev Mode - Server] Event would be sent:', event);
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
   *
   * These errors are too noisy and not actionable
   */
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Network errors that we can't control
    'Network request failed',
    'NetworkError',
    // AbortError when user cancels requests
    'AbortError',
  ],
});
