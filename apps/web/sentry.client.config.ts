import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client Configuration (Browser Runtime)
 *
 * Captures errors and performance data from:
 * - Client Components
 * - Browser JavaScript
 * - User interactions
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',

  /**
   * Performance Monitoring
   *
   * Adjust this value in production, or use tracesSampler for fine-grained control
   */
  tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),

  /**
   * Session Replay
   *
   * This sets the sample rate at 10%. You may want to change it to 100% while in
   * development and then sample at a lower rate in production.
   */
  replaysSessionSampleRate: 0.1,

  /**
   * If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
   */
  replaysOnErrorSampleRate: 1.0,

  /**
   * Integrations
   */
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,
      // Block all media elements for privacy
      blockAllMedia: true,
    }),
  ],

  /**
   * Before Send Hook
   *
   * Filter and modify events before sending
   */
  beforeSend(event, _hint) {
    // Don't send events in development unless explicitly enabled
    if (
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development' &&
      process.env.NEXT_PUBLIC_SENTRY_SEND_IN_DEV !== 'true'
    ) {
      console.log('🔍 [Sentry Dev Mode - Client] Event would be sent:', event);
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
    // Hydration errors (Next.js specific, usually not critical)
    'Hydration failed',
    'There was an error while hydrating',
  ],
});
