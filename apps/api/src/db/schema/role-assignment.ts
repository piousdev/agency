import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { role } from './role';
import { user } from './user';

export const roleAssignment = pgTable(
  'role_assignment',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    // When this role assignment was made
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    // Who assigned this role (for audit trail)
    assignedById: text('assigned_by_id').references(() => user.id, { onDelete: 'set null' }),
  },
  (table) => [
    // UNIQUE constraint to prevent duplicate user-role assignments
    unique('role_assignment_user_role_unique').on(table.userId, table.roleId),
    // B-Tree indexes on foreign keys for efficient JOINs
    index('role_assignment_user_id_idx').on(table.userId),
    index('role_assignment_role_id_idx').on(table.roleId),
    index('role_assignment_assigned_by_id_idx').on(table.assignedById),
    // BRIN index on timestamp
    index('role_assignment_assigned_at_idx').using('brin', table.assignedAt),
  ]
);

export type RoleAssignment = typeof roleAssignment.$inferSelect;
export type NewRoleAssignment = typeof roleAssignment.$inferInsert;
