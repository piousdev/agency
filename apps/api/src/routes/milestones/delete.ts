/**
 * Delete milestone API route
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { milestone } from '../../db/schema/milestone.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth.js';
import { logActivity, EntityTypes, ActivityTypes } from '../../utils/activity.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * DELETE /:id - Delete a milestone
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id', requireAuth(), requireInternal(), async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  const id = c.req.param('id');

  try {
    // Get existing milestone for logging
    const existing = await db.query.milestone.findFirst({
      where: eq(milestone.id, id),
    });

    if (!existing) {
      return c.json({ success: false, message: 'Milestone not found' }, 404);
    }

    // Delete milestone
    await db.delete(milestone).where(eq(milestone.id, id));

    // Log activity
    await logActivity({
      entityType: EntityTypes.PROJECT,
      entityId: existing.projectId,
      actorId: user.id,
      type: ActivityTypes.DELETED,
      metadata: {
        field: 'milestone',
        oldValue: existing.name,
        description: `Deleted milestone "${existing.name}"`,
      },
      projectId: existing.projectId,
    });

    return c.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return c.json({ success: false, message: 'Failed to delete milestone' }, 500);
  }
});

export default app;
