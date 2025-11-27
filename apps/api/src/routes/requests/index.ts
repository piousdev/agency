import { Hono } from 'hono';

import analyticsRoutes from './analytics';
import bulkRoutes from './bulk';
import createRoutes from './create';
import getRoutes from './get';
import listRoutes from './list';
import transitionRoutes from './transition';
import updateRoutes from './update';

import type { AuthVariables } from '../../middleware/auth';

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
