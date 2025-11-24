/**
 * Create sprint API route
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { sprint } from '../../db/schema/sprint.js';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth.js';
import { logActivity, EntityTypes, ActivityTypes } from '../../utils/activity.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * POST / - Create a new sprint
 * Protected: Requires authentication and internal team member status
 */
app.post('/', requireAuth(), requireInternal(), async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  try {
    const body = await c.req.json();
    const { projectId, name, goal, status, startDate, endDate, plannedPoints, sprintNumber } = body;

    // Validate required fields
    if (!projectId) {
      return c.json({ success: false, message: 'Project ID is required' }, 400);
    }
    if (!name || name.trim().length === 0) {
      return c.json({ success: false, message: 'Name is required' }, 400);
    }

    // Auto-generate sprint number if not provided
    let finalSprintNumber = sprintNumber;
    if (!finalSprintNumber) {
      const lastSprint = await db.query.sprint.findFirst({
        where: eq(sprint.projectId, projectId),
        orderBy: [desc(sprint.sprintNumber)],
      });
      finalSprintNumber = (lastSprint?.sprintNumber ?? 0) + 1;
    }

    const id = nanoid();
    const now = new Date();

    const [newSprint] = await db
      .insert(sprint)
      .values({
        id,
        projectId,
        name: name.trim(),
        goal: goal?.trim() || null,
        status: status || 'planning',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        plannedPoints: plannedPoints ?? 0,
        completedPoints: 0,
        sprintNumber: finalSprintNumber,
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
        field: 'sprint',
        newValue: name,
        description: `Created sprint "${name}"`,
      },
      projectId,
    });

    return c.json({
      success: true,
      data: newSprint,
    });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return c.json({ success: false, message: 'Failed to create sprint' }, 500);
  }
});

export default app;
