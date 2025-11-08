import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { clientTypeEnum } from './enums';

export const client = pgTable(
  'client',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(), // Company/organization name
    type: clientTypeEnum('type').default('creative').notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(), // Primary contact email
    phone: varchar('phone', { length: 50 }),
    website: varchar('website', { length: 2048 }),
    address: text('address'),
    notes: text('notes'), // Internal notes (not visible to client users)
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on type for filtering
    index('client_type_idx').on(table.type),
    // B-Tree index on active for filtering active clients
    index('client_active_idx').on(table.active),
    // Composite index for common query pattern (active clients by type)
    index('client_active_type_idx').on(table.active, table.type),
    // BRIN indexes on timestamps
    index('client_created_at_idx').using('brin', table.createdAt),
    index('client_updated_at_idx').using('brin', table.updatedAt),
    // Check constraint for email format
    check(
      'client_email_check',
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`
    ),
  ]
);

export type Client = typeof client.$inferSelect;
export type NewClient = typeof client.$inferInsert;
