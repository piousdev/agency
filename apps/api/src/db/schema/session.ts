import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { user } from './user';

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: varchar('token', { length: 512 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: varchar('ip_address', { length: 45 }), // IPv6 max length
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // B-Tree index on foreign key for efficient JOINs
    index('session_user_id_idx').on(table.userId),
    // B-Tree index on expiresAt for cleanup queries
    index('session_expires_at_idx').on(table.expiresAt),
    // BRIN indexes on timestamp columns
    index('session_created_at_idx').using('brin', table.createdAt),
    index('session_updated_at_idx').using('brin', table.updatedAt),
  ]
);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
