/**
 * Update sprint API route
 */

import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db/index.js';
import { sprint, type Sprint } from '../../db/schema/sprint.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth.js';
import { logEntityChange, EntityTypes } from '../../utils/activity.js';

const app = new Hono<{ Variables: AuthVariables }>();

type SprintStatus = Sprint['status'];

/**
 * PATCH /:id - Update a sprint
 * Protected: Requires authentication and internal team member status
 */
app.patch('/:id', requireAuth(), requireInternal(), async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  const id = c.req.param('id');

  try {
    // Get existing sprint
    const existing = await db.query.sprint.findFirst({
      where: eq(sprint.id, id),
    });

    if (!existing) {
      return c.json({ success: false, message: 'Sprint not found' }, 404);
    }

    const body: unknown = await c.req.json();
    const name = (body as Record<string, unknown>).name as string | undefined;
    const goal = (body as Record<string, unknown>).goal as string | undefined;
    const status = (body as Record<string, unknown>).status as string | undefined;
    const startDate = (body as Record<string, unknown>).startDate as string | undefined;
    const endDate = (body as Record<string, unknown>).endDate as string | undefined;
    const plannedPoints = (body as Record<string, unknown>).plannedPoints as number | undefined;
    const completedPoints = (body as Record<string, unknown>).completedPoints as number | undefined;
    const sprintNumber = (body as Record<string, unknown>).sprintNumber as number | undefined;

    // Build update object with proper types
    const updates: Partial<{
      name: string;
      goal: string | null;
      status: SprintStatus;
      startDate: Date | null;
      endDate: Date | null;
      plannedPoints: number;
      completedPoints: number;
      sprintNumber: number;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (goal !== undefined) updates.goal = goal.trim() !== '' ? goal.trim() : null;
    if (status !== undefined) updates.status = status as SprintStatus;
    if (startDate !== undefined) updates.startDate = startDate !== '' ? new Date(startDate) : null;
    if (endDate !== undefined) updates.endDate = endDate !== '' ? new Date(endDate) : null;
    if (plannedPoints !== undefined) updates.plannedPoints = plannedPoints;
    if (completedPoints !== undefined) updates.completedPoints = completedPoints;
    if (sprintNumber !== undefined) updates.sprintNumber = sprintNumber;

    // Perform update
    const [updated] = await db.update(sprint).set(updates).where(eq(sprint.id, id)).returning();

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
        goal: existing.goal,
        status: existing.status,
        startDate: existing.startDate?.toISOString(),
        endDate: existing.endDate?.toISOString(),
        plannedPoints: existing.plannedPoints,
      },
      {
        name: updates.name,
        goal: updates.goal,
        status: updates.status,
        startDate: updates.startDate?.toISOString(),
        endDate: updates.endDate?.toISOString(),
        plannedPoints: updates.plannedPoints,
      }
    );

    return c.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating sprint:', error);
    return c.json({ success: false, message: 'Failed to update sprint' }, 500);
  }
});

export default app;
