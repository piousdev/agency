/**
 * Update milestone API route
 */

import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db/index.js';
import { milestone, type Milestone } from '../../db/schema/milestone.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth.js';
import { logEntityChange, EntityTypes } from '../../utils/activity.js';

const app = new Hono<{ Variables: AuthVariables }>();

type MilestoneStatus = Milestone['status'];

/**
 * PATCH /:id - Update a milestone
 * Protected: Requires authentication and internal team member status
 */
app.patch('/:id', requireAuth(), requireInternal(), async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  const id = c.req.param('id');

  try {
    // Get existing milestone
    const existing = await db.query.milestone.findFirst({
      where: eq(milestone.id, id),
    });

    if (!existing) {
      return c.json({ success: false, message: 'Milestone not found' }, 404);
    }

    const body: unknown = await c.req.json();
    const name = (body as Record<string, unknown>).name as string | undefined;
    const description = (body as Record<string, unknown>).description as string | undefined;
    const status = (body as Record<string, unknown>).status as string | undefined;
    const dueDate = (body as Record<string, unknown>).dueDate as string | undefined;
    const sortOrder = (body as Record<string, unknown>).sortOrder as number | undefined;

    // Build update object with proper types
    const updates: Partial<{
      name: string;
      description: string | null;
      status: MilestoneStatus;
      dueDate: Date | null;
      sortOrder: number;
      completedAt: Date | null;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined)
      updates.description = description.trim() !== '' ? description.trim() : null;
    if (status !== undefined) {
      updates.status = status as MilestoneStatus;
      // Set completedAt when status changes to completed
      if (status === 'completed' && existing.status !== 'completed') {
        updates.completedAt = new Date();
      } else if (status !== 'completed' && existing.status === 'completed') {
        updates.completedAt = null;
      }
    }
    if (dueDate !== undefined) updates.dueDate = dueDate !== '' ? new Date(dueDate) : null;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    // Perform update
    const [updated] = await db
      .update(milestone)
      .set(updates)
      .where(eq(milestone.id, id))
      .returning();

    // Log activity
    await logEntityChange(
      {
        entityType: EntityTypes.PROJECT,
        entityId: existing.projectId,
        actorId: user.id,
        projectId: existing.projectId,
      },
      {
        name: existing.name,
        description: existing.description,
        status: existing.status,
        dueDate: existing.dueDate?.toISOString(),
      },
      {
        name: updates.name,
        description: updates.description,
        status: updates.status,
        dueDate: updates.dueDate?.toISOString(),
      }
    );

    return c.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return c.json({ success: false, message: 'Failed to update milestone' }, 500);
  }
});

export default app;
