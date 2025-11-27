import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { updateUserSchema } from '../../schemas/user';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /:id
 * Update user details
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateUserSchema),
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

      // Check if email is being updated and if it's already taken
      if (body.email !== undefined && body.email !== existingUser.email) {
        const emailTaken = await db.query.user.findFirst({
          where: eq(user.email, body.email),
        });

        if (emailTaken) {
          throw new HTTPException(409, {
            message: 'Email is already in use',
          });
        }
      }

      // Prepare update data
      const updateData: Partial<typeof user.$inferInsert> = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.image !== undefined) updateData.image = body.image;
      if (body.role !== undefined) updateData.role = body.role;
      if (body.isInternal !== undefined) updateData.isInternal = body.isInternal;
      if (body.expiresAt !== undefined) {
        updateData.expiresAt = body.expiresAt !== null ? new Date(body.expiresAt) : null;
      }

      // Update user
      const [updatedUser] = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, userId))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(500, {
          message: 'Failed to update user',
        });
      }

      return c.json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
          image: updatedUser.image,
          role: updatedUser.role,
          isInternal: updatedUser.isInternal,
          expiresAt: updatedUser.expiresAt,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new HTTPException(500, {
        message: 'Failed to update user',
      });
    }
  }
);

export default app;
