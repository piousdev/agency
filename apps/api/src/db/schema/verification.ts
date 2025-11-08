import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(), // Usually email
    value: varchar('value', { length: 512 }).notNull(), // Token/code
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on identifier for lookups (e.g., find by email)
    index('verification_identifier_idx').on(table.identifier),
    // Composite index for verification checks (identifier + token)
    index('verification_identifier_value_idx').on(table.identifier, table.value),
    // B-Tree index on expiresAt for cleanup queries
    index('verification_expires_at_idx').on(table.expiresAt),
    // BRIN indexes on timestamps
    index('verification_created_at_idx').using('brin', table.createdAt),
    index('verification_updated_at_idx').using('brin', table.updatedAt),
  ]
);

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
