import * as Sentry from '@sentry/node';

/**
 * Sentry Configuration for API
 *
 * Provides error tracking, performance monitoring, and logging for authentication
 * and security events.
 *
 * Environment Variables Required:
 * - SENTRY_DSN: Data Source Name (project-specific URL from Sentry dashboard)
 * - SENTRY_ENVIRONMENT: Environment name (development, staging, production)
 * - SENTRY_TRACES_SAMPLE_RATE: Performance monitoring sample rate (0.0 to 1.0)
 * - SENTRY_ENABLE_TRACING: Enable/disable performance tracing (true/false)
 *
 * Features:
 * - Error tracking for all unhandled exceptions
 * - Performance monitoring for HTTP requests
 * - Custom event logging for authentication events
 * - Security event tracking (rate limits, failed auth, etc.)
 */

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';
const SENTRY_TRACES_SAMPLE_RATE = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1');
const SENTRY_ENABLE_TRACING = process.env.SENTRY_ENABLE_TRACING === 'true' || false;

/**
 * Initialize Sentry SDK
 *
 * Only initializes if SENTRY_DSN is provided.
 * Safe to call multiple times (Sentry handles re-initialization).
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log(
      '⚠️  Sentry DSN not configured. Error tracking disabled. Set SENTRY_DSN environment variable to enable.'
    );
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    /**
     * Performance Monitoring
     *
     * Traces sample rate: Percentage of transactions to send to Sentry
     * - 1.0 = 100% (recommended for development/staging)
     * - 0.1 = 10% (recommended for production to reduce costs)
     * - 0.0 = disabled
     */
    ...(SENTRY_ENABLE_TRACING && {
      tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
    }),

    /**
     * Integrations
     *
     * Automatically captures:
     * - HTTP requests and responses
     * - Node.js runtime errors
     * - Unhandled promise rejections
     *
     * Note: In Sentry v8, integrations are auto-enabled by default.
     * The httpIntegration is automatically included when tracing is enabled.
     */
    integrations: SENTRY_ENABLE_TRACING ? [Sentry.httpIntegration()] : [],

    /**
     * Before Send Hook
     *
     * Filters and modifies events before sending to Sentry.
     * Useful for:
     * - Removing sensitive data
     * - Filtering out noise (e.g., known errors)
     * - Adding custom context
     */
    beforeSend(event, _hint) {
      // Don't send events in development unless explicitly enabled
      if (SENTRY_ENVIRONMENT === 'development' && process.env.SENTRY_SEND_IN_DEV !== 'true') {
        console.log('🔍 [Sentry Dev Mode] Event would be sent:', event);
        return null; // Don't send to Sentry
      }

      // Filter out 404 errors (too noisy, not actionable)
      if (event.exception) {
        const exceptionValue = event.exception.values?.[0]?.value;
        if (exceptionValue?.includes('404') || exceptionValue?.includes('Not Found')) {
          return null;
        }
      }

      return event;
    },
  });

  console.log(
    `✅ Sentry initialized (environment: ${SENTRY_ENVIRONMENT}, tracing: ${SENTRY_ENABLE_TRACING})`
  );
}

/**
 * Auth Event Types
 *
 * Standardized event types for authentication logging
 */
export const AuthEventType = {
  SIGN_UP_SUCCESS: 'auth.signup.success',
  SIGN_UP_FAILED: 'auth.signup.failed',
  SIGN_IN_SUCCESS: 'auth.signin.success',
  SIGN_IN_FAILED: 'auth.signin.failed',
  SIGN_OUT: 'auth.signout',
  EMAIL_VERIFICATION_SENT: 'auth.email_verification.sent',
  EMAIL_VERIFICATION_SUCCESS: 'auth.email_verification.success',
  EMAIL_VERIFICATION_FAILED: 'auth.email_verification.failed',
  PASSWORD_RESET_REQUESTED: 'auth.password_reset.requested',
  PASSWORD_RESET_SUCCESS: 'auth.password_reset.success',
  PASSWORD_RESET_FAILED: 'auth.password_reset.failed',
  INVITATION_CREATED: 'auth.invitation.created',
  INVITATION_ACCEPTED: 'auth.invitation.accepted',
  INVITATION_FAILED: 'auth.invitation.failed',
  RATE_LIMIT_EXCEEDED: 'security.rate_limit.exceeded',
  UNAUTHORIZED_ACCESS: 'security.unauthorized.access',
  PERMISSION_DENIED: 'security.permission.denied',
} as const;

export type AuthEventType = (typeof AuthEventType)[keyof typeof AuthEventType];

/**
 * Auth Event Context
 *
 * Common context data for authentication events
 */
export interface AuthEventContext {
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log Authentication Event
 *
 * Records important authentication and security events to Sentry.
 *
 * @param eventType - Type of authentication event (use AuthEventType constants)
 * @param context - Event context (user, IP, etc.)
 * @param level - Sentry severity level (default: 'info')
 *
 * @example
 * ```ts
 * logAuthEvent(AuthEventType.SIGN_IN_SUCCESS, {
 *   userId: '123',
 *   email: 'user@example.com',
 *   ipAddress: request.ip,
 * });
 * ```
 */
export function logAuthEvent(
  eventType: AuthEventType,
  context: AuthEventContext,
  level: Sentry.SeverityLevel = 'info'
): void {
  // Set user context if available
  if (context.userId || context.email) {
    Sentry.setUser({
      id: context.userId,
      email: context.email,
      ip_address: context.ipAddress,
    });
  }

  // Add breadcrumb for event tracking
  Sentry.addBreadcrumb({
    category: 'auth',
    message: eventType,
    level,
    data: {
      ...context,
    },
  });

  // Capture message with full context
  Sentry.captureMessage(eventType, {
    level,
    tags: {
      event_type: eventType,
      endpoint: context.endpoint,
    },
    contexts: {
      auth: {
        user_id: context.userId,
        email: context.email,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
      },
    },
    extra: {
      ...context.metadata,
      reason: context.reason,
    },
  });
}

/**
 * Log Security Event
 *
 * Records security-related events with 'warning' or 'error' severity.
 *
 * @param eventType - Security event type (use AuthEventType security constants)
 * @param context - Event context
 * @param level - Severity level (default: 'warning')
 *
 * @example
 * ```ts
 * logSecurityEvent(AuthEventType.RATE_LIMIT_EXCEEDED, {
 *   ipAddress: request.ip,
 *   endpoint: '/api/auth/sign-in',
 *   metadata: { attempts: 5, window: '60s' }
 * });
 * ```
 */
export function logSecurityEvent(
  eventType: AuthEventType,
  context: AuthEventContext,
  level: Sentry.SeverityLevel = 'warning'
): void {
  logAuthEvent(eventType, context, level);
}

/**
 * Log Error with Context
 *
 * Captures errors with additional authentication context.
 *
 * @param error - Error object or message
 * @param context - Additional context
 *
 * @example
 * ```ts
 * try {
 *   await signIn(credentials);
 * } catch (error) {
 *   logError(error, {
 *     userId: '123',
 *     endpoint: '/api/auth/sign-in',
 *   });
 * }
 * ```
 */
export function logError(error: Error | string, context?: AuthEventContext): void {
  if (context?.userId || context?.email) {
    Sentry.setUser({
      id: context.userId,
      email: context.email,
      ip_address: context.ipAddress,
    });
  }

  if (context) {
    Sentry.setContext('auth', {
      user_id: context.userId,
      email: context.email,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      endpoint: context.endpoint,
    });
  }

  if (typeof error === 'string') {
    Sentry.captureMessage(error, 'error');
  } else {
    Sentry.captureException(error);
  }
}
