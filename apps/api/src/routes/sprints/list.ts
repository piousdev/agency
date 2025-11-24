/**
 * List sprints API route
 */

import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { sprint, type Sprint } from '../../db/schema/sprint.js';
import { requireAuth, requireInternal } from '../../middleware/auth.js';

const app = new Hono();

type SprintStatus = Sprint['status'];

/**
 * GET / - List sprints
 * Protected: Requires authentication and internal team member status
 * Query params:
 *   - projectId (optional): Filter by project. If not provided, returns all sprints with project info
 *   - status: Filter by status
 *   - sort: Sort by 'startDate' (default), 'sprintNumber', 'createdAt'
 */
app.get('/', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.query('projectId');
  const status = c.req.query('status') as SprintStatus | undefined;
  const sort = c.req.query('sort') || 'startDate';

  try {
    // Build where conditions
    const conditions = [];
    if (projectId) {
      conditions.push(eq(sprint.projectId, projectId));
    }
    if (status) {
      conditions.push(eq(sprint.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sprints = await db.query.sprint.findMany({
      where: whereClause,
      with: projectId
        ? undefined
        : {
            project: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
      orderBy:
        sort === 'sprintNumber'
          ? [desc(sprint.sprintNumber)]
          : sort === 'createdAt'
            ? [desc(sprint.createdAt)]
            : [desc(sprint.startDate)],
    });

    return c.json({
      success: true,
      data: sprints,
    });
  } catch (error) {
    console.error('Error listing sprints:', error);
    return c.json({ success: false, message: 'Failed to list sprints' }, 500);
  }
});

export default app;
