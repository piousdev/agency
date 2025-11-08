import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { randomBytes } from 'crypto';
import { db } from '../../db';
import { invitation, user } from '../../db/schema';
import { acceptInvitationSchema, type AcceptInvitationInput } from '../../schemas/invitation';

const app = new Hono();

/**
 * POST /api/invitations/accept
 *
 * Accept an invitation and create a new user account.
 *
 * **Security**: Public endpoint (token-based security)
 * - No authentication required (user doesn't have account yet)
 * - Token must be valid, unused, and not expired
 * - Email must match invitation email (prevents token reuse)
 *
 * **Request Body** (validated by acceptInvitationSchema):
 * ```typescript
 * {
 *   token: string;    // 64-character hex token from invitation
 *   email: string;    // Must match invitation email
 *   name: string;     // User's full name
 *   password: string; // Will be hashed by Better-Auth
 * }
 * ```
 *
 * **Validation Checks** (in order):
 * 1. Schema validation: All required fields present and valid
 * 2. Token existence: Must exist in database
 * 3. Usage status: Must not be already used (one-time use)
 * 4. Expiration: Must not be past expiration date
 * 5. Email match: Request email must match invitation email
 * 6. User existence: Email must not be already registered
 *
 * **Account Creation Process**:
 * 1. Generate unique user ID (user_...)
 * 2. Create user record in `user` table
 *    - emailVerified: false (Better-Auth will send verification email)
 *    - createdAt/updatedAt: Current timestamp
 * 3. Mark invitation as used
 *    - used: true
 *    - usedAt: Current timestamp
 * 4. Return success response with user ID
 *
 * **Better-Auth Integration**:
 * - This endpoint creates the user record
 * - User must then sign in via Better-Auth's /sign-in/email endpoint
 * - Better-Auth handles password hashing, session creation, email verification
 *
 * **Response** (201 Created):
 * ```typescript
 * {
 *   success: true;
 *   message: "Account created successfully";
 *   userId: string;  // Unique user ID (user_...)
 * }
 * ```
 *
 * **Error Responses**:
 * - 400 Bad Request: Validation failed (schema, used, expired, email mismatch)
 * - 404 Not Found: Invitation token not found
 * - 409 Conflict: User with email already exists
 * - 500 Internal Server Error: Database operation failed
 *
 * **Frontend Flow**:
 * 1. User submits signup form with token
 * 2. API validates token and creates account
 * 3. Frontend redirects to login page
 * 4. User signs in with created credentials
 * 5. Better-Auth sends email verification
 * 6. User verifies email and accesses platform
 *
 * **Future Enhancements**:
 * - TODO: Integrate with Better-Auth's signup flow for password hashing
 * - TODO: Link user to client via user_to_client table (if clientId exists)
 * - TODO: Send welcome email after account creation
 * - TODO: Auto-assign default role based on invitation type
 *
 * @middleware zValidator() - Validates request body against Zod schema
 */
app.post('/accept', zValidator('json', acceptInvitationSchema), async (c) => {
  const body: AcceptInvitationInput = c.req.valid('json');

  try {
    // Validate invitation
    const invitationRecord = await db.query.invitation.findFirst({
      where: eq(invitation.token, body.token),
      with: {
        client: true,
      },
    });

    if (!invitationRecord) {
      throw new HTTPException(404, {
        message: 'Invitation not found',
      });
    }

    // Check if already used
    if (invitationRecord.used) {
      throw new HTTPException(400, {
        message: 'This invitation has already been used',
      });
    }

    // Check if expired
    if (new Date() > new Date(invitationRecord.expiresAt)) {
      throw new HTTPException(400, {
        message: 'This invitation has expired',
      });
    }

    // Check if email matches
    if (invitationRecord.email !== body.email) {
      throw new HTTPException(400, {
        message: 'Email does not match the invitation',
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

    // Generate user ID
    const userId = `user_${randomBytes(16).toString('hex')}`;

    // Create user account using BetterAuth schema
    await db.insert(user).values({
      id: userId,
      name: body.name,
      email: body.email,
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create password account
    // Note: BetterAuth will handle password hashing through its own signup flow
    // For now, we'll let BetterAuth create the account entry
    // This is a simplified version - in production, integrate with BetterAuth's signup

    // Mark invitation as used
    await db
      .update(invitation)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(eq(invitation.id, invitationRecord.id));

    // TODO: If clientId exists, link user to client via user_to_client table

    return c.json(
      {
        success: true,
        message: 'Account created successfully',
        userId,
      },
      201
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error accepting invitation:', error);
    throw new HTTPException(500, {
      message: 'Failed to accept invitation',
    });
  }
});

export default app;
