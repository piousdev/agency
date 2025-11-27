import { Hono } from 'hono';

import assignRoutes from './assign';
import createRoutes from './create';
import deleteRoutes from './delete';
import getRoutes from './get';
import listRoutes from './list';
import updateRoutes from './update';

import type { AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all label routes
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', createRoutes);
app.route('/', updateRoutes);
app.route('/', deleteRoutes);
app.route('/', assignRoutes);

export default app;
