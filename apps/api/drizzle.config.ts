/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * @type {import('drizzle-kit').Config}
 *
 * drizzle.config.ts
 * sits at the project root (outside src), it is effectively an "orphan." It isn't part of TypeScript project, so it doesn't get access to the global types (like process from @types/node) that the other files enjoy.
 *
 * Why we chose to add /// <reference types="node" />
 */

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
