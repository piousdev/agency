import { Hono } from 'hono';
import { type AuthVariables } from '../../middleware/auth';
import listRoutes from './list';
import getRoutes from './get';
import updateRoutes from './update';
import deleteRoutes from './delete';
import internalStatusRoutes from './internal-status';
import expirationRoutes from './expiration';
import rolesRoutes from './roles';

const app = new Hono<{ Variables: AuthVariables }>();

// Mount all user routes
app.route('/', listRoutes);
app.route('/', getRoutes);
app.route('/', updateRoutes);
app.route('/', deleteRoutes);
app.route('/', internalStatusRoutes);
app.route('/', expirationRoutes);
app.route('/', rolesRoutes);

export default app;
