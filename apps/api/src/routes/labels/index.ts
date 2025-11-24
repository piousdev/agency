import { Hono } from 'hono';
import type { AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import getRoutes from './get';
import createRoutes from './create';
import updateRoutes from './update';
import deleteRoutes from './delete';
import assignRoutes from './assign';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all label routes
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', createRoutes);
app.route('/', updateRoutes);
app.route('/', deleteRoutes);
app.route('/', assignRoutes);

export default app;
