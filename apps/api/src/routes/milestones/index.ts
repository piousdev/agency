/**
 * Milestones API routes
 * Provides CRUD operations for project milestones
 */

import { Hono } from 'hono';

import createRoutes from './create.js';
import deleteRoutes from './delete.js';
import getRoutes from './get.js';
import listRoutes from './list.js';
import updateRoutes from './update.js';

const app = new Hono();

// Mount routes
app.route('/', listRoutes); // GET /
app.route('/', getRoutes); // GET /:id
app.route('/', createRoutes); // POST /
app.route('/', updateRoutes); // PATCH /:id
app.route('/', deleteRoutes); // DELETE /:id

export default app;
