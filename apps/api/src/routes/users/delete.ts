import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { user } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * DELETE /:id
 * Delete a user and their associated data
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id', requireAuth(), requireInternal(), async (c) => {
  const userId = c.req.param('id');
  const authenticatedUser = c.get('user');

  try {
    // Prevent users from deleting themselves
    if (authenticatedUser?.id === userId) {
      throw new HTTPException(400, {
        message: 'You cannot delete your own account',
      });
    }

    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      throw new HTTPException(404, {
        message: 'User not found',
      });
    }

    // Delete user (cascade will handle related records)
    await db.delete(user).where(eq(user.id, userId));

    return c.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error deleting user:', error);
    throw new HTTPException(500, {
      message: 'Failed to delete user',
    });
  }
});

export default app;
