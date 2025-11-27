import { randomBytes } from 'crypto';

import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { invitation, user } from '../../db/schema';
import { logAuthEvent, logError, AuthEventType } from '../../lib/sentry';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { createInvitationSchema, type CreateInvitationInput } from '../../schemas/invitation';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST /api/invitations/create
 *
 * Create a new invitation and send it to the specified email address.
 *
 * **Security**: Protected by requireAuth() + requireInternal() middleware
 * - Only authenticated internal team members can create invitations
 * - Defense-in-Depth: Auth verified in middleware AND endpoint logic
 *
 * **Request Body** (validated by createInvitationSchema):
 * ```typescript
 * {
 *   email: string;      // Valid email address
 *   clientId?: string;  // Optional: Link invitation to existing client
 * }
 * ```
 *
 * **Validation**:
 * - Email must be valid format
 * - Cannot invite existing users (409 Conflict)
 * - Cannot create duplicate active invitations (409 Conflict)
 *
 * **Token Generation**:
 * - 32-byte cryptographically secure random token (crypto.randomBytes)
 * - URL-safe hex encoding (64 characters)
 * - Stored in database for validation
 *
 * **Expiration**:
 * - Default: 7 days from creation
 * - After expiration, token validation fails
 * - Expired invitations can be replaced with new ones
 *
 * **Response** (201 Created):
 * ```typescript
 * {
 *   success: true;
 *   message: "Invitation created successfully";
 *   invitation: {
 *     id: string;       // Unique invitation ID (inv_...)
 *     email: string;    // Recipient email
 *     expiresAt: Date;  // Expiration timestamp
 *     token: string;    // DEV ONLY - Remove in production
 *   };
 * }
 * ```
 *
 * **Logging**:
 * - Success: Logs to Sentry with INVITATION_CREATED event
 * - Failure: Logs full error context for debugging
 *
 * **Future Enhancements**:
 * - TODO: Send invitation email via Resend
 * - TODO: Add configurable expiration periods
 * - TODO: Support for custom invitation messages
 *
 * @middleware requireAuth() - Validates Better-Auth session
 * @middleware requireInternal() - Ensures user.isInternal === true
 * @middleware zValidator() - Validates request body against Zod schema
 */
app.post(
  '/create',
  requireAuth(),
  requireInternal(),
  zValidator('json', createInvitationSchema),
  async (c) => {
    // Extract validated request body and authenticated user from middleware
    const body: CreateInvitationInput = c.req.valid('json');
    const authenticatedUser = c.get('user');

    if (!authenticatedUser) {
      throw new HTTPException(401, {
        message: 'Authenticated User not found in context',
      });
    }

    const createdById = authenticatedUser.id;

    try {
      // Check if invitation already exists for this email
      const existingInvitation = await db.query.invitation.findFirst({
        where: and(eq(invitation.email, body.email), eq(invitation.used, false)),
      });

      if (existingInvitation) {
        throw new HTTPException(409, {
          message: 'An active invitation already exists for this email',
        });
      }

      // Check if user already exists
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, body.email),
      });

      if (existingUser) {
        throw new HTTPException(409, {
          message: 'A user with this email already exists',
        });
      }

      // Generate secure token (32 bytes = 64 hex characters)
      const token = randomBytes(32).toString('hex');

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Generate unique ID
      const invitationId = `inv_${randomBytes(16).toString('hex')}`;

      // Create invitation record
      const [newInvitation] = await db
        .insert(invitation)
        .values({
          id: invitationId,
          email: body.email,
          role: 'client', // All invited users are clients
          token,
          expiresAt,
          used: false,
          clientId: body.clientId ?? null,
          createdById,
        })
        .returning();

      if (!newInvitation) {
        throw new HTTPException(500, {
          message: 'Failed to create invitation',
        });
      }

      // TODO: Send invitation email via Resend
      // For now, we'll just return the token in the response (DEV ONLY)
      console.log('🔗 Invitation link:', `http://localhost:3000/accept-invite/${token}`);

      // Log successful invitation creation to Sentry
      logAuthEvent(AuthEventType.INVITATION_CREATED, {
        userId: createdById,
        email: body.email,
        ipAddress: c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? undefined,
        userAgent: c.req.header('user-agent') ?? undefined,
        endpoint: '/api/invitations/create',
        metadata: {
          invitationId: newInvitation.id,
          expiresAt: newInvitation.expiresAt.toISOString(),
          clientId: body.clientId,
        },
      });

      return c.json(
        {
          success: true,
          message: 'Invitation created successfully',
          invitation: {
            id: newInvitation.id,
            email: newInvitation.email,
            expiresAt: newInvitation.expiresAt,
            token: token, // DEV ONLY - Remove in production
          },
        },
        201
      );
    } catch (error) {
      // Log invitation failure to Sentry
      logError(error as Error, {
        userId: createdById,
        email: body.email,
        ipAddress: c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? undefined,
        userAgent: c.req.header('user-agent') ?? undefined,
        endpoint: '/api/invitations/create',
      });

      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error creating invitation:', error);
      throw new HTTPException(500, {
        message: 'Failed to create invitation',
      });
    }
  }
);

export default app;
