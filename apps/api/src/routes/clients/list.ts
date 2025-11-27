import { eq, asc } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { db } from '../../db';
import { client } from '../../db/schema';
import { requireAuth, requireInternal, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /
 * List all clients
 * Protected: Requires authentication and internal team member status
 */
app.get('/', requireAuth(), requireInternal(), async (c) => {
  const activeOnly = c.req.query('active') !== 'false';

  try {
    const clients = await db.query.client.findMany({
      where: activeOnly ? eq(client.active, true) : undefined,
      orderBy: [asc(client.name)],
    });

    return c.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error listing clients:', error);
    throw new HTTPException(500, {
      message: 'Failed to list clients',
    });
  }
});

export default app;
