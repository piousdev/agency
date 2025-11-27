import { Hono } from 'hono';

import getRoutes from './get';
import saveRoutes from './save';

import type { AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount dashboard preferences routes
app.route('/', getRoutes);
app.route('/', saveRoutes);

export default app;
