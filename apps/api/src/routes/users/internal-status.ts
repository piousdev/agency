import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { updateInternalStatusSchema } from '../../schemas/user';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id/internal-status
 * Toggle user's internal team member status
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/internal-status',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateInternalStatusSchema),
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

      // Update internal status
      const [updatedUser] = await db
        .update(user)
        .set({ isInternal: body.isInternal })
        .where(eq(user.id, userId))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(500, {
          message: 'Failed to update internal status',
        });
      }

      return c.json({
        success: true,
        message: `User ${body.isInternal ? 'marked as' : 'removed from'} internal team`,
        data: {
          id: updatedUser.id,
          isInternal: updatedUser.isInternal,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error updating internal status:', error);
      throw new HTTPException(500, {
        message: 'Failed to update internal status',
      });
    }
  }
);

export default app;
