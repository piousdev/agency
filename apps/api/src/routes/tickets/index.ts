import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import getRoutes from './get';
import createRoutes from './create';
import updateRoutes from './update';
import assignRoutes from './assign';
import commentsRoutes from './comments';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all ticket routes
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', createRoutes);
app.route('/', updateRoutes);
app.route('/', assignRoutes);
app.route('/', commentsRoutes);

export default app;
