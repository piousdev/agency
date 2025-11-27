import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema/index.js';

// Environment variables should be loaded at the entry point (index.ts)
if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === '') {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
