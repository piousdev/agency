import { boolean, index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { client } from './client';
import { user } from './user';

export const userToClient = pgTable(
  'user_to_client',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => client.id, { onDelete: 'cascade' }),
    isPrimaryContact: boolean('is_primary_contact').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // UNIQUE constraint to prevent duplicate user-client associations
    unique('user_to_client_user_client_unique').on(table.userId, table.clientId),
    // B-Tree indexes on foreign keys
    index('user_to_client_user_id_idx').on(table.userId),
    index('user_to_client_client_id_idx').on(table.clientId),
    // B-Tree index on isPrimaryContact for filtering
    index('user_to_client_is_primary_contact_idx').on(table.isPrimaryContact),
    // BRIN index on timestamp
    index('user_to_client_created_at_idx').using('brin', table.createdAt),
  ]
);

export type UserToClient = typeof userToClient.$inferSelect;
export type NewUserToClient = typeof userToClient.$inferInsert;
