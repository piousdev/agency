import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import dbTestRoutes from './routes/db-test.js';
import invitationRoutes from './routes/invitations/index.js';
import userRoutes from './routes/users/index.js';
import roleRoutes from './routes/roles/index.js';
import healthRoutes from './routes/health/index.js';
import { auth } from './lib/auth.js';
import { errorHandler } from './middleware/handle-errors.js';
import { authContext, type AuthVariables } from './middleware/auth.js';
import { initSentry } from './lib/sentry.js';

// Initialize Sentry for error tracking and monitoring
initSentry();

const app = new Hono<{ Variables: AuthVariables }>();

// Error handler
app.onError(errorHandler);

// Middleware
app.use('*', logger());
// CORS configuration - uses environment variable with fallback for development
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];

app.use(
  '*',
  cors({
    origin: allowedOrigins,
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
app.route('/api/invitations', invitationRoutes);
app.route('/api/users', userRoutes);
app.route('/api/roles', roleRoutes);

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

console.log(`Hono server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
export type AppType = typeof app;
