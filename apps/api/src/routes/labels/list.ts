import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../db';
import { label } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List all labels
 * Protected: Requires authentication and internal team member status
 */
app.get('/', requireAuth(), requireInternal(), async (c) => {
  const scope = c.req.query('scope') as 'global' | 'project' | 'ticket' | undefined;

  try {
    const labels = await db.query.label.findMany({
      where: scope ? eq(label.scope, scope) : undefined,
      orderBy: [asc(label.name)],
    });

    return c.json({
      success: true,
      data: labels,
    });
  } catch (error) {
    console.error('Error listing labels:', error);
    throw new HTTPException(500, {
      message: 'Failed to list labels',
    });
  }
});

export default app;
