import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';
import { requireAuth, requireInternal, type AuthVariables } from '../middleware/auth.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * Database connectivity test endpoint
 *
 * **Security**: Protected by requireAuth() + requireInternal() middleware
 * - Only authenticated internal team members can access this endpoint
 * - Does NOT expose sensitive database version information
 */
app.get('/test', requireAuth(), requireInternal(), async (c) => {
  try {
    // Simple query to test connection - only check connectivity, don't expose version
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    return c.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: result.rows[0]?.current_time,
    });
  } catch (error) {
    // Don't expose detailed error messages
    console.error('Database connection test failed:', error);
    return c.json(
      {
        status: 'error',
        message: 'Database connection failed',
      },
      500
    );
  }
});

export default app;
