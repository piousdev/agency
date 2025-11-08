import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import getRoutes from './get';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all role routes
app.route('/', listRoutes);
app.route('/', getRoutes);

export default app;
