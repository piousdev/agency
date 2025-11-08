import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { type AuthVariables } from '../../middleware/auth.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /ready
 * Readiness probe - checks if application is ready to accept traffic
 * Used by Kubernetes, Docker, and load balancers
 */
app.get('/ready', async (c) => {
  try {
    // Verify database is reachable
    await db.execute(sql`SELECT 1`);

    return c.json(
      {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
      200
    );
  } catch {
    return c.json(
      {
        status: 'not ready',
        message: 'Database not accessible',
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

export default app;
