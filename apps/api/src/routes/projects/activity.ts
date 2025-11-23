import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { activity, project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { ActivityType } from '../../db/schema/activity';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id/activity
 * Get activity feed for a project
 * Protected: Requires authentication and internal team member status
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 * - types: comma-separated activity types to filter (optional)
 */
app.get('/:id/activity', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const offset = parseInt(c.req.query('offset') || '0');
  const typesParam = c.req.query('types');
  const types = typesParam ? (typesParam.split(',') as ActivityType[]) : undefined;

  try {
    // Verify project exists
    const projectData = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    });

    if (!projectData) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    // Build where clause
    const whereConditions = [eq(activity.projectId, projectId)];

    if (types && types.length > 0) {
      whereConditions.push(inArray(activity.type, types));
    }

    const activities = await db.query.activity.findMany({
      where: and(...whereConditions),
      with: {
        actor: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [desc(activity.createdAt)],
      limit,
      offset,
    });

    // Get total count for pagination
    const totalResult = await db
      .select({ count: activity.id })
      .from(activity)
      .where(and(...whereConditions));

    return c.json({
      success: true,
      data: activities,
      pagination: {
        limit,
        offset,
        total: totalResult.length,
        hasMore: offset + activities.length < totalResult.length,
      },
    });
  } catch (error) {
    console.error('Error fetching project activity:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch activity' });
  }
});

export default app;
