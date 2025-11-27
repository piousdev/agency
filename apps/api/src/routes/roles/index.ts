import { Hono } from 'hono';

import getRoutes from './get';
import listRoutes from './list';

import type { AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all role routes
app.route('/', listRoutes);
app.route('/', getRoutes);

export default app;
