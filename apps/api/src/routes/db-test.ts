import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

const app = new Hono();

app.get('/test', async (c) => {
  try {
    // Simple query to test connection
    const result = await db.execute(
      sql`SELECT NOW() as current_time, version() as postgres_version`
    );

    return c.json({
      status: 'success',
      message: 'Database connection successful',
      data: result.rows[0],
    });
  } catch (error) {
    return c.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
