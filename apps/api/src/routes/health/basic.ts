import { Hono } from 'hono';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { type AuthVariables } from '@/middleware/auth';
import packageJson from '../../../package.json' with { type: 'json' };

const app = new Hono<{ Variables: AuthVariables }>();

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail';
  message?: string;
  responseTime?: number;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: Record<string, HealthCheck>;
}

/**
 * GET /
 * Comprehensive health check with database connectivity validation
 */
app.get('/', async (c) => {
  const checks: Record<string, HealthCheck> = {};

  // Check database connectivity
  try {
    const dbStartTime = Date.now();
    await db.execute(sql`SELECT 1 as health_check`);
    checks.database = {
      name: 'database',
      status: 'pass',
      responseTime: Date.now() - dbStartTime,
    };
  } catch (error) {
    checks.database = {
      name: 'database',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown database error',
    };
  }

  // Determine overall health status
  const isHealthy = Object.values(checks).every((check) => check.status === 'pass');

  const response: HealthResponse = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: process.uptime(),
    checks,
  };

  return c.json(response, isHealthy ? 200 : 503);
});

export default app;
