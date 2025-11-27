import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { label } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { logActivity, ActivityTypes, EntityTypes } from '../../utils/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * DELETE /:id
 * Delete a label
 * Protected: Requires authentication and internal team member status
 */
app.delete('/:id', requireAuth(), requireInternal(), async (c) => {
  const labelId = c.req.param('id');
  const currentUser = c.get('user');

  if (!currentUser) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    // Check if label exists
    const existingLabel = await db.query.label.findFirst({
      where: eq(label.id, labelId),
    });

    if (!existingLabel) {
      throw new HTTPException(404, {
        message: 'Label not found',
      });
    }

    // Delete the label (cascades to project_label and ticket_label)
    await db.delete(label).where(eq(label.id, labelId));

    // Log activity for label deletion
    await logActivity({
      type: ActivityTypes.DELETED,
      entityType: EntityTypes.LABEL,
      entityId: labelId,
      actorId: currentUser.id,
      metadata: {
        name: existingLabel.name,
      },
    });

    return c.json({
      success: true,
      message: 'Label deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting label:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: 'Failed to delete label',
    });
  }
});

export default app;
