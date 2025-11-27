import { Hono } from 'hono';

import capacityRoutes from './capacity';
import deleteRoutes from './delete';
import expirationRoutes from './expiration';
import getRoutes from './get';
import internalStatusRoutes from './internal-status';
import listRoutes from './list';
import permissionsRoutes from './permissions';
import rolesRoutes from './roles';
import teamRoutes from './team';
import updateRoutes from './update';

import type { AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all user routes
// IMPORTANT: Specific routes must come before wildcard routes (/:id)
app.route('/', listRoutes);
app.route('/', teamRoutes); // Moved before getRoutes to prevent /team matching /:id
app.route('/', getRoutes);
app.route('/', updateRoutes);
app.route('/', deleteRoutes);
app.route('/', internalStatusRoutes);
app.route('/', expirationRoutes);
app.route('/', rolesRoutes);
app.route('/', permissionsRoutes);
app.route('/', capacityRoutes);

export default app;
