/**
 * Sprint routes aggregator
 */

import { Hono } from 'hono';

import create from './create.js';
import del from './delete.js';
import get from './get.js';
import list from './list.js';
import update from './update.js';

const app = new Hono();

app.route('/', list);
app.route('/', get);
app.route('/', create);
app.route('/', update);
app.route('/', del);

export default app;
