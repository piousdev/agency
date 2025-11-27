import { Hono } from 'hono';

import activityRoutes from './activity';
import assignRoutes from './assign';
import commentsRoutes from './comments';
import createRoutes from './create';
import getRoutes from './get';
import listRoutes from './list';
import updateRoutes from './update';

import type { AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all ticket routes
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', createRoutes);
app.route('/', updateRoutes);
app.route('/', assignRoutes);
app.route('/', commentsRoutes);
app.route('/', activityRoutes);

export default app;
