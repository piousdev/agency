import { boolean, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { client } from './client';
import { contactRoleEnum } from './enums';

/**
 * Client contacts - multiple contacts per client organization
 * Supports different roles (primary, billing, technical, etc.)
 */
export const clientContact = pgTable(
  'client_contact',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .references(() => client.id, { onDelete: 'cascade' }),
    // Contact details
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    mobile: varchar('mobile', { length: 50 }),
    // Role and position
    role: contactRoleEnum('role').default('stakeholder').notNull(),
    jobTitle: varchar('job_title', { length: 100 }),
    department: varchar('department', { length: 100 }),
    // Preferences
    preferredContactMethod: varchar('preferred_contact_method', { length: 20 }), // email, phone, mobile
    timezone: varchar('timezone', { length: 50 }),
    // Notes
    notes: text('notes'),
    // Status
    active: boolean('active').default(true).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('client_contact_client_id_idx').on(table.clientId),
    index('client_contact_email_idx').on(table.email),
    index('client_contact_role_idx').on(table.role),
    index('client_contact_active_idx').on(table.active),
    index('client_contact_primary_idx').on(table.clientId, table.isPrimary),
  ]
);

export type ClientContact = typeof clientContact.$inferSelect;
export type NewClientContact = typeof clientContact.$inferInsert;
