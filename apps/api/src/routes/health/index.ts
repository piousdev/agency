import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth.js';
import basicRoutes from './basic.js';
import readyRoutes from './ready.js';
import liveRoutes from './live.js';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all health check routes
app.route('/', basicRoutes);
app.route('/', readyRoutes);
app.route('/', liveRoutes);

export default app;
