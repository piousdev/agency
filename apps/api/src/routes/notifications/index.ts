import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import updateRoutes from './update';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all notification routes
app.route('/', listRoutes);
app.route('/', updateRoutes);

export default app;
