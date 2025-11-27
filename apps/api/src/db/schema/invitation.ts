import { boolean, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { client } from './client';
import { userRoleEnum } from './enums';
import { user } from './user';

export const invitation = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('client').notNull(),
    token: varchar('token', { length: 512 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(), // 7 days from creation
    used: boolean('used').default(false).notNull(),
    usedAt: timestamp('used_at'),
    clientId: text('client_id').references(() => client.id, {
      onDelete: 'set null',
    }),
    createdById: text('created_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('invitation_created_by_id_idx').on(table.createdById),
    index('invitation_client_id_idx').on(table.clientId),
    // B-Tree index on email for lookups
    index('invitation_email_idx').on(table.email),
    // B-Tree index on expiresAt for cleanup
    index('invitation_expires_at_idx').on(table.expiresAt),
    // Composite index for finding valid invitations (not used, not expired)
    index('invitation_valid_idx').on(table.used, table.expiresAt),
    // BRIN indexes on timestamps
    index('invitation_created_at_idx').using('brin', table.createdAt),
    index('invitation_updated_at_idx').using('brin', table.updatedAt),
  ]
);

export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;
