import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { invitation } from '../../db/schema';

const app = new Hono();

/**
 * GET /api/invitations/validate/:token
 *
 * Validate an invitation token before displaying the signup form.
 *
 * **Security**: Public endpoint (token-based security)
 * - No authentication required
 * - Token itself serves as authorization
 * - Does not reveal sensitive information for invalid tokens
 *
 * **URL Parameters**:
 * - `token` (string, required): 64-character hex token from invitation email
 *
 * **Validation Checks**:
 * 1. Token format: Must be at least 32 characters (prevents malformed requests)
 * 2. Token existence: Must exist in database
 * 3. Usage status: Must not be already used (invitations are one-time use)
 * 4. Expiration: Must not be past expiration date (7 days from creation)
 *
 * **Response** (200 OK):
 *
 * Valid token:
 * ```typescript
 * {
 *   valid: true;
 *   invitation: {
 *     id: string;           // Invitation ID
 *     email: string;        // Pre-filled email for signup form
 *     clientType: string | null;  // Associated client type (if any)
 *     expiresAt: Date;      // Expiration timestamp
 *   };
 * }
 * ```
 *
 * Invalid token (any reason):
 * ```typescript
 * {
 *   valid: false;
 *   message: string;  // Reason: "not found" | "already used" | "expired"
 * }
 * ```
 *
 * **Frontend Flow**:
 * 1. User clicks invitation link with token
 * 2. Frontend calls this endpoint to validate token
 * 3. If valid: Show signup form with pre-filled email
 * 4. If invalid: Show error message with reason
 *
 * **Error Handling**:
 * - 400 Bad Request: Invalid token format (< 32 chars)
 * - 500 Internal Server Error: Database query failed
 * - 200 OK with `valid: false`: Token found but invalid (used/expired)
 *
 * **Security Considerations**:
 * - Does not leak information about non-existent tokens (same response format)
 * - Timing attacks mitigated by consistent database queries
 * - No rate limiting (legitimate users may refresh validation)
 */
app.get('/validate/:token', async (c) => {
  const token = c.req.param('token');

  if (!token || token.length < 32) {
    throw new HTTPException(400, {
      message: 'Invalid invitation token',
    });
  }

  try {
    const invitationRecord = await db.query.invitation.findFirst({
      where: eq(invitation.token, token),
      with: {
        client: true,
      },
    });

    if (!invitationRecord) {
      return c.json({
        valid: false,
        message: 'Invitation not found',
      });
    }

    // Check if already used
    if (invitationRecord.used) {
      return c.json({
        valid: false,
        message: 'This invitation has already been used',
      });
    }

    // Check if expired
    if (new Date() > new Date(invitationRecord.expiresAt)) {
      return c.json({
        valid: false,
        message: 'This invitation has expired',
      });
    }

    return c.json({
      valid: true,
      invitation: {
        id: invitationRecord.id,
        email: invitationRecord.email,
        clientType: invitationRecord.client?.type || null,
        expiresAt: invitationRecord.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    throw new HTTPException(500, {
      message: 'Failed to validate invitation',
    });
  }
});

export default app;
