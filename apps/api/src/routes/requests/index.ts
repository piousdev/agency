import { Hono } from 'hono';
import type { AuthVariables } from '../../middleware/auth';

import createRoutes from './create';
import listRoutes from './list';
import getRoutes from './get';
import updateRoutes from './update';
import transitionRoutes from './transition';
import bulkRoutes from './bulk';
import analyticsRoutes from './analytics';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount routes
app.route('/', createRoutes);
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', updateRoutes);
app.route('/', transitionRoutes);
app.route('/', bulkRoutes);
app.route('/analytics', analyticsRoutes);

export default app;
