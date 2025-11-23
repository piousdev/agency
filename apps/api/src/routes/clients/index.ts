import { Hono } from 'hono';
import type { AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import getRoutes from './get';
import createRoutes from './create';
import updateRoutes from './update';
import activityRoutes from './activity';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all client routes
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', createRoutes);
app.route('/', updateRoutes);
app.route('/', activityRoutes);

export default app;
