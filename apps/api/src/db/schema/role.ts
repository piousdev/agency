import { index, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const role = pgTable(
  'role',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    // JSONB column for flexible permissions
    // Example: { "can_approve_creative": true, "can_view_all_projects": true, "can_assign_tickets": true }
    permissions: jsonb('permissions').$type<Record<string, boolean>>().notNull().default({}),
    // Role category: 'internal' for team roles, 'client' for client-specific roles
    roleType: varchar('role_type', { length: 50 }).notNull().default('internal'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on roleType for filtering team vs client roles
    index('role_type_idx').on(table.roleType),
    // BRIN indexes on timestamps
    index('role_created_at_idx').using('brin', table.createdAt),
    index('role_updated_at_idx').using('brin', table.updatedAt),
  ]
);

export type Role = typeof role.$inferSelect;
export type NewRole = typeof role.$inferInsert;
