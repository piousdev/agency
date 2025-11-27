import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { user } from './user';

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: varchar('account_id', { length: 255 }).notNull(),
    providerId: varchar('provider_id', { length: 100 }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on foreign key
    index('account_user_id_idx').on(table.userId),
    // Composite index for common query pattern (find account by user and provider)
    index('account_user_provider_idx').on(table.userId, table.providerId),
    // B-Tree index on providerId for filtering by provider
    index('account_provider_id_idx').on(table.providerId),
    // BRIN indexes on timestamps
    index('account_created_at_idx').using('brin', table.createdAt),
    index('account_updated_at_idx').using('brin', table.updatedAt),
  ]
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
