import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { activity, project } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';
import { desc, eq } from 'drizzle-orm';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /:id/activity
 * Get activity feed for a project
 * Protected: Requires authentication and internal team member status
 */
app.get('/:id/activity', requireAuth(), requireInternal(), async (c) => {
  const projectId = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    // Verify project exists
    const projectData = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    });

    if (!projectData) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    const activities = await db.query.activity.findMany({
      where: eq(activity.projectId, projectId),
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

    return c.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching project activity:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch activity' });
  }
});

export default app;
