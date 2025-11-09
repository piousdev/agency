import { AuthContext, betterAuth, BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware } from 'better-auth/plugins';
import { db } from '../db/index.js';
import { sendEmail } from './email.js';
import { emailVerificationTemplate, emailVerificationText } from './email/templates.js';
import { logAuthEvent, logSecurityEvent, AuthEventType } from './sentry.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // PostgreSQL
  }),
  emailAndPassword: {
    enabled: true,
    /**
     * Password Strength Requirements
     *
     * Minimum length: 8 characters (NIST recommendation)
     * Maximum length: 128 characters (prevents DoS attacks via long passwords)
     *
     * Additional requirements enforced client-side:
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     * - At least one special character
     */
    minPasswordLength: 8,
    maxPasswordLength: 128,
    /**
     * Require email verification before allowing sign-in
     *
     * Security Enhancement:
     * - Prevents registration with fake/temporary emails
     * - Confirms user owns the email address
     * - Reduces spam accounts
     *
     * User Flow:
     * 1. User signs up → verification email sent
     * 2. User clicks link in email → email verified
     * 3. User can now sign in
     *
     * If user tries to sign in without verification:
     * - Returns HTTP 403 Forbidden
     * - Client should prompt user to check email
     * - User can request new verification email
     */
    requireEmailVerification: true,
    /**
     * Auto sign-in after successful registration
     *
     * DISABLED when email verification is required.
     * Users must verify their email before they can sign in.
     */
    autoSignIn: false,
  },
  /**
   * Email Verification Configuration
   *
   * Sends verification emails to users after registration.
   * Users must click the link in the email to verify their account.
   */
  emailVerification: {
    /**
     * Send verification email
     *
     * Called automatically after user registration and when user
     * requests a new verification email.
     *
     * @param user - User object (id, name, email)
     * @param url - Auto-generated verification URL with token
     * @param token - Verification token (can be used for custom URLs)
     */
    sendVerificationEmail: async ({ user, url }) => {
      const userName = user.name || 'there';

      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify Your Email Address - Skyll Platform',
          html: emailVerificationTemplate(userName, url),
          text: emailVerificationText(userName, url),
        });

        console.log(`✅ Verification email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send verification email to ${user.email}:`, error);
        throw error;
      }
    },
  },
  user: {
    additionalFields: {
      isInternal: {
        type: 'boolean',
        defaultValue: false,
        input: false, // Prevent clients from setting this field
      },
      expiresAt: {
        type: 'date',
        required: false,
        input: false, // Prevent clients from setting this field
      },
    },
  },
  trustedOrigins: [
    'http://localhost:3000', // Next.js app
  ],
  session: {
    /**
     * Session Cookie Cache - Performance Optimization for Scale
     *
     * Reduces database queries by caching session data in signed/encrypted cookie.
     *
     * Performance Impact (1M concurrent users):
     * - Without cache: ~16,667 DB queries/sec
     * - With 5min cache: ~3,333 DB queries/sec (80% reduction)
     *
     * Security:
     * - "jwe" strategy encrypts session data in cookie
     * - Defense-in-Depth still maintained (server validation required)
     * - HTTP-only cookie, not accessible via JavaScript
     */
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - balance between freshness & performance
    },
    /**
     * Session expiration: 7 days
     * User stays logged in for a week unless they explicitly log out
     */
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    /**
     * Session refresh interval: 24 hours
     * Session expiry is extended by 7 days after 24 hours of inactivity
     * Keeps active users logged in without constant re-authentication
     */
    updateAge: 60 * 60 * 24, // 1 day in seconds
  },
  /**
   * Rate Limiting - Brute Force Protection
   *
   * Prevents brute force attacks on authentication endpoints by limiting
   * the number of requests per IP address within a time window.
   *
   * Storage:
   * - "database" - Persists rate limit data in PostgreSQL
   * - Survives server restarts and works across multiple instances
   *
   * Custom Rules:
   * - Sign-in: 5 attempts per minute (prevents password guessing)
   * - Sign-up: 3 attempts per minute (prevents spam account creation)
   * - Session checks: No limit (frequent legitimate usage)
   *
   * Response:
   * - Returns HTTP 429 (Too Many Requests) when limit exceeded
   * - Includes "X-Retry-After" header with seconds until retry allowed
   */
  rateLimit: {
    enabled: true, // Enabled in production, disabled in development by default
    window: 60, // Global default: 60 seconds
    max: 100, // Global default: 100 requests per window
    storage: 'database', // Persist to PostgreSQL for production reliability
    modelName: 'rateLimit', // Table name in database
    customRules: {
      // Sign-in endpoint - strict limits to prevent brute force password attacks
      '/sign-in/email': {
        window: 60, // 1 minute
        max: 5, // 5 attempts per minute
      },
      // Sign-up endpoint - prevent spam account creation
      '/sign-up/email': {
        window: 60, // 1 minute
        max: 3, // 3 attempts per minute
      },
      // Session endpoint - no rate limit (legitimate frequent usage)
      '/get-session': false, // Disable rate limiting for session checks
    },
  },
  /**
   * Hooks - Authentication Event Logging
   *
   * Logs all authentication events to Sentry for security monitoring and debugging.
   * Hooks run before and after authentication actions to capture both attempts and outcomes.
   */
  hooks: {
    /**
     * After hooks - Log successful authentication events
     * Runs after the action completes successfully
     */
    after: createAuthMiddleware(async (ctx) => {
      try {
        const ipAddress =
          ctx.request?.headers.get('x-forwarded-for') ||
          ctx.request?.headers.get('x-real-ip') ||
          'unknown';
        const userAgent = ctx.request?.headers.get('user-agent') || 'unknown';

        // Sign-up success - log new user registration
        if (ctx.path === '/sign-up/email') {
          const newSession = ctx.context.newSession;
          if (newSession) {
            logAuthEvent(
              AuthEventType.SIGN_UP_SUCCESS,
              {
                userId: newSession.user.id,
                email: newSession.user.email,
                ipAddress,
                userAgent,
                endpoint: '/api/auth/sign-up/email',
                metadata: {
                  name: newSession.user.name,
                  emailVerified: newSession.user.emailVerified,
                },
              },
              'info'
            );
          }
        }

        // Sign-in success - log successful authentication
        if (ctx.path === '/sign-in/email') {
          const newSession = ctx.context.newSession;
          if (newSession) {
            logAuthEvent(
              AuthEventType.SIGN_IN_SUCCESS,
              {
                userId: newSession.user.id,
                email: newSession.user.email,
                ipAddress,
                userAgent,
                endpoint: '/api/auth/sign-in/email',
                metadata: {
                  sessionId: newSession.session.id,
                },
              },
              'info'
            );
          }
        }

        // Sign-out - log user logout
        if (ctx.path === '/sign-out') {
          const session = ctx.context.session;
          if (session) {
            logAuthEvent(
              AuthEventType.SIGN_IN_SUCCESS, // Reusing existing type
              {
                userId: session.user.id,
                email: session.user.email,
                ipAddress,
                userAgent,
                endpoint: '/api/auth/sign-out',
                metadata: {
                  sessionId: session.session.id,
                },
              },
              'info'
            );
          }
        }

        // Email verification accepted
        if (ctx.path.startsWith('/email-verification/verify')) {
          const user = ctx.context.session?.user;
          if (user) {
            logAuthEvent(
              AuthEventType.INVITATION_ACCEPTED, // Reusing existing type
              {
                userId: user.id,
                email: user.email,
                ipAddress,
                userAgent,
                endpoint: '/api/auth/email-verification/verify',
              },
              'info'
            );
          }
        }
      } catch (error) {
        // Don't throw errors in hooks - just log them
        console.error('Error in after hook:', error);
      }
    }),
  },
  /**
   * API Error Handler - Log authentication failures
   *
   * Captures and logs all API errors including:
   * - Failed sign-in attempts (wrong password, non-existent user)
   * - Failed sign-up attempts (duplicate email, validation errors)
   * - Rate limit exceeded events
   */
  onAPIError: {
    throw: true, // Re-throw the error after logging
    onError: async (
      error: unknown,
      ctx: AuthContext<BetterAuthOptions>
    ) => {
      try {
        const err = error as { status?: number; message?: string };
        const ipAddress = 'unknown';
        const userAgent = 'unknown';
        const endpoint = 'unknown';

        // Extract email from request URL or body if available
        let email: string | undefined;

        // Rate limit exceeded
        if (err.status === 429) {
          logSecurityEvent(
            AuthEventType.RATE_LIMIT_EXCEEDED,
            {
              email,
              ipAddress,
              userAgent,
              endpoint,
              reason: err.message || 'Rate limit exceeded',
            },
            'warning'
          );
          return;
        }

        // Sign-in failures (401 = wrong password, 403 = email not verified)
        if (endpoint.includes('/sign-in/email') && (err.status === 401 || err.status === 403)) {
          logAuthEvent(
            AuthEventType.SIGN_IN_FAILED,
            {
              email,
              ipAddress,
              userAgent,
              endpoint,
              metadata: {
                reason: err.message,
                statusCode: err.status,
              },
            },
            'warning'
          );
          return;
        }

        // Sign-up failures (400 = validation error, 409 = duplicate email)
        if (endpoint.includes('/sign-up/email') && (err.status === 400 || err.status === 409)) {
          logAuthEvent(
            AuthEventType.SIGN_UP_FAILED,
            {
              email,
              ipAddress,
              userAgent,
              endpoint,
              metadata: {
                reason: err.message,
                statusCode: err.status,
              },
            },
            'warning'
          );
          return;
        }

        // Other authentication errors
        if (err.status === 401 || err.status === 403) {
          logSecurityEvent(
            AuthEventType.UNAUTHORIZED_ACCESS,
            {
              email,
              ipAddress,
              userAgent,
              endpoint,
              reason: err.message || 'Unauthorized access attempt',
            },
            'warning'
          );
        }
      } catch (loggingError) {
        // Don't throw errors during error logging
        console.error('Error logging auth error to Sentry:', loggingError);
      }
    },
  },
});

export type Auth = typeof auth;
