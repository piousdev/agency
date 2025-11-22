import { Hono } from 'hono';
import type { AuthVariables } from '../../middleware/auth';
import listRoutes from './list';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all client routes
app.route('/', listRoutes);

export default app;
