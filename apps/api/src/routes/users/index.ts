import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import getRoutes from './get';
import updateRoutes from './update';
import deleteRoutes from './delete';
import internalStatusRoutes from './internal-status';
import expirationRoutes from './expiration';
import rolesRoutes from './roles';
import capacityRoutes from './capacity';
import teamRoutes from './team';

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
app.route('/', capacityRoutes);

export default app;
