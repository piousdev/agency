/**
 * Create milestone API route
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';

import { db } from '../../db/index.js';
import { milestone } from '../../db/schema/milestone.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth.js';
import { logActivity, EntityTypes, ActivityTypes } from '../../utils/activity.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST / - Create a new milestone
 * Protected: Requires authentication and internal team member status
 */
app.post('/', requireAuth(), requireInternal(), async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    const body: unknown = await c.req.json();
    const projectId = (body as Record<string, unknown>).projectId as string | undefined;
    const name = (body as Record<string, unknown>).name as string | undefined;
    const description = (body as Record<string, unknown>).description as string | undefined;
    const status = (body as Record<string, unknown>).status as string | undefined;
    const dueDate = (body as Record<string, unknown>).dueDate as string | undefined;
    const sortOrder = (body as Record<string, unknown>).sortOrder as number | undefined;

    // Validate required fields
    if (projectId === undefined || projectId === '') {
      return c.json({ success: false, message: 'Project ID is required' }, 400);
    }
    if (name === undefined || name.trim().length === 0) {
      return c.json({ success: false, message: 'Name is required' }, 400);
    }

    const id = nanoid();
    const now = new Date();

    const [newMilestone] = await db
      .insert(milestone)
      .values({
        id,
        projectId,
        name: name.trim(),
        description:
          description !== undefined && description.trim() !== '' ? description.trim() : null,
        status: status ?? 'pending',
        dueDate: dueDate !== undefined ? new Date(dueDate) : null,
        sortOrder: sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Log activity
    await logActivity({
      entityType: EntityTypes.PROJECT,
      entityId: projectId,
      actorId: user.id,
      type: ActivityTypes.CREATED,
      metadata: {
        field: 'milestone',
        newValue: name,
        description: `Created milestone "${name}"`,
      },
      projectId,
    });

    return c.json({
      success: true,
      data: newMilestone,
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return c.json({ success: false, message: 'Failed to create milestone' }, 500);
  }
});

export default app;
