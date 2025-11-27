/**
 * List milestones API route
 */

import { asc, desc } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../../db/index.js';
import { milestone, type Milestone } from '../../db/schema/milestone.js';
import { requireAuth, requireInternal } from '../../middleware/auth.js';

const app = new Hono();

type MilestoneStatus = Milestone['status'];

/**
 * GET / - List milestones for a project
 * Protected: Requires authentication and internal team member status
 * Query params:
 *   - projectId (required): Filter by project
 *   - status: Filter by status
 *   - sort: Sort by 'sortOrder' (default), 'dueDate', 'createdAt'
 */
app.get('/', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.query('projectId');
  const status = c.req.query('status') as MilestoneStatus | undefined;
  const sort = c.req.query('sort') ?? 'sortOrder';

  if (projectId === undefined || projectId === '') {
    return c.json({ success: false, message: 'projectId is required' }, 400);
  }

  try {
    // Execute query with filtering and sorting
    const milestones = await db.query.milestone.findMany({
      where: status
        ? (fields, { and, eq }) => and(eq(fields.projectId, projectId), eq(fields.status, status))
        : (fields, { eq }) => eq(fields.projectId, projectId),
      orderBy:
        sort === 'dueDate'
          ? [asc(milestone.dueDate)]
          : sort === 'createdAt'
            ? [desc(milestone.createdAt)]
            : [asc(milestone.sortOrder)],
    });

    return c.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    console.error('Error listing milestones:', error);
    return c.json({ success: false, message: 'Failed to list milestones' }, 500);
  }
});

export default app;
