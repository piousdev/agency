import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * Schema for updating user capacity
 */
const updateCapacitySchema = z.object({
  capacityPercentage: z.coerce.number().int().min(0).max(200),
});

/**
 * PATCH /:id/capacity
 * Update user capacity percentage
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id/capacity',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateCapacitySchema),
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

      // Update capacity percentage
      await db
        .update(user)
        .set({
          capacityPercentage: body.capacityPercentage,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      // Fetch updated user
      const updatedUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
        with: {
          projectAssignments: {
            with: {
              project: {
                columns: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      return c.json({
        success: true,
        data: {
          id: updatedUser?.id,
          name: updatedUser?.name,
          email: updatedUser?.email,
          image: updatedUser?.image,
          isInternal: updatedUser?.isInternal,
          capacityPercentage: updatedUser?.capacityPercentage,
          projectCount: updatedUser?.projectAssignments.length,
          projects: updatedUser?.projectAssignments.map((pa) => pa.project),
        },
        message: 'User capacity updated successfully',
      });
    } catch (error) {
      console.error('Error updating user capacity:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to update user capacity',
      });
    }
  }
);

export default app;
