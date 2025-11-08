import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    role: userRoleEnum('role').default('client').notNull(),
    // Flag to distinguish internal team members from client users
    isInternal: boolean('is_internal').default(false).notNull(),
    // Optional expiration for temporary access (e.g., one-time clients)
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on role for filtering users by role
    index('user_role_idx').on(table.role),
    // B-Tree index on isInternal for filtering team vs client users
    index('user_is_internal_idx').on(table.isInternal),
    // B-Tree index on expiresAt for finding expired accounts
    index('user_expires_at_idx').on(table.expiresAt),
    // BRIN indexes on timestamp columns (space-efficient for time-series data)
    index('user_created_at_idx').using('brin', table.createdAt),
    index('user_updated_at_idx').using('brin', table.updatedAt),
    // Check constraint for email format validation
    check(
      'user_email_check',
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`
    ),
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
