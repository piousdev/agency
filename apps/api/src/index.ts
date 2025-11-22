import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { auth } from './lib/auth.js';
import { initSentry } from './lib/sentry.js';
import { type AuthVariables, authContext } from './middleware/auth.js';
import { errorHandler } from './middleware/handle-errors.js';
import clientRoutes from './routes/clients/index.js';
import dbTestRoutes from './routes/db-test.js';
import healthRoutes from './routes/health/index.js';
import invitationRoutes from './routes/invitations/index.js';
import projectRoutes from './routes/projects/index.js';
import roleRoutes from './routes/roles/index.js';
import ticketRoutes from './routes/tickets/index.js';
import userRoutes from './routes/users/index.js';

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

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

// Only start the server if not running in test mode
if (!process.env.VITEST) {
  console.log(`Hono server starting on http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
export type AppType = typeof app;
