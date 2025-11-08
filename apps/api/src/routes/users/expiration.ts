import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { extendExpirationSchema } from '../../schemas/user';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id/extend-expiration
 * Update user's expiration date for temporary access
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/extend-expiration',
  requireAuth(),
  requireInternal(),
  zValidator('json', extendExpirationSchema),
  async (c) => {
    const userId = c.req.param('id');
    const body = c.req.valid('json');

    try {
      // Check if user exists
      const existingUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!existingUser) {
        throw new HTTPException(404, {
          message: 'User not found',
        });
      }

      // Update expiration date
      const [updatedUser] = await db
        .update(user)
        .set({
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        })
        .where(eq(user.id, userId))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(500, {
          message: 'Failed to update expiration',
        });
      }

      return c.json({
        success: true,
        message: body.expiresAt ? 'User expiration date updated' : 'User expiration date removed',
        data: {
          id: updatedUser.id,
          expiresAt: updatedUser.expiresAt,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error updating expiration:', error);
      throw new HTTPException(500, {
        message: 'Failed to update expiration',
      });
    }
  }
);

export default app;
