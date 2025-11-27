import { Hono } from 'hono';

import type { AuthVariables } from '../../middleware/auth.js';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * GET /live
 * Liveness probe - basic check that application is running
 * Used by Kubernetes, Docker, and load balancers
 */
app.get('/live', (c) => {
  return c.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    200
  );
});

export default app;
