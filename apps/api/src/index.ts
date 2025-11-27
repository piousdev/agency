import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { auth } from './lib/auth.js';
import { startAgingCheckCron } from './lib/intake-notifications.js';
import { initSentry } from './lib/sentry.js';
import { initializeSocketIO } from './lib/socket.js';
import { authContext } from './middleware/auth.js';
import { errorHandler } from './middleware/handle-errors.js';
import clientRoutes from './routes/clients/index.js';
import dashboardPreferencesRoutes from './routes/dashboard-preferences/index.js';
import dbTestRoutes from './routes/db-test.js';
import devAlertsRoutes from './routes/dev/alerts.js';
import healthRoutes from './routes/health/index.js';
import invitationRoutes from './routes/invitations/index.js';
import labelRoutes from './routes/labels/index.js';
import milestoneRoutes from './routes/milestones/index.js';
import notificationRoutes from './routes/notifications/index.js';
import projectRoutes from './routes/projects/index.js';
import requestRoutes from './routes/requests/index.js';
import roleRoutes from './routes/roles/index.js';
import sprintRoutes from './routes/sprints/index.js';
import ticketRoutes from './routes/tickets/index.js';
import userRoutes from './routes/users/index.js';

import type { AuthVariables } from './middleware/auth.js';
import type { Server as HttpServer } from 'node:http';

// Initialize Sentry for error tracking and monitoring
initSentry();

const app = new Hono<{ Variables: AuthVariables }>();

// Error handler
app.onError(errorHandler);

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Auth context middleware - attaches user and session to context
app.use('*', authContext);

// Root route
app.get('/', (c) => {
  return c.json({
    message: 'Skyll Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      healthReady: '/health/ready',
      healthLive: '/health/live',
      db: '/db/test',
      auth: '/api/auth',
      invitations: '/api/invitations',
      users: '/api/users',
      roles: '/api/roles',
      tickets: '/api/tickets',
      projects: '/api/projects',
      clients: '/api/clients',
      labels: '/api/labels',
      notifications: '/api/notifications',
      requests: '/api/requests',
    },
  });
});

// Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// Routes
app.route('/health', healthRoutes);
app.route('/db', dbTestRoutes);
app.route('/api/clients', clientRoutes);
app.route('/api/invitations', invitationRoutes);
app.route('/api/users', userRoutes);
app.route('/api/roles', roleRoutes);
app.route('/api/tickets', ticketRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/labels', labelRoutes);
app.route('/api/milestones', milestoneRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/sprints', sprintRoutes);
app.route('/api/requests', requestRoutes);
app.route('/api/dashboard-preferences', dashboardPreferencesRoutes);

// Development-only routes for testing
if (process.env.NODE_ENV !== 'production') {
  app.route('/dev/alerts', devAlertsRoutes);
}

const port =
  process.env.PORT !== undefined && process.env.PORT !== '' ? parseInt(process.env.PORT, 10) : 8000;

// Only start the server if not running in test mode
if (process.env.VITEST === undefined) {
  console.log(`Hono server starting on http://localhost:${String(port)}`);

  const server = serve({
    fetch: app.fetch,
    port,
  });

  // Initialize Socket.IO with the HTTP server
  // Cast to satisfy Socket.IO's type requirements (node-server returns compatible type)
  initializeSocketIO(server as unknown as HttpServer);

  // Start intake aging check cron job (runs every hour)
  startAgingCheckCron();
}

export default app;
export type AppType = typeof app;
