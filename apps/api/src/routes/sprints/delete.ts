/**
 * Delete sprint API route
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { sprint } from '../../db/schema/sprint.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth.js';
import { logActivity, EntityTypes, ActivityTypes } from '../../utils/activity.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * DELETE /:id - Delete a sprint
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id', requireAuth(), requireInternal(), async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  const id = c.req.param('id');

  try {
    // Get existing sprint for logging
    const existing = await db.query.sprint.findFirst({
      where: eq(sprint.id, id),
    });

    if (!existing) {
      return c.json({ success: false, message: 'Sprint not found' }, 404);
    }

    // Delete sprint
    await db.delete(sprint).where(eq(sprint.id, id));

    // Log activity
    await logActivity({
      entityType: EntityTypes.PROJECT,
      entityId: existing.projectId,
      actorId: user.id,
      type: ActivityTypes.DELETED,
      metadata: {
        field: 'sprint',
        oldValue: existing.name,
        description: `Deleted sprint "${existing.name}"`,
      },
      projectId: existing.projectId,
    });

    return c.json({
      success: true,
      message: 'Sprint deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return c.json({ success: false, message: 'Failed to delete sprint' }, 500);
  }
});

export default app;
