import { Hono } from 'hono';

import listRoutes from './list';
import updateRoutes from './update';

import type { AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all notification routes
app.route('/', listRoutes);
app.route('/', updateRoutes);

export default app;
