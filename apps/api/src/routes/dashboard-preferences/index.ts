import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import getRoutes from './get';
import saveRoutes from './save';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount dashboard preferences routes
app.route('/', getRoutes);
app.route('/', saveRoutes);

export default app;
